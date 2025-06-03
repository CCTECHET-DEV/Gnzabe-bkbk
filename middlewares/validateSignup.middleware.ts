import { NextFunction, Request, Response } from 'express';
import User from '../model/userModel';
import { AppError } from '../utilities/appError';

export const validateSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requiredFields = [
    'fullName',
    'email',
    'phoneNumber',
    'password',
    'passwordConfirm',
    'companyId',
    'departmentId',
  ];

  // Check for missing fields
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400),
    );
  }

  // Validate email format
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(req.body.email)) {
    return next(new AppError('Invalid email format', 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(
      new AppError(
        'This email address is already registered. Please use a different email or try logging in.',
        400,
      ),
    );
  }

  // Validate phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(req.body.phoneNumber)) {
    return next(new AppError('Invalid phone number format', 400));
  }

  // Validate password length
  if (req.body.password.length < 8) {
    return next(
      new AppError('Password must be at least 8 characters long', 400),
    );
  }

  // Validate password confirmation
  if (req.body.password !== req.body.passwordConfirm) {
    return next(
      new AppError('Password confirmation does not match password', 400),
    );
  }

  // Validate fullName length
  if (req.body.fullName.length < 3) {
    return next(
      new AppError('Full name must be at least 3 characters long', 400),
    );
  }

  next();
};
