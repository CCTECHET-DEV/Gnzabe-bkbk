import { Document, Types } from 'mongoose';
import { IAuthDocument } from './authInterface';

export interface ICompany extends IAuthDocument {
  name: string;
  primaryEmail: string;
  secondaryEmail?: string;
  phoneNumber: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  logo?: string;

  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;

  failedLoginAttempts: number;
  isActive: boolean;

  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;

  departments: Types.ObjectId[]; // References to Department documents

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
}
