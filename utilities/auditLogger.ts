import { NextFunction } from 'express';
import { IAuditLog } from '../interfaces/auditLogInterface';
import AuditLog from '../model/auditLogModel';
import { AppError } from './appError';

export const logAction = async (params: any): Promise<Error | null> => {
  try {
    await AuditLog.create(params);
    return null;
  } catch (err) {
    console.log(err, 'Error logging action');
    return new AppError('Failed to log action', 500);
  }
};
