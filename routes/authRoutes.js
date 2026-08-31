import express from 'express';
import { login, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/verify', verifyOTP);

export default router;

