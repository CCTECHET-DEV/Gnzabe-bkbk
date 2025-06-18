import { Request, Response, NextFunction } from 'express';
import useragent from 'express-useragent';
import Jwt from 'jsonwebtoken';
import xss from 'xss';
import geoip from 'geoip-lite';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
const { promisify } = require('util');
import Company from '../model/companyModel';
import { cookieOptions, signToken } from '../controllers/authFactory';
import User from '../model/userModel';
import Department from '../model/departmentModel';
import { IDepartment } from '../interfaces/departmentInterface';
import { IRequestMetaData } from '../interfaces/requestMetaDataInterface';

declare global {
  namespace Express {
    interface Request {
      department?: IDepartment;
      requestMetaData?: IRequestMetaData;
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

export const attachRequestMeta = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // IP address (handles reverse proxy setups like Nginx)
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',').shift() ||
    req.socket.remoteAddress ||
    '';

  // Use express-useragent
  const source = req.headers['user-agent'] || '';
  const ua = useragent.parse(source);
  const geo = geoip.lookup(ip);

  req.requestMetaData = {
    ip,
    location: geo || undefined,
    device: {
      source,
      browser: ua.browser,
      version: ua.version,
      os: ua.os,
      platform: ua.platform,
      isMobile: ua.isMobile,
      isDesktop: ua.isDesktop,
    },
  };

  console.log(req.requestMetaData, ' Request Meta Data');

  next();
};

export const allowedToCompanyOrDepartmentAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const { departmentId } = req.query;
    if (!departmentId) {
      return next(new AppError('Department ID is required', 400));
    }
    const department = await Department.findById(departmentId);

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

    const admin = await User.findById(decoded.id).select('+passwordChangedAt');

    if (admin) {
      if (admin.passwordChangedAfter(decoded.iat))
        return next(
          new AppError('Password has been changed. Please login again!', 401),
        );

      req.user = admin;
      const newToken = signToken(decoded.id, process.env.JWT_EXPIRES_IN_HOUR);
      res.cookie('jwt', newToken, cookieOptions(req));
      if (admin.role === 'departmentAdmin') {
        console.log(department.departmentAdmin, admin);
        if (department.departmentAdmin?.id?.toString() !== admin.id.toString())
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

export const addCompanyIdToRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.companyId = req.company?._id;
    next();
  },
);

export const doesEmployeeBelongToCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { employeeId } = req.query;
    if (!employeeId) {
      return next(new AppError('Employee ID is required', 400));
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    if (!req.company || !req.company._id) {
      return next(new AppError('Company context missing in request', 500));
    }

    if (employee.companyId.toString() !== req.company._id.toString()) {
      return next(
        new AppError(
          'Unauthorized action, Employee does not belong to this company!',
          403,
        ),
      );
    }

    next();
  },
);

export const doesDepartmentBelongToCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const departmentId = req.query.departmentId || req.params.id;

    if (!departmentId) {
      return next(new AppError('Department ID is required', 400));
    }

    if (!req.company || !req.company._id) {
      return next(new AppError('Company context missing in request', 500));
    }

    const isDepartmentBelongsToCompany = req.company.departments.find(
      (department) => department.id.toString() === departmentId.toString(),
    );

    if (!isDepartmentBelongsToCompany) {
      return next(
        new AppError(
          'Unauthorized action, Department does not belong to this company!',
          403,
        ),
      );
    }

    next();
  },
);
