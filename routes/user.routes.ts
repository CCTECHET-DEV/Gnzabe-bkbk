import express from 'express';
import {
  approveUser,
  disApproveUser,
  getAllUsers,
  getUser,
  updateMe,
  updateUser,
} from '../controllers/user.controller';
import { protectUser } from '../middlewares/auth.user.middleware';
import { protectCompany } from '../middlewares/auth.company.middleware';
import { allowedToCompanyOrDepartmentAdmin } from '../middlewares/middlewares';

const router = express.Router();

router.route('/approve').post(allowedToCompanyOrDepartmentAdmin, approveUser); // Assuming this is for approving a user, adjust as necessary

router
  .route('/disapprove')
  .post(allowedToCompanyOrDepartmentAdmin, disApproveUser); // Assuming this is for disapproving a user, adjust as necessary

router.use(protectUser);
router.route('/').get(getAllUsers);
router.route('/update-me').patch(updateMe); // This route is for the user to update their own information

// NOTE should be based on role
router.route('/:id').get(getUser).patch(updateUser);

export default router;
