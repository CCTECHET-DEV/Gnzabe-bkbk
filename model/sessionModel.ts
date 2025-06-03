import { Schema } from 'mongoose';
import { ISession } from '../interfaces/sessonInterface';

const sessionSchem = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastActivityTimestamp: {
    type: Date,
    default: Date.now,
  },
});
