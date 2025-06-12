import { Request, Response, NextFunction } from 'express';
import Jwt from 'jsonwebtoken';
import xss from 'xss';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
const { promisify } = require('util');
import Company from '../model/companyModel';
import { cookieOptions, signToken } from '../controllers/authFactory';
import User from '../model/userModel';
import Department from '../model/departmentModel';
import { IDepartment } from '../interfaces/departmentInterface';

declare global {
  namespace Express {
    interface Request {
      department?: IDepartment;
    }
  }
}

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

export const allowedToCompanyOrDepartmentAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const { id } = req.params;
    if (!id) {
      return next(new AppError('Department ID is required', 400));
    }
    const department = await Department.findById(id);

    if (!department) return next(new AppError('Department not found', 404));

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;

    if (token === 'null' || !token)
      return next(new AppError('You are not logged in please log in', 401));

    const decoded = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);

    const company = await Company.findById(decoded.id).select(
      '+passwordChangedAt',
    );

    if (company) {
      if (company?.passwordChangedAfter(decoded.iat))
        return next(
          new AppError('Password has been changed. Please login again!', 401),
        );
      req.company = company;
      req.department = department;
      const newToken = signToken(decoded.id, process.env.JWT_EXPIRES_IN_HOUR);
      res.cookie('jwt', newToken, cookieOptions(req));
      return next();
    }

    const employee = await User.findById(decoded.id).select(
      '+passwordChangedAt',
    );

    if (employee) {
      if (employee.passwordChangedAfter(decoded.iat))
        return next(
          new AppError('Password has been changed. Please login again!', 401),
        );
      req.user = employee;
      const newToken = signToken(decoded.id, process.env.JWT_EXPIRES_IN_HOUR);
      res.cookie('jwt', newToken, cookieOptions(req));
      if (employee.role === 'departmentAdmin') {
        if (
          department.departmentAdmin?.id.toString() !== employee.id.toString()
        )
          return next(
            new AppError(
              'Unauthorized action, You are not the department admin of this department!',
              403,
            ),
          );
        req.department = department;
        return next();
      }
      return next(new AppError('Unauthorized action', 403));
    }
    next(new AppError('Unauthorized action', 403));
  },
);
