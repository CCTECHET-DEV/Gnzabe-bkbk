import { Request, Response, NextFunction, RequestHandler } from 'express';
import Jwt from 'jsonwebtoken';
import crypto from 'crypto';
const { promisify } = require('util');
import { AppError } from '../utilities/appError';
import { catchAsync } from '../utilities/catchAsync';
import { Model } from 'mongoose';
import { IAuthDocument } from '../interfaces/authInterface';
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../services/email.service';
import { Session } from '../model/sessionModel';
import { generateOtp } from '../utilities/helper';
import axios from 'axios';
import { create } from 'domain';

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
  sendOtp?: (email: string, otp: string, name?: string) => Promise<void>;
}

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
    const verificationToken = document.createVerificationToken();
    document.save({ validateBeforeSave: false });

    // // ✅ Create session
    // await Session.findOneAndUpdate(
    //   { userId: document._id },
    //   { lastActivityTimestamp: new Date() },
    //   { upsert: true, new: true },
    // );

    // Send verification email if provided
    const userId = (document._id as string).toString();
    const accessToken = signToken(userId, process.env.JWT_EXPIRES_IN_HOUR);

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
      document.verificationToken = undefined;
      document.verificationTokenExpiry = undefined;

      return res.status(201).json({
        status: 'success',
        token: accessToken,
        message: 'Signup successful! Please verify your email.',
        data: {
          document,
        },
      });
    }

    // const refreshToken = signToken(userId);
    res.cookie('jwt', accessToken, cookieOptions(req));
    // res.cookie('refreshToken', refreshToken, cookieOptions(req));

    res.status(201).json({
      status: 'success',
      token: accessToken,
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

const createOtpVerificationController = <T extends IAuthDocument>(
  Model: Model<T>,
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id, otp } = req.query;
    if (!id || !otp || typeof id !== 'string' || typeof otp !== 'string') {
      return next(new AppError('Id and OTP are required', 400));
    }

    const document = await Model.findOne({
      _id: id,
      otp: otp,
      otpExpiry: { $gt: new Date() },
    });

    if (!document) {
      return next(new AppError('Invalid Id or expired OTP', 400));
    }

    document.otp = undefined;
    document.otpExpiry = undefined;
    document.save({ validateBeforeSave: false });

    const accessToken = signToken(
      (document._id as string).toString(),
      process.env.JWT_EXPIRES_IN_HOUR,
    );
    res.cookie('jwt', accessToken, cookieOptions(req));

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully',
      token: accessToken,
      data: {
        document,
      },
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

    if (
      !document ||
      !(await document.isPasswordCorrect(password, document.password))
    ) {
      if (document) {
        document.incrementFailedLoginAttemptsMade();
        await document.save({ validateBeforeSave: false });
      }
      console.log(document, Model, filter);

      return next(new AppError('Incorrect credentials', 401));
    }

    if (!document?.isVerified) {
      return next(
        new AppError('Please verify your email before logging in', 403),
      );
    }
    // 4. Generate token
    document.resetFailedLoginAttemptsMade();
    await document.save({ validateBeforeSave: false });

    // 🔐 Token creation
    const userId = (document._id as string).toString();
    const accessToken = signToken(userId, process.env.JWT_EXPIRES_IN_HOUR);

    // creating otp
    console.log(document, document.mfaEnabled, 'document in login controller');
    if (document.mfaEnabled) {
      if (document.mfaBy === 'email') {
        const otp = generateOtp();
        document.otp = otp;
        document.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await sendOtpEmail(
          document.email || document.primaryEmail,
          otp,
          document.fullName || document.name,
        );
      }

      if (document.mfaBy === 'sms') {
        console.log(`${process.env.GEEZ_URL}phone=${document.phoneNumber}`);
        const response = await axios({
          url: `${process.env.GEEZ_URL}phone=${document.phoneNumber}`,
          method: 'POST',
        });
        console.log(response, 'response from geeZ');

        if (response.data.error) {
          return next(new AppError('Failed to send OTP via SMS', 500));
        }
        const otp = response.data.code;
        document.otp = otp;
        document.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      }
      await document.save({ validateBeforeSave: false });
      return res.status(200).json({
        status: 'success',
        message: `OTP sent to you via ${document.mfaBy} successfully`,
        data: {
          id: document._id,
          otpRequired: true,
        },
      });
    }

    // const refreshToken = signToken(userId);
    res.cookie('jwt', accessToken, cookieOptions(req));
    // res.cookie('refreshToken', refreshToken, cookieOptions(req));

    res
      .status(200)
      .json({ status: 'success', accessToken, data: { document } });
  });

export const createResetLinkController = <T extends IAuthDocument>(
  Model: Model<T>,
  emailField: string,
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email', 400));
    }

    const document = await Model.findOne({
      [emailField]: email,
    } as Record<string, any>);

    if (!document) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'No account with that email.' });
    }
    console.log(document);
    const resetToken = document.createPasswordResetToken();
    await document.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(
      req,
      document[emailField as keyof typeof document] as string,
      (document._id as string).toString(),
      resetToken,
    );

    return res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email',
    });
  });

export const createResetPasswordController = <T extends IAuthDocument>(
  Model: Model<T>,
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id, token, password, passwordConfirm } = req.body;

    // 1. Validate input
    if (!id || !token || !password || !passwordConfirm) {
      return next(new AppError('All fields are required', 400));
    }

    if (password !== passwordConfirm) {
      return next(new AppError("Passwords don't match", 400));
    }

    // 2. Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 3. Find document by email and token
    // const query: any = {
    //   id,
    //   resetPasswordToken: hashedToken,
    //   resetPasswordTokenExpiry: { $gt: Date.now() },
    // };

    const document = await Model.findOne({
      _id: id,
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!document) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // 4. Update password and clear reset token fields
    document.password = password;
    document.passwordConfirm = passwordConfirm;
    document.resetPasswordToken = undefined;
    document.resetPasswordTokenExpiry = undefined;

    await document.save({ validateBeforeSave: true });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  });

const createLogoutController = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.cookie('jwt', 'loggedout', cookieOptions(req));
    // res.cookie('refreshToken', 'loggedout', cookieOptions(req));

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  };
};

// export const createRefreshTokenController = <T extends IAuthDocument>(
//   Model: Model<T>,
// ) =>
//   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     console.log(req.cookies, 'cookies in refresh token controller');
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken) {
//       return next(new AppError('Refresh token missing', 401));
//     }

//     const decoded = await promisify(Jwt.verify)(
//       refreshToken,
//       process.env.JWT_SECRET,
//     );

//     const document = await Model.findById(decoded.id);
//     if (!document) {
//       return next(new AppError('Account no longer exists', 401));
//     }

//     const newAccessToken = signToken(document._id as string);

//     res.cookie('jwt', newAccessToken, cookieOptions(req));
//     res.status(200).json({
//       status: 'success',
//       accessToken: newAccessToken,
//     });
//   });

export function cookieOptions(req: Request) {
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

export function signToken(
  id: string,
  expiresIn = process.env.JWT_EXPIRES_IN,
): string {
  console.log(expiresIn, 'expiresIn');
  return Jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: parseInt(expiresIn!, 10),
  });
}
const factory = {
  createSignupController,
  createLoginController,
  createVerificationController,
  createLogoutController,
  createOtpVerificationController,
  createResetLinkController,
  createResetPasswordController,
  // createRefreshTokenController,
};
export default factory;
