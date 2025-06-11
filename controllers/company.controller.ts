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

export const approveCompnayEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const companyId = req.company?._id;
    const { id } = req.params;
    console.log(id);
    const employee = await User.findById(id);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    console.log(employee, req.company);
    if (employee.companyId.toString() !== companyId?.toString()) {
      return next(
        new AppError(
          'Unauthorized action, Employee does not belong to this company!',
          403,
        ),
      );
    }
    if (employee.isApproved) {
      return next(new AppError('Employee is already approved', 400));
    }
    employee.isApproved = true;
    await employee.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Employee approved successfully',
      data: {
        document: employee,
      },
    });
  },
);

//NOTE Approve all employees to be emplemented
