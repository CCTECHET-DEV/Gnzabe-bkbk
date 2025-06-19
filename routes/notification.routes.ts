import express from 'express';
import { getNotifications } from '../controllers/notification.controller';
const router = express.Router();

router.route('/:id').get(getNotifications);

export default router;
