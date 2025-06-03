import { model, Schema } from 'mongoose';
import { ISession } from '../interfaces/sessonInterface';

const sessionSchema = new Schema<ISession>({
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

export const Session = model<ISession>('Session', sessionSchema);
