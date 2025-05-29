import { Request, Response, NextFunction, RequestHandler } from "express";

export function catchAsync(fn: Function): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error) => {
      next(err);
    });
  };
}
