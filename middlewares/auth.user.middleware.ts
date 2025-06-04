import { NextFunction, Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
const { promisify } = require('util');
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { IUser } from '../interfaces/userInterface';
import User from '../model/userModel';
import { decode } from 'punycode';
import { Session } from '../model/sessionModel';
import { cookieOptions, signToken } from '../controllers/authFactory';

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
    // const decoded1 = await promisify(Jwt.verify)(
    //   req.cookies.refreshToken,
    //   process.env.JWT_SECRET,
    // );

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

    const newToken = signToken(decoded.id, process.env.JWT_EXPIRES_IN_HOUR);
    res.cookie('jwt', newToken, cookieOptions(req));

    req.user = user;
    next();
  },
);

export const renewUserAccessTokenIfSessionActive = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    // Token expired, check if session is still valid
    const decoded = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);
    const session = await Session.findOne({ userId: decoded.id });

    if (
      !session ||
      Date.now() - new Date(session.lastActivityTimestamp).getTime() >
        15 * 60 * 1000
    ) {
      res.cookie('jwt', 'loggedout', cookieOptions(req));

      return next(
        new AppError(
          'Session expired due to inactivity. Please login again.',
          401,
        ),
      );
    }

    // Session still active → issue new token
    session.lastActivityTimestamp = new Date();
    await session.save();
    const newToken = signToken(decoded.id, process.env.JWT_EXPIRES_IN_HOUR);
    res.cookie('jwt', newToken, cookieOptions(req));
    // req.user = (await User.findById(decoded.id)) || undefined;
    next();
  },
);
