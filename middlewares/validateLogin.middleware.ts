import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utilities/appError';

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Validate email format
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Invalid email format', 400));
  }

  // Validate password length
  if (password.length < 8) {
    return next(
      new AppError('Password must be at least 8 characters long', 400),
    );
  }

  next();
};
