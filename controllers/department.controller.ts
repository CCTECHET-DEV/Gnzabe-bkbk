import Department from '../model/departmentModel';
import dbFactory from '../dbOperations/dbFactory';

export const getAllDepartments = dbFactory.getAll(Department);
