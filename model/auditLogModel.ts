import { Schema, model, Types } from 'mongoose';
import { IAuditLog } from '../interfaces/auditLogInterface';
import { localConnection } from '../config/dbConfig';

const auditLogSchema = new Schema<IAuditLog>(
  {
    performedBy: {
      id: {
        type: Types.ObjectId,
        required: true,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['platformOwner', 'companyAdmin', 'departmentAdmin'],
      },
      name: String,
      email: String,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE_DEPARTMENT',
        'ASSIGN_DEPARTMENT_ADMIN',
        'REVOKE_DEPARTMENT_ADMIN',
        'REMOVE_EMPLOYEE',
        'ADD_EMPLOYEE',
        'ACTIVATE_DEPARTMENT',
        'DEACTIVATE_DEPARTMENT',
      ],
    },
    departmentId: {
      type: Types.ObjectId,
      ref: 'Department',
    },
    employeeId: {
      type: Types.ObjectId,
      ref: 'User',
    },
    companyId: {
      type: Types.ObjectId,
      ref: 'Company',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: Schema.Types.Mixed, // for custom payload
    },
    requestMetadData: {
      ip: {
        type: String,
      },
      device: {
        source: {
          type: String,
        },
        browser: {
          type: String,
        },
        version: {
          type: String,
        },
        os: {
          type: String,
        },
        platform: {
          type: String,
        },
        isMobile: {
          type: Boolean,
        },
        isDesktop: {
          type: Boolean,
        },
      },
    },
  },
  { timestamps: true },
);

const AuditLog = localConnection.model<IAuditLog>('auditLog', auditLogSchema);
export default AuditLog;
