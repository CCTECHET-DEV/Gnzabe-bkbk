import { NextFunction, Request, Response } from 'express';
import User from '../model/userModel';
import dbFactory from '../dbOperations/dbFactory';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { Types } from 'mongoose';
import { logAction } from '../utilities/auditLogger';

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
    const { employeeId } = req.query;
    console.log(employeeId);
    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    console.log(employee);
    if (
      employee.companyId.toString() !== req.department?.companyId.toString()
    ) {
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
    if (req.user) {
      if (employee.departmentId?.toString() !== req.department.id.toString()) {
        return next(
          new AppError(
            'Unauthorized action, Employee does not belong to this department!',
            403,
          ),
        );
      }
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

export const disApproveUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { employeeId } = req.query;
    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    if (
      employee.companyId.toString() !== req.department?.companyId.toString()
    ) {
      return next(
        new AppError(
          'Unauthorized action, Employee does not belong to this company!',
          403,
        ),
      );
    }
    if (!employee.isApproved) {
      return next(new AppError('Employee is not approved!', 400));
    }
    employee.isApproved = false;
    await employee.save({ validateBeforeSave: false });

    // Log the disapproval action
    const error = await logAction({
      performedBy: {
        id:
          (req.company?._id as Types.ObjectId) ||
          (req.user?._id as Types.ObjectId),
        name: req.user?.fullName || req.company?.name,
        email: req.user?.email || req.company?.primaryEmail,
      },
      action: 'DISAPPROVE_EMPLOYEE',
      employeeId: employee._id as Types.ObjectId,
      companyId: employee.companyId as Types.ObjectId,
      timestamp: new Date(),
      requestMetadData: req.requestMetaData,
    });
    if (error) {
      console.log(req.requestMetaData);
      return next(error);
    }
    res.status(200).json({
      status: 'success',
      message: 'Employee disapproved successfully',
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
