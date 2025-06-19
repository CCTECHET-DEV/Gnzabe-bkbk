import Notification from '../model/notificationModel';

interface SendNotificationParams {
  recipient: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export const sendNotification = async ({
  recipient,
  type,
  title,
  message,
  metadata = {},
}: SendNotificationParams) => {
  const notif = await Notification.create({
    recipient,
    type,
    title,
    message,
    metadata,
  });
  console.log(notif, 'nifuuuaidhfkahfkahsfkhsadkfhasdkfhsadkfhsakfhksfhsakhk');
  // Emit to frontend via WebSocket (if connected)
  io.to(recipient.toString()).emit('new_notification', notif);
};
