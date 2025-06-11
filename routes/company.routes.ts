import express from 'express';
import {
  getAllCompanies,
  getCompaniesFroRegistration,
  getCompany,
  getCurrentCompany,
} from '../controllers/company.controller';
import { protectCompany } from '../middlewares/auth.company.middleware';

const router = express.Router();

router
  .route('/get-companies-for-registration')
  .get(getCompaniesFroRegistration);
router.use(protectCompany);
router.route('/').get(getAllCompanies);
router.route('/get-current-company').get(getCurrentCompany);
router.route('/:id').get(getCompany);

export default router;
