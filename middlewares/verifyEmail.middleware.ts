import { Request, Response, NextFunction, RequestHandler } from 'express';
const ZeroBounceSDK = require('@zerobounce/zero-bounce-sdk');
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';

const zeroBounce = new ZeroBounceSDK();

export function verifyEmails(fieldNames: string[]): RequestHandler {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      zeroBounce.init(process.env.ZEROBOUNCE_API_KEY!);

      for (const field of fieldNames) {
        const raw = req.body[field];
        if (!raw) {
          return next(new AppError(`Missing email field "${field}"`, 400));
        }

        const emails = Array.isArray(raw) ? raw : [raw];
        for (const email of emails) {
          const { status } = await zeroBounce.validateEmail(
            email,
            req.ip || '127.0.0.1',
          );
          if (status !== 'valid') {
            return next(new AppError(`Email "${email}" is not valid`, 400));
          }
        }
      }

      // All fields passed – no need to store anything
      next();
    },
  );
}
