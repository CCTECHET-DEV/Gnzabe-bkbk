import express from 'express';
import { getAllCompanies, getCompany } from '../controllers/company.controller';
import { protectCompany } from '../middlewares/auth.company.middleware';

const router = express.Router();

router.use(protectCompany);
router.route('/').get(getAllCompanies);
router.route('/:id').get(getCompany);

export default router;
