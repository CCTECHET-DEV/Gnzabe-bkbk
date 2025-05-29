import { IUser } from '../interfaces/userInterface';
import User from '../model/userModel';
import authFactory from './authFactory';

export const signupUser = authFactory.createSignupController<IUser>(User, [
  'fullName',
  'email',
  'phoneNumber',
  'password',
  'passwordConfirm',
  'companyId',
  'departmentId',
]);

export const loginUser = authFactory.createLoginController<IUser>(User);
