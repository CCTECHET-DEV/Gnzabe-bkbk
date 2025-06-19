import Notification from '../model/notificationModel';

interface SendNotificationParams {
  recipientId: string;
  recipientModel: 'User' | 'Company';
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export const sendNotification = async ({
  recipientId,
  recipientModel,
  type,
  title,
  message,
  metadata = {},
}: SendNotificationParams) => {
  const notif = await Notification.create({
    recipient: recipientId,
    recipientModel,
    type,
    title,
    message,
    metadata,
  });
  console.log(notif, 'nifuuuaidhfkahfkahsfkhsadkfhasdkfhsadkfhsakfhksfhsakhk');
  // Emit to frontend via WebSocket (if connected)
  io.to(recipientId.toString()).emit('new_notification', notif);
};
