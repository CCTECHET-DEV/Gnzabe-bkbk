import Department from '../model/departmentModel';
import dbFactory from '../dbOperations/dbFactory';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { Request, Response, NextFunction } from 'express';
import Company from '../model/companyModel';

export const getAllDepartments = dbFactory.getAll(Department);
export const getDepartment = dbFactory.getOne(Department);

export const createDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.company?._id;
    if (!companyId) return next(new AppError('Company ID is required', 400));
    const company = await Company.findById(companyId);
    const { name } = req.body;

    const department = await Department.create({ name, companyId });

    company!.departments.push({ id: department.id, name: department.name });
    await company!.save();

    res.status(201).json({
      status: 'success',
      message: 'Department created successfully',
      data: {
        department,
      },
    });
  },
);
