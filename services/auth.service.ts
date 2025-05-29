import { NextFunction, Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import Jwt from 'jsonwebtoken';
import { AppError } from '../utilities/appError';
import { catchAsync } from '../utilities/catchAsync';

export interface SignupData {
  email: string;
  password: string;
  [key: string]: any;
}

export class AuthService {
  constructor(private readonly Model: Model<Document & { password: string }>) {}

  async signup(
    data: SignupData,
  ): Promise<{ token: string; document: Document }> {
    const document = await this.Model.create(data);
    const token = this.signToken((document._id as any).toString());
    return { token, document };
    // return this.signToken((documemnt._id as any).toString());
  }

  // async login(email: string, password: string): Promise<string> {
  //   const doc = await this.Model.findOne({ email }).select(
  //     '+password +isActive',
  //   );
  //   if (!doc) throw new Error('Invalid credentials');

  //   const isMatch = await bcrypt.compare(password, doc.password);
  //   if (!isMatch) throw new Error('Invalid credentials');

  //   // example of gatekeeping based on isActive
  //   // if (!doc.isActive) throw new Error('Please activate your account');

  //   return this.signToken((doc._id as any).toString());
  // }

  private signToken(id: string): string {
    return Jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN!, 10),
    });
  }
}
