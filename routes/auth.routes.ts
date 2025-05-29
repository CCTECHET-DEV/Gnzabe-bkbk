import express from 'express';
import { signupUser } from '../controllers/auth.user.controller';
import { verifyEmails } from '../middlewares/verifyEmail.middleware';

const router = express.Router();

router.route('/users/signup').post(verifyEmails(['email']), signupUser);

export default router;
