import { Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  companyId: Types.ObjectId;
  departmentAdmin?: Types.ObjectId | null;
  employees: Types.ObjectId[];
  coursesAssignedToDepartment: Types.ObjectId[];
  createdAt?: Date;
  isActive: boolean;
}
