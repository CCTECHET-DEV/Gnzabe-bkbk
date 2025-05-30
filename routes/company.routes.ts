import express from 'express';
import { getAllCompanies, getCompany } from '../controllers/company.controller';

const router = express.Router();

router.route('/').get(getAllCompanies);
router.route('/:id').get(getCompany);

export default router;
