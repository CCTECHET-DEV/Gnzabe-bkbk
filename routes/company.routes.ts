import express from 'express';
import { getAllCompanies } from '../controllers/company.controller';

const router = express.Router();

router.route('/').get(getAllCompanies);

export default router;
