import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrdersByCustomerName,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/customer/name/:name', getOrdersByCustomerName);
router.post('/:id/items', addOrderItem);
router.put('/:id/items/:menuItemId', updateOrderItem);
router.delete('/:id/items/:menuItemId', deleteOrderItem);
router.get('/:id', getOrderById);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;

