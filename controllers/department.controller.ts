import Department from '../model/departmentModel';
import dbFactory from '../dbOperations/dbFactory';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { Request, Response, NextFunction } from 'express';
import Company from '../model/companyModel';
import { Types } from 'mongoose';
import User from '../model/userModel';
import { createAuditLog } from './auditLog.controller';
import { logAction } from '../utilities/auditLogger';
import { timeStamp } from 'console';
import { sendNotification } from '../services/notification.service';

// export const getAllDepartments = dbFactory.getAll(Department);
export const getDepartment = dbFactory.getOne(Department);

// export const createDepartment = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const companyId = req.company?._id;
//     if (!companyId) return next(new AppError('Company ID is required', 400));
//     const company = await Company.findById(companyId);
//     const { name } = req.body;

//     const department = await Department.create({ name, companyId });

//     company!.departments.push({ id: department.id, name: department.name });
//     await company!.save();

//     res.status(201).json({
//       status: 'success',
//       message: 'Department created successfully',
//       data: {
//         department,
//       },
//     });
//   },
// );
export const createDepartment = dbFactory.createOne(Department);

export const assignDepartmentAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('high');
    console.log('req.query:', req.query); // Debugging line
    const { departmentId, employeeId } = req.query;
    const company = req.company; // Populate employees with specific fields
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
    // if (!employee.isVerified) {
    //   return next(new AppError('Employee is not verified', 403));
    // }
    // if (!employee.isApproved) {
    //   return next(new AppError('Employee is not approved by company', 403));
    // }
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
    const error = await logAction({
      performedBy: {
        id: req.company?._id as Types.ObjectId,
        name: req.company?.name,
        email: req.user?.email,
      },
      action: 'ASSIGN_DEPARTMENT_ADMIN',
      departmentId: department._id as Types.ObjectId,
      companyId: req.company?._id as Types.ObjectId,
      timeStamp: new Date(),
      requestMetadData: req.requestMetaData,
    });
    if (error) {
      return next(error);
    }
    res.status(200).json({
      status: 'success',
      message: 'Department admin assigned successfully',
      data: {
        document: department,
      },
    });
  },
);

export const revokeDepartmentAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { departmentId, employeeId } = req.query;
    const company = req.company;

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    if (department.departmentAdmin?.id.toString() !== employeeId) {
      return next(
        new AppError(
          'Unauthorized action, Employee is not the department admin of this department!',
          403,
        ),
      );
    }

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

    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    employee.role = 'employee';
    employee.save({ validateBeforeSave: false });

    const error = await logAction({
      performedBy: {
        id: req.company?._id as Types.ObjectId,
        name: req.company?.name,
        email: req.user?.email,
      },
      action: 'REVOKE_DEPARTMENT_ADMIN',
      departmentId: department._id as Types.ObjectId,
      companyId: req.company?._id as Types.ObjectId,
      timeStamp: new Date(),
      requestMetadData: req.requestMetaData,
    });
    if (error) {
      return next(error);
    }

    res.status(200).json({
      status: 'success',
      message: 'Department admin revoked successfully',
      data: {
        document: department,
      },
    });
  },
);

export const removeEmployeeFromDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const { id } = req.params;
    const { employeeId } = req.query;

    if (!employeeId) {
      return next(new AppError('Employee ID is required', 400));
    }

    if (req.user?.id.toString() === employeeId.toString())
      return next(new AppError('You are not allowed to remove your self', 403));

    const department = req.department;
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    const employee = await User.findById(employeeId);
    if (!employee) return next(new AppError('Employee not found!', 404));

    const employeeIndex = department.employees.findIndex(
      (emp) => emp.id.toString() === employeeId,
    );

    if (employeeIndex === -1) {
      return next(new AppError('Employee not found in this department', 404));
    }
    if (department?.departmentAdmin?.id?.toString() === employeeId)
      return next(
        new AppError(
          'Cannot remove department admin from the department. Please revoke admin preivilage fisrt.',
          400,
        ),
      );

    department.employees.splice(employeeIndex, 1);
    employee.departmentId = null;
    await department.save({ validateBeforeSave: false });
    await employee.save({ validateBeforeSave: false });

    const error = await logAction({
      performedBy: {
        id: req.company?._id as Types.ObjectId,
        name: req.company?.name,
        email: req.user?.email,
      },
      action: 'REMOVE_EMPLOYEE_FROM_DEPARTMENT',
      departmentId: department._id as Types.ObjectId,
      companyId: req.company?._id as Types.ObjectId,
      timeStamp: new Date(),
      requestMetadData: req.requestMetaData,
    });
    if (error) {
      return next(error);
    }

    res.status(200).json({
      status: 'success',
      message: 'Employee removed from department successfully',
      data: {
        document: department,
      },
    });
  },
);

