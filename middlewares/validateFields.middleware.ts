import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utilities/appError';

export function requireBodyFields(requiredFields: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const missing = requiredFields.filter(
      (key) =>
        !(key in req.body) ||
        req.body[key] === null ||
        req.body[key] === undefined ||
        (typeof req.body[key] === 'string' && req.body[key].trim() === ''),
    );
    if (missing.length > 0) {
      return next(
        new AppError(
          `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(
            ', ',
          )}`,
          400,
        ),
      );
    }
    next();
  };
}
