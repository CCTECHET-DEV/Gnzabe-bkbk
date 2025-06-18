import express from 'express';
import {
  activateDepartment,
  addEmployeeToDepartment,
  assignDepartmentAdmin,
  createDepartment,
  deactiveDepartment,
  removeEmployeeFromDepartment,
  revokeDepartmentAdmin,
} from '../controllers/department.controller';
import { protectCompany } from '../middlewares/auth.company.middleware';
import {
  addCompanyIdToRequest,
  allowedToCompanyOrDepartmentAdmin,
  doesDepartmentBelongToCompany,
} from '../middlewares/middlewares';

const router = express.Router();

router
  .route('/remove-employee')
  .post(allowedToCompanyOrDepartmentAdmin, removeEmployeeFromDepartment);
// router.use()
// router.use(allowedToCompanyOrDepartmentAdmin)
router.use(protectCompany);
router.route('/').post(addCompanyIdToRequest, createDepartment);
router.route('/add-employee').post(addEmployeeToDepartment);
router.route('/assign-admin').post(assignDepartmentAdmin);
router.route('/revoke-admin').post(revokeDepartmentAdmin);
router
  .route('/activate/:id')
  .post(doesDepartmentBelongToCompany, activateDepartment);
router
  .route('/deactivate/:id')
  .post(doesDepartmentBelongToCompany, deactiveDepartment);
// router.route('/').get(getAllDepartments);

export default router;
