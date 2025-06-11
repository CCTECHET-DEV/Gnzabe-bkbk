import { Document, Types } from 'mongoose';
import { IAuthDocument } from './authInterface';

export interface IEmployee {
  _id: Types.ObjectId | string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  companyId: Types.ObjectId | string;
  departmentId: Types.ObjectId | string;
  isActive: boolean;
  isApproved: boolean;
  id: Types.ObjectId | string;
}

export interface ICompany extends IAuthDocument {
  name: string;
  primaryEmail: string;
  secondaryEmail?: string;
  phoneNumber: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  logo?: string;

  // virtual properties
  employees?: IEmployee[];

  otp?: string;
  otpExpiry?: Date;
  mfaEnabled: boolean;
  mfaBy: 'email' | 'sms' | 'authenticator';

  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;

  failedLoginAttemptsMade: number;
  isActive: boolean;

  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;

  departments: {
    id: Types.ObjectId;
    name: string;
  }[]; // References to Department documents

  preferences: {
    theme: 'light' | 'dark';
    language: 'am' | 'en' | 'om' | 'tg';
  };

  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;

  passwordChangedAfter(JWTTimeStamp: number): boolean;
  createPasswordResetToken(): string;
  createVerificationToken(): string;
}
