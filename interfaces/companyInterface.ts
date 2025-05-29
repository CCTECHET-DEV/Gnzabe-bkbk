import { Document, Types } from 'mongoose';

export interface ICompany extends Document {
  companyName: string;
  primaryEmail: string;
  secondaryEmail?: string;
  phoneNumber: string;
  password: string;

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
}
