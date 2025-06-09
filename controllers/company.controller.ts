import dbFactory from '../dbOperations/dbFactory';
import Company from '../model/companyModel';

export const getAllCompanies = dbFactory.getAll(Company);
export const getCompany = dbFactory.getOne(Company);
export const updateCompany = dbFactory.updateOne(Company, [
  'primaryEmail',
  'secondaryEmail',
  'password',
  'passwordChangedAt',
  'isActive',
  'isVerified',
  'verificationToken',
  'verificationTokenExpiry',
  'resetPasswordToken',
  'resetPasswordTokenExpiry',
  'failedLoginAttempts',
]);
