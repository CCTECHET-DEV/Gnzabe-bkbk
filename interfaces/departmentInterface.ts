import { Document, Types } from 'mongoose';

export interface IDepartmentEmployee {
  id: Types.ObjectId;
  name: string;
  email: string;
  role: 'employee' | 'departmentAdmin';
}
export interface IDepartmentAdmin {
  id: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'departmentAdmin';
}
export interface IDepartment extends Document {
  name: string;
  companyId: Types.ObjectId;
  departmentAdmin?: IDepartmentAdmin;
  employees: IDepartmentEmployee[];
  coursesAssignedToDepartment: Types.ObjectId[];
  createdAt?: Date;
  isActive: boolean;
}
