import express from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByName,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/', createEmployee);
router.get('/', getAllEmployees);
router.get('/name/:name', getEmployeeByName);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;

