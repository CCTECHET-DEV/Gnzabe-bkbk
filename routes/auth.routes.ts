import express from 'express';
import { signupUser } from '../controllers/auth.user.controller';

const router = express.Router();

router.route('/users/signup').post(signupUser);

export default router;
