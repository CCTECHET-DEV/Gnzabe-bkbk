import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utilities/appError';

export const validationErrorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    console.log('\n=== Validation Error ===');
    console.log('Status:', err.statusCode);
    console.log('Message:', err.message);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('=====================\n');
  }
  next(err);
};
