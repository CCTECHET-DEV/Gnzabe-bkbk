import express from 'express';
import {
  getUserPasswordResetToken,
  loginUser,
  logoutUser,
  signupUser,
  // userRefreshToken,
  verifyUser,
  verifyUserOtp,
} from '../controllers/auth.user.controller';
import { verifyEmails } from '../middlewares/verifyEmail.middleware';
import { requireBodyFields } from '../middlewares/validateFields.middleware';
import {
  loginCompany,
  logoutCompany,
  signupCompany,
  verifyCompany,
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

router.route('/user/verify').get(verifyUser);
router.route('/user/verify-otp').post(verifyUserOtp);
router.route('/user/get-reset-link').get(getUserPasswordResetToken);

router.route('/user/logout').post(logoutUser);

// router.route('/user/refresh-token').get(userRefreshToken);

// NOTE compay authentication routes
router.route('/company/signup').post(
  // verifyEmails(['primaryEmail', 'secondaryEmail']),
  signupCompany,
);

router
  .route('/company/login')
  .post(requireBodyFields(['primaryEmail', 'password']), loginCompany);

router.route('/company/verify').get(verifyCompany);

router.route('/company/logout').post(logoutCompany);
export default router;
