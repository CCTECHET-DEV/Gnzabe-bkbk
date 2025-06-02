import { Document } from 'mongoose';

export interface IAuthDocument extends Document {
  fullName: string;
  name: string;
  email: string;
  primaryEmail: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  password: string;
  isPasswordCorrect(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  createPasswordResetToken(): string;
  createVerificationToken(): string;
}
