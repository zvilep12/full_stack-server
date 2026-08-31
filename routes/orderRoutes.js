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
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateJWT, createOrder);
router.get('/', authenticateJWT, getAllOrders);
router.get('/customer/name/:name', authenticateJWT, getOrdersByCustomerName);
router.post('/:id/items', authenticateJWT, addOrderItem);
router.put('/:id/items/:menuItemId', authenticateJWT, updateOrderItem);
router.delete('/:id/items/:menuItemId', authenticateJWT, deleteOrderItem);
router.get('/:id', authenticateJWT, getOrderById);
router.put('/:id', authenticateJWT, updateOrderStatus);
router.delete('/:id', authenticateJWT, deleteOrder);

export default router;
