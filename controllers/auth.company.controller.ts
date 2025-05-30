import { ICompany } from '../interfaces/companyInterface';
import { Company } from '../model/companyModel';
import authFactory from './authFactory';

export const signupCompany = authFactory.createSignupController<ICompany>(
  Company,
  [
    'name',
    'primaryEmail',
    'secondaryEmail',
    'phoneNumber',
    'password',
    'passwordConfirm',
  ],
);
