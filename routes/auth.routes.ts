import express from 'express';
import {
  loginCompany,
  logoutCompany,
  signupCompany,
} from '../controllers/auth.company.controller';
import {
  loginUser,
  logoutUser,
  signupUser,
} from '../controllers/auth.user.controller';
import { requireBodyFields } from '../middlewares/validateFields.middleware';
import { validateLogin } from '../middlewares/validateLogin.middleware';
import { validateSignup } from '../middlewares/validateSignup.middleware';

const router = express.Router();

// NOTE user authentication routes
router.route('/user/signup').post(
  validateSignup,
  // verifyEmails(['email']),
  signupUser,
);
router.route('/user/login').post(validateLogin, loginUser);

router.route('/user/logout').post(logoutUser);

// NOTE compay authentication routes
router.route('/company/signup').post(
  // verifyEmails(['primaryEmail', 'secondaryEmail']),
  signupCompany,
);

router
  .route('/company/login')
  .post(requireBodyFields(['primaryEmail', 'password']), loginCompany);

router.route('/company/logout').post(logoutCompany);
export default router;
