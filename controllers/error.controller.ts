import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utilities/appError';
import { send } from 'process';

const handleCastErrorDB = (error: MongooseError.CastError) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error: MongoServerError) => {
  const match = error.errmsg.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : '';
  const message = `This value: ${value} has already been taken. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error: MongooseError.ValidationError) => {
  const errors = Object.values(error.errors).map((err) => err.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (error: Error) =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = (error: Error) =>
  new AppError('Token has Expired. Please log in again', 401);

const sendErrorDev = (error: Error | AppError, req: Request, res: Response) => {
  if (error instanceof AppError)
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error,
    });

  res.status(500).json({
    status: 'error',
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorPro = (error: Error | AppError, req: Request, res: Response) => {
  // console.log(error);
  if (error instanceof AppError)
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

const globalErrorHandler = (
  error:
    | Error
    | AppError
    | MongooseError
    | MongoServerError
    | JsonWebTokenError
    | TokenExpiredError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(error);
  if (error instanceof AppError) {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
  }
  if (process.env.NODE_ENV === 'development') sendErrorDev(error, req, res);
  else if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'test'
  ) {
    // console.log(
    //   'production error',
    //   error.name,
    //   error instanceof MongooseError.ValidationError,
    // );

    let err = Object.assign({}, error);
    err.message = error.message;
    if (error instanceof MongooseError.CastError)
      err = handleCastErrorDB(error);
    if (
      error instanceof MongoServerError &&
      'code' in error &&
      error.code === 11000
    )
      err = handleDuplicateFieldsDB(error);
    if (error instanceof MongooseError.ValidationError)
      err = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') err = handleJWTError(error);
    if (error.name === 'TokenExpiredError') err = handleJWTExpiredError(error);

    if (error instanceof AppError) sendErrorPro(error, req, res);
    else sendErrorPro(err, req, res);
  }
};

export default globalErrorHandler;
