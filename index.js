import express from 'express';
import cors from 'cors';
import { sequelize } from './models/db.js';
import employeeRouter from './routes/employeeRoutes.js';
import customerRouter from './routes/customerRoutes.js';
import menuRouter from './routes/menuRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import authRouter from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/employees', employeeRouter);
app.use('/customers', customerRouter);
app.use('/menu', menuRouter);
app.use('/orders', orderRouter);

// Database Connection, Sync, and Server Listen
try {
  await sequelize.sync();
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to sync database or start server:', error);
}
