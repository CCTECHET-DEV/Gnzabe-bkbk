import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/user.controller';
import { protectUser } from '../middlewares/auth.user.middleware';

const router = express.Router();

router.use(protectUser);
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser);

export default router;
