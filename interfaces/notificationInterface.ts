import { Types, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  recipientModel: 'User' | 'Company';
  type:
    | 'registration'
    | 'passwordReset'
    | 'courseAssignment'
    | 'progressReport'
    | 'custom';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
