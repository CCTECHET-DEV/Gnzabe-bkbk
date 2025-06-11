import Department from '../model/departmentModel';
import dbFactory from '../dbOperations/dbFactory';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { Request, Response, NextFunction } from 'express';
import Company from '../model/companyModel';
import { Types } from 'mongoose';
import User from '../model/userModel';

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

export const assignDepartmentAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('high');
    console.log('req.query:', req.query); // Debugging line
    const { departmentId, employeeId } = req.query;
    const company = await Company.findById(req.company?._id).populate({
      path: 'employees',
      select:
        '_id fullName email phoneNumber role departmentId isActive isApproved',
    }); // Populate employees with specific fields
    console.log(company);
    if (!company) {
      return next(new AppError('Company not found', 404));
    }
    console.log(company.departments, departmentId); // Fixed variable name
    const isDeparmtentBelognToCompany = company.departments.find(
      (department) => department.id.toString() === departmentId,
    );
    if (!isDeparmtentBelognToCompany) {
      return next(
        new AppError(
          'Unauthorized action, Department does not belong to this company!',
          403,
        ),
      );
    }

    const doesEmployeeBelongToCompany = company?.employees?.find(
      (employee) => employee.id.toString() === employeeId,
    );
    if (!doesEmployeeBelongToCompany) {
      return next(
        new AppError(
          'Unauthorized action, Employee does not belong to this company!',
          403,
        ),
      );
    }
    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    if (employee.departmentId?.toString() !== departmentId) {
      return next(
        new AppError(
          'Unauthorized action, Employee does not belong to this department!',
          403,
        ),
      );
    }
    if (employee.role === 'departmentAdmin') {
      return next(new AppError('Employee is already a department admin', 400));
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    if (department.departmentAdmin?.id) {
      return next(new AppError('Department already has an admin', 400));
    }

    department.departmentAdmin = {
      id: employee._id as Types.ObjectId,
      name: employee.fullName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      role: 'departmentAdmin',
    };

    department.save({ validateBeforeSave: false });
    employee.role = 'departmentAdmin';
    employee.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Department admin assigned successfully',
      data: {
        document: department,
      },
    });
  },
);
