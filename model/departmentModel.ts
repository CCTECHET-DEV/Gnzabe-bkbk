import mongoose, { Schema, Model } from 'mongoose';
import { cloudConnection } from '../config/dbConfig';
import { IDepartment } from '../interfaces/departmentInterface';

const DepartmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company', // refers to Company (Super Admin)
    required: true,
  },

  departmentAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true, // One admin per department
    sparse: true, // in case admin is not yet assigned
  },

  employees: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  coursesAssignedToDepartment: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

const Department: Model<IDepartment> = cloudConnection.model<IDepartment>(
  'Department',
  DepartmentSchema,
);
export default Department;
