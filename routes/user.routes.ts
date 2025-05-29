import express from 'express';
import { getAllUsers } from '../controllers/user.controller';
import { signupUser } from '../controllers/auth.user.controller';

const router = express.Router();

router.route('/').get(getAllUsers);

export default router;
