import express from 'express';
import { loginUser, signupUser } from '../controllers/auth.user.controller';
import { verifyEmails } from '../middlewares/verifyEmail.middleware';
import { requireBodyFields } from '../middlewares/validateFields.middleware';
import {
  loginCompany,
  signupCompany,
} from '../controllers/auth.company.controller';

const router = express.Router();

// NOTE user authentication routes
router.route('/user/signup').post(
  // verifyEmails(['email']),
  signupUser,
);
router
  .route('/user/login')
  .post(requireBodyFields(['email', 'password']), loginUser);

// NOTE compay authentication routes
router.route('/company/signup').post(
  // verifyEmails(['primaryEmail', 'secondaryEmail']),
  signupCompany,
);
router
  .route('/company/login')
  .post(requireBodyFields(['primaryEmail', 'password']), loginCompany);
export default router;
