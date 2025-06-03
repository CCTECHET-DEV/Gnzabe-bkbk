import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/user.controller';
import { signupUser } from '../controllers/auth.user.controller';
import {
  protectUser,
  renewUserAccessTokenIfSessionActive,
} from '../middlewares/auth.user.middleware';

const router = express.Router();

router.use(protectUser);
router.use(renewUserAccessTokenIfSessionActive);
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser);

export default router;
