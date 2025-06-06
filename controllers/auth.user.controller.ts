import { IUser } from '../interfaces/userInterface';
import User from '../model/userModel';
import { sendOtpEmail, sendVerificationEmail } from '../services/email.service';
import authFactory from './authFactory';

export const signupUser = authFactory.createSignupController<IUser>(User, {
  allowedFields: [
    'fullName',
    'email',
    'phoneNumber',
    'password',
    'passwordConfirm',
    'companyId',
    'departmentId',
  ],
  emailField: 'email',
  nameField: 'fullName',
  sendVerificationEmail: async (req, email, userId, token, name) => {
    await sendVerificationEmail(req, email, userId, token, name);
  },
  sendOtp: async (email, otp, name) => {
    await sendOtpEmail(email, otp, name);
  },
});
export const verifyUser = authFactory.createVerificationController(User);
export const loginUser = authFactory.createLoginController<IUser>(
  User,
  ['email', 'password'],
  ['email'],
);

export const logoutUser = authFactory.createLogoutController();
export const verifyUserOtp = authFactory.createOtpVerificationController(User);
export const getUserPasswordResetToken = authFactory.createResetLinkController(
  User,
  'email',
);
export const resetUserPassword =
  authFactory.createResetPasswordController(User);

// export const userRefreshToken = authFactory.createRefreshTokenController(User);
