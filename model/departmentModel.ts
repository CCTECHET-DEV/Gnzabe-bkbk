import { Schema, Model } from 'mongoose';
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
    required: true,
  },

  departmentAdmin: {
    type: Schema.Types.ObjectId,
    unique: true, // One admin per department
    sparse: true, // in case admin is not yet assigned
  },

  employees: [
    {
      type: Schema.Types.ObjectId,
      name: String,
      role: {
        type: String,
        enum: ['employee', 'departmentAdmin'], // Default role for employees
        default: 'employee',
      }, // Default role for employees
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

// Ensure department name is unique within a company
DepartmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

const Department: Model<IDepartment> = cloudConnection.model<IDepartment>(
  'Department',
  DepartmentSchema,
);

export default Department;
