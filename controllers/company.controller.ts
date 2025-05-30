import dbFactory from '../dbOperations/dbFactory';
import { Company } from '../model/companyModel';

export const getAllCompanies = dbFactory.getAll(Company);
