import { Document, Types } from 'mongoose';
import { IAuthDocument } from './authInterface';

export interface IUser extends IAuthDocument {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  photo: string;

  role: 'employee' | 'admin';
  companyId: string;
  departmentId: string;
  isApproved: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  failedLoginAttemptsMade: number;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  assignedCourses: Types.ObjectId[];
  progress: {
    [courseId: string]: {
      completed: boolean;
      score?: number;
      lastAccessed?: Date;
    };
  };
  certifications: {
    courseId: Types.ObjectId;
    certificateUrl: string;
    awardedAt: Date;
  }[];
  badges: {
    badgeId: Types.ObjectId;
    awardedAt: Date;
  }[];
  examResults: {
    courseId: Types.ObjectId;
    quizScores: number[];
    simulationScores: number[];
  }[];

  // DepartmentAdmin-only fields
  managedEmployees?: Types.ObjectId[];
  preferences: {
    theme: 'light' | 'dark';
    language: 'am' | 'en' | 'om' | 'tg';
  };

  createdAt: Date;
  updatedAt: Date;
  accountLockedUntil?: Date;

  isPasswordCorrect(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  passwordChangedAfter(JWTTimeStamp: number): boolean;

  createPasswordResetToken(): string;
  createVerificationToken(): string;
}
