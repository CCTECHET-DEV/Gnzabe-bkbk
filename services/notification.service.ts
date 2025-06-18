import Notification from '../model/notificationModel';

interface SendNotificationParams {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export const sendNotification = async ({
  recipientId,
  type,
  title,
  message,
  metadata = {},
}: SendNotificationParams) => {
  const notif = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    metadata,
  });

  // Emit to frontend via WebSocket (if connected)
  io.to(recipientId.toString()).emit('new_notification', notif);
};
