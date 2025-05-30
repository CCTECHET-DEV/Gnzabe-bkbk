import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/user.controller';
import { signupUser } from '../controllers/auth.user.controller';

const router = express.Router();

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser);

export default router;
