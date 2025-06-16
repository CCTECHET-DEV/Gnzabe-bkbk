import { Document, Types } from 'mongoose';
import { IRequestMetaData } from './requestMetaDataInterface';

export interface IAuditLog extends Document {
  performedBy: {
    id: Types.ObjectId;
    role?: string;
    name: string;
    email: string;
  };
  action: string;
  companyId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  employeeId?: Types.ObjectId;
  details?: Record<string, any>;
  timestamp?: Date;
  requestMetadData?: IRequestMetaData;
}
