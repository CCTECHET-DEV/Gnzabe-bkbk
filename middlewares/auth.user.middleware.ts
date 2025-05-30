import { NextFunction, Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
const { promisify } = require('util');
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { IUser } from '../interfaces/userInterface';
import User from '../model/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protectUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;

    if (token === 'null' || !token)
      return next(new AppError('You are not logged in please log in', 401));

    const decoded = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user)
      return next(
        new AppError(
          'The User blongs to this token does not exist anymore',
          401,
        ),
      );

    if (user.passwordChangedAfter(decoded.iat))
      return next(
        new AppError('Password has been changed. Please login again!', 401),
      );
    req.user = user;
    next();
  },
);
