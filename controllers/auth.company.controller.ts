import { ICompany } from '../interfaces/companyInterface';
import { Company } from '../model/companyModel';
import { sendVerificationEmail } from '../services/email.service';
import authFactory from './authFactory';

export const signupCompany = authFactory.createSignupController<ICompany>(
  Company,
  {
    allowedFields: [
      'name',
      'primaryEmail',
      'secondaryEmail',
      'phoneNumber',
      'password',
      'passwordConfirm',
    ],

    emailField: 'primaryEmail',
    nameField: 'name',
    sendVerificationEmail: async (
      req,
      email,
      companyId,
      verificationUrl,
      name,
    ) => {
      await sendVerificationEmail(req, email, companyId, verificationUrl, name);
    },
  },
);

export const loginCompany = authFactory.createLoginController<ICompany>(
  Company,
  ['primaryEmail', 'password'],
  ['primaryEmail'],
);

export const logoutCompany = authFactory.createLogoutController();
