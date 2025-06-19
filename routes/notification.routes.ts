import express from 'express';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../controllers/notification.controller';
const router = express.Router();

router.route('/:id').get(getNotifications);
router.route('/mark-notification-as-read/:id').post(markNotificationAsRead);
router
  .route('/mark-all-notifications-as-read/:id')
  .post(markAllNotificationsAsRead);

export default router;
