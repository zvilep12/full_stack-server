import express from 'express';
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemByName,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';

const router = express.Router();

router.post('/', createMenuItem);
router.get('/', getAllMenuItems);
router.get('/name/:name', getMenuItemByName);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;

