import { Document } from 'mongoose';

export interface IAuthDocument extends Document {
  password: string;
  isPasswordCorrect(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
}