export const addEmployeeToDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { employeeId, departmentId } = req.query;
    if (!employeeId) {
      return next(new AppError('Employee ID is required', 400));
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    const company = req.company;
    if (!company) {
      return next(new AppError('Company not found', 404));
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

    const doesDepartmentBelongToCompany = company?.departments?.find(
      (dept) => dept.id.toString() === department.id.toString(),
    );
    if (!doesDepartmentBelongToCompany) {
      return next(
        new AppError(
          'Unauthorized action, Department does not belong to this company!',
          403,
        ),
      );
    }

    const employee = await User.findById(employeeId);
    if (!employee) return next(new AppError('Employee not found!', 404));

    if (employee.departmentId) {
      return next(new AppError('Employee already assigned to department', 400));
    }

    employee.departmentId = department.id;
    await employee.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Employee added to department successfully',
      data: {
        document: employee,
      },
    });
  },
);

export const deactiveDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const departmentId = req.query.departmentId || req.params.id;
    const department = await Department.findById(departmentId);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }
    if (department.isActive === false) {
      return next(new AppError('Department is already deactivated', 400));
    }
    department.isActive = false;
    await department.save({ validateBeforeSave: false });
    const error = await logAction({
      performedBy: {
        id: req.company?._id as Types.ObjectId,
        name: req.company?.name,
        email: req.user?.email,
      },
      action: 'DEACTIVATE_DEPARTMENT',
      departmentId: department._id as Types.ObjectId,
      companyId: req.company?._id as Types.ObjectId,
      timeStamp: new Date(),
      requestMetadData: req.requestMetaData,
    });
    if (error) {
      return next(error);
    }
    await sendNotification({
      recipientId: (req.company?._id as string) || (req.user?._id as string),
      recipientModel: 'Company', // or 'User' if appropriate
      type: 'otp_verified',
      title: 'Department Deactivated',
      message: `You have successfully verified otp verification in at`,
    });

    console.log('account deactivated');
    res.status(200).json({
      status: 'success',
      message: 'Department deactivated successfully',
      data: {
        document: department,
      },
    });
  },
);

export const activateDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const departmentId = req.query.departmentId || req.params.id;
    const department = await Department.findById(departmentId);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }
    if (department.isActive === true) {
      return next(new AppError('Department is already active', 400));
    }
    department.isActive = true;
    await department.save({ validateBeforeSave: false });
    const error = await logAction({
      performedBy: {
        id: req.company?._id as Types.ObjectId,
        name: req.company?.name,
        email: req.user?.email,
      },
      action: 'ACTIVATE_DEPARTMENT',
      departmentId: department._id as Types.ObjectId,
      companyId: req.company?._id as Types.ObjectId,
      timeStamp: new Date(),
      requestMetadData: req.requestMetaData,
    });
    if (error) {
      return next(error);
    }

    await sendNotification({
      recipientId: (req.company?._id as string) || (req.user?._id as string),
      recipientModel: 'Company', // or 'User' if appropriate
      type: 'otp_verified',
      title: 'Department Deactivated',
      message: `You have successfully verified otp verification in at`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Department activated successfully',
      data: {
        document: department,
      },
    });
  },
);
