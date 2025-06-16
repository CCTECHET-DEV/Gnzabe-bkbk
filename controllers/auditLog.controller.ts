import dbFactory from '../dbOperations/dbFactory';
import AuditLog from '../model/auditLogModel';

export const createAuditLog = dbFactory.createOne(AuditLog);
