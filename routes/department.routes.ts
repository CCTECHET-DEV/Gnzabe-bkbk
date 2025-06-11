import express from 'express';
import {
  assignDepartmentAdmin,
  createDepartment,
  getAllDepartments,
} from '../controllers/department.controller';
import { protectCompany } from '../middlewares/auth.company.middleware';

const router = express.Router();

router.use(protectCompany);
router.route('/').post(createDepartment);
router.route('/assign-admin/').post(assignDepartmentAdmin);
// router.route('/').get(getAllDepartments);

export default router;
