import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerByName,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateJWT, createCustomer);
router.get('/', authenticateJWT, getAllCustomers);
router.get('/name/:name', authenticateJWT, getCustomerByName);
router.get('/:id', authenticateJWT, getCustomerById);
router.put('/:id', authenticateJWT, updateCustomer);
router.delete('/:id', authenticateJWT, deleteCustomer);

export default router;
