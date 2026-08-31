import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerByName,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/name/:name', getCustomerByName);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;

