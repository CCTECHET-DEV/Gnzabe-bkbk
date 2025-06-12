import { Schema, Model } from 'mongoose';
import { cloudConnection } from '../config/dbConfig';
import { IDepartment } from '../interfaces/departmentInterface';

const employeeSubSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['employee', 'departmentAdmin'], // Default role for employees
      default: 'employee',
    }, // Default role for employees
  },
  { _id: false }, // 🚫 disables auto _id for each department item
);

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
    id: {
      type: Schema.Types.ObjectId,
      required: false, // Not required, can be null
      default: null,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    email: {
      type: String,
      required: false,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: false,
      default: null,
    },
  },

  employees: [employeeSubSchema],

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

// Unique index for departmentAdmin.id, only when departmentAdmin.id is not null
DepartmentSchema.index(
  { 'departmentAdmin.id': 1 },
  { unique: true, partialFilterExpression: { 'departmentAdmin.id': { $type: 'objectId' } } }
);

const Department: Model<IDepartment> = cloudConnection.model<IDepartment>(
  'Department',
  DepartmentSchema,
);

export default Department;
