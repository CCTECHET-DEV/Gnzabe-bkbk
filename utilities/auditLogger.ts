import { NextFunction } from 'express';
import { IAuditLog } from '../interfaces/auditLogInterface';
import AuditLog from '../model/auditLogModel';
import { AppError } from './appError';

export const logAction = async (next: NextFunction, params: any) => {
  try {
    await AuditLog.create(params);
  } catch (err) {
    return next(new AppError('Failed to log action', 500));
  }
};
