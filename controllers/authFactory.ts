import { Request, Response, NextFunction, RequestHandler } from 'express';
import Jwt from 'jsonwebtoken';
import { AppError } from '../utilities/appError';
import { catchAsync } from '../utilities/catchAsync';
import { Document, Model } from 'mongoose';
import { IAuthDocument } from '../interfaces/authInterface';

const createSignupController = <T extends Document>(
  Model: Model<T>,
  allowedFields?: string[],
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filteredBody = req.body;

    if (allowedFields?.length) {
      filteredBody = Object.fromEntries(
        allowedFields
          .filter((key) => key in req.body)
          .map((key) => [key, req.body[key]]),
      );
    }

    const document = await Model.create(filteredBody);
    const token = signToken((document._id as string).toString());

    res.cookie('jwt', token, cookieOptions(req));
    res.status(201).json({
      status: 'success',
      token,
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

    if (
      !document ||
      !(await document.isPasswordCorrect(password, document.password))
    ) {
      return next(new AppError('Incorrect credentials', 401));
    }

    // 4. Generate token
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
  createLogoutController,
};
export default factory;
