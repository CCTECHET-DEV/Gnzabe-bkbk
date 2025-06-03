import { Request, Response, NextFunction, RequestHandler } from 'express';
import Jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../utilities/appError';
import { catchAsync } from '../utilities/catchAsync';
import { Model } from 'mongoose';
import { IAuthDocument } from '../interfaces/authInterface';
import { sendVerificationEmail } from '../services/email.service';

interface SignupControllerOptions {
  allowedFields?: string[];
  emailField: string;
  nameField?: string;
  sendVerificationEmail?: (
    req: Request,
    email: string,
    id: string,
    token: string,
    name?: string,
  ) => Promise<void>;
}

// const createSignupController = <T extends Document>(
//   Model: Model<T>,
//   allowedFields?: string[],
// ): RequestHandler =>
//   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     let filteredBody = req.body;

//     if (allowedFields?.length) {
//       filteredBody = Object.fromEntries(
//         allowedFields
//           .filter((key) => key in req.body)
//           .map((key) => [key, req.body[key]]),
//       );
//     }

//     const document = await Model.create(filteredBody);
//     const token = signToken((document._id as string).toString());

//     res.cookie('jwt', token, cookieOptions(req));
//     res.status(201).json({
//       status: 'success',
//       token,
//       data: {
//         document,
//       },
//     });
//   });

const createSignupController = <T extends IAuthDocument>(
  Model: Model<T>,
  options: SignupControllerOptions,
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filteredBody = req.body;

    if (options.allowedFields?.length) {
      filteredBody = Object.fromEntries(
        options.allowedFields
          .filter((key) => key in req.body)
          .map((key) => [key, req.body[key]]),
      );
    }

    const document = await Model.create(filteredBody);
    const token = signToken((document._id as string).toString());
    const verificationToken = document.createVerificationToken();
    document.save({ validateBeforeSave: false });

    // Send verification email if provided
    if (options.sendVerificationEmail) {
      const email = (document as any)[options.emailField];
      const name = options.nameField
        ? (document as any)[options.nameField]
        : undefined;

      await options.sendVerificationEmail(
        req,
        email,
        (document._id as string).toString(),
        verificationToken,
        name,
      );
    }

    res.cookie('jwt', token, cookieOptions(req));
    res.status(201).json({
      status: 'success',
      token,
      data: {
        document,
      },
    });
  });

const createVerificationController = <T extends IAuthDocument>(
  Model: Model<T>,
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, id } = req.query;
    console.log(token, id, 'token and id');
    if (!token || !id || typeof token !== 'string' || typeof id !== 'string') {
      return next(new AppError('Token and ID are required', 400));
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const document = await Model.findOne({
      _id: id,
      verificationToken: hashedToken,
    });
    if (!document) {
      return next(
        new AppError('Invalid Id or expired verification token', 400),
      );
    }
    if (document.verificationTokenExpiry!.getTime() < Date.now()) {
      const newToken = document.createVerificationToken();
      await document.save({ validateBeforeSave: false });
      sendVerificationEmail(
        req,
        document.email || document.primaryEmail,
        id,
        newToken,
        document.fullName || document.name,
      );
      return next(
        new AppError(
          'Verification token has expired! We have sent you new email please verify again!',
          400,
        ),
      );
    }
    document.isVerified = true;
    document.verificationToken = undefined;
    document.verificationTokenExpiry = undefined;
    document.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  });

const createLoginController = <T extends IAuthDocument>(
  Model: Model<T>,
  requiredFields: string[],
  findBy: string[],
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validate required fields
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Missing required field(s): ${missingFields.join(', ')}`,
          400,
        ),
      );
    }

    // 2. Build dynamic query filter from findBy array
    const filter: Record<string, any> = {};
    for (const key of findBy) {
      if (req.body[key]) {
        filter[key] = req.body[key];
      }
    }

    if (Object.keys(filter).length === 0) {
      return next(
        new AppError(
          `At least one valid identifier is required: ${findBy.join(', ')}`,
          400,
        ),
      );
    }

    // 3. Fetch document by filter
    const document = await Model.findOne(filter).select('+password');

    const password = req.body.password;
    if (document?.isLocked) {
      return next(
        new AppError(
          'Account is locked due to too many failed login attempts. Please try again later.',
          403,
        ),
      );
    }
    if (!document?.isVerified) {
      return next(
        new AppError('Please verify your email before logging in', 403),
      );
    }
    if (
      !document ||
      !(await document.isPasswordCorrect(password, document.password))
    ) {
      if (document) {
        document.incrementFailedLoginAttemptsMade();
        await document.save({ validateBeforeSave: false });
      }
      return next(new AppError('Incorrect credentials', 401));
    }

    // 4. Generate token
    document.resetFailedLoginAttemptsMade();
    await document.save({ validateBeforeSave: false });
    const token = signToken((document._id as string).toString());
    res
      .status(200)
      .cookie('jwt', token, cookieOptions(req))
      .json({ status: 'success', token, data: { document } });
  });

const createLogoutController = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.cookie('jwt', 'loggedout', cookieOptions(req));

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  };
};
function cookieOptions(req: Request) {
  return {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1_000,
    ),
    httpOnly: true,
    sameSite: 'lax' as const,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    // domain: '.yourdomain.com',
  };
}

function signToken(id: string): string {
  return Jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN!, 10),
  });
}
const factory = {
  createSignupController,
  createLoginController,
  createVerificationController,
  createLogoutController,
};
export default factory;
