import { Document } from 'mongoose';

export interface IAuthDocument extends Document {
  fullName: string;
  name: string;
  email: string;
  primaryEmail: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  phoneNumber: string;

  otp?: string;
  otpExpiry?: Date;
  mfaEnabled: boolean;
  mfaBy: 'email' | 'sms' | 'authenticator';

  password: string;
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
