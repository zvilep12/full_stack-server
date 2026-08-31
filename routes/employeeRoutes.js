import express from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByName,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateJWT, authorizeRoles('manager'), createEmployee);
router.get('/', authenticateJWT, getAllEmployees);
router.get('/name/:name', authenticateJWT, getEmployeeByName);
router.get('/:id', authenticateJWT, getEmployeeById);
router.put('/:id', authenticateJWT, authorizeRoles('manager'), updateEmployee);
router.delete('/:id', authenticateJWT, authorizeRoles('manager'), deleteEmployee);

export default router;
