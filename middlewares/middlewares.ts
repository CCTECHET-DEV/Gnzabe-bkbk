import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

export const sanitizeInputs = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sanitize = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

      const value = obj[key];

      if (typeof value === 'string') {
        obj[key] = xss(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitize(value); // Recursively sanitize nested objects
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};
