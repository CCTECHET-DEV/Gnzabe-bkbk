import { NextFunction, Request, Response } from 'express';
import User from '../model/userModel';
import dbFactory from '../dbOperations/dbFactory';
import { catchAsync } from '../utilities/catchAsync';

export const getAllUsers = dbFactory.getAll(User);
export const getUser = dbFactory.getOne(User);
export const updateUser = dbFactory.updateOne(User, [
  'email',
  'password',
  'role',
  'isActive',
  'isVerified',
  'failedLoginAttempts',
  'verificationToken',
  'verificationTokenExpiry',
  'resetPasswordToken',
  'resetPasswordTokenExpiry',
  'isApproved',
  'createdAt',
  'updatedAt',
]);
