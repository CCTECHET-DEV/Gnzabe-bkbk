import { Document } from 'mongoose';

export interface IAuthDocument extends Document {
  fullName: string;
  name: string;
  email: string;
  primaryEmail: string;

  password: string;
  passwordConfirm?: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;

  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  phoneNumber: string;

  otp?: string;
  otpExpiry?: Date;
  mfaEnabled: boolean;
  mfaBy: 'email' | 'sms' | 'authenticator';

  isLocked: boolean;
  isPasswordCorrect(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  createPasswordResetToken(): string;
  createVerificationToken(): string;
  resetFailedLoginAttemptsMade(): Promise<void>;
  incrementFailedLoginAttemptsMade(): Promise<void>;
}
