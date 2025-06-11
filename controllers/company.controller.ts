import {
  RequestHandler,
  Response,
  Request,
  NextFunction,
} from 'express-serve-static-core';
import dbFactory from '../dbOperations/dbFactory';
import Company from '../model/companyModel';
import { catchAsync } from '../utilities/catchAsync';
import { filterCompanyForRegistration } from '../utilities/helper';
import User from '../model/userModel';
import { AppError } from '../utilities/appError';
import Department from '../model/departmentModel';
import { Types } from 'mongoose';

export const getAllCompanies = dbFactory.getAll(Company);

export const getCompany = dbFactory.getOne(Company, {
  path: 'employees',
  select:
    '_id fullName email phoneNumber role departmentId isActive isApproved',
});

export const updateCompany = dbFactory.updateOne(Company, [
  'primaryEmail',
  'secondaryEmail',
  'password',
  'passwordChangedAt',
  'isActive',
  'isVerified',
  'verificationToken',
  'verificationTokenExpiry',
  'resetPasswordToken',
  'resetPasswordTokenExpiry',
  'failedLoginAttempts',
]);

export const getCompaniesFroRegistration = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const documents = await Company.find();
    const filtered = documents.map(filterCompanyForRegistration);
    res.status(200).json({
      status: 'success',
      data: filtered,
    });
  },
);

//NOTE Approve all employees to be emplemented
