import { Types } from 'mongoose';

export interface ISession {
  userId: Types.ObjectId;
  lastActivityTimestamp: Date;
}
