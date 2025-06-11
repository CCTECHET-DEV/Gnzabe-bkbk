import express from 'express';
import {
  approveCompnayEmployee,
  getAllCompanies,
  getCompaniesFroRegistration,
  getCompany,
} from '../controllers/company.controller';
import { protectCompany } from '../middlewares/auth.company.middleware';

const router = express.Router();

router
  .route('/get-companies-for-registration')
  .get(getCompaniesFroRegistration);
router.use(protectCompany);
router.route('/').get(getAllCompanies);
router.route('/:id').get(getCompany);
router.route('/employee/approve/:id').post(approveCompnayEmployee);

export default router;
