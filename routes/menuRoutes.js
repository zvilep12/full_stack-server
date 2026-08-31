import express from 'express';
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemByName,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateJWT, authorizeRoles('manager'), createMenuItem);
router.get('/', getAllMenuItems);
router.get('/name/:name', getMenuItemByName);
router.put('/:id', authenticateJWT, authorizeRoles('manager'), updateMenuItem);
router.delete('/:id', authenticateJWT, authorizeRoles('manager'), deleteMenuItem);

export default router;
