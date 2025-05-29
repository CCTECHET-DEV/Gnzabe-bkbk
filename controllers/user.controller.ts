import { IUser } from '../interfaces/userInterface';
import User from '../model/userModel';
import authFactory from './authFactory';
import dbFactory from '../dbOperations/dbFactory';

export const getAllUsers = dbFactory.getAll(User);
export const getUser = dbFactory.getOne(User);
