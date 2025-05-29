import express from 'express';
import { loginUser, signupUser } from '../controllers/auth.user.controller';
import { verifyEmails } from '../middlewares/verifyEmail.middleware';
import { requireBodyFields } from '../middlewares/validateFields.middleware';

const router = express.Router();

router.route('/user/signup').post(
  // verifyEmails(['email']),
  signupUser,
);
router
  .route('/user/login')
  .post(requireBodyFields(['email', 'password']), loginUser);

export default router;
