import express from 'express';
import {
  approveUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/user.controller';
import { protectUser } from '../middlewares/auth.user.middleware';
import { protectCompany } from '../middlewares/auth.company.middleware';

const router = express.Router();

router.route('/approve/:id').post(protectCompany, approveUser); // Assuming this is for approving a user, adjust as necessary
router.use(protectUser);
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser);

export default router;
