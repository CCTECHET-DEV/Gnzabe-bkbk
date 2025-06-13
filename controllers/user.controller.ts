import { NextFunction, Request, Response } from 'express';
import User from '../model/userModel';
import dbFactory from '../dbOperations/dbFactory';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';

export const getAllUsers = dbFactory.getAll(User);
export const getUser = dbFactory.getOne(User);
export const updateUser = dbFactory.updateOne(User, [
  'email',
  'password',
  'role',
  'isActive',
  'isVerified',
  'failedLoginAttempts',
  'verificationToken',
  'verificationTokenExpiry',
  'resetPasswordToken',
  'resetPasswordTokenExpiry',
  'isApproved',
  'createdAt',
  'updatedAt',
]);

export const approveUser = catchAsync(
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

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.user!._id;
    if (id !== req.user?._id) {
      return next(new AppError('You can only update your own profile', 403));
    }
    const { fullName, photo } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullName, photo },
      {
        new: true,
        runValidators: false,
      },
    );
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document: updatedUser,
      },
    });
  },
);
