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
import { AppError } from '../utilities/appError';

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
export const getCurrentCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.company) {
      return next(new AppError('No company found with this id', 404));
    }
    console.log(req.company);
    res.status(200).json({
      status: 'success',
      data: {
        document: req.company,
      },
    });
  },
);

//NOTE Approve all employees to be emplemented
