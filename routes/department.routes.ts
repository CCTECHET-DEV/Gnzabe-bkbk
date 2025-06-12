import express from 'express';
import {
  assignDepartmentAdmin,
  createDepartment,
  removeEmployeeFromDepartment,
} from '../controllers/department.controller';
import { protectCompany } from '../middlewares/auth.company.middleware';
import { allowedToCompanyOrDepartmentAdmin } from '../middlewares/middlewares';

const router = express.Router();

router
  .route('/remove-employee/:id')
  .post(allowedToCompanyOrDepartmentAdmin, removeEmployeeFromDepartment);
// router.use(allowedToCompanyOrDepartmentAdmin)
router.use(protectCompany);
router.route('/').post(createDepartment);
router.route('/assign-admin/').post(assignDepartmentAdmin);
// router.route('/').get(getAllDepartments);

export default router;
