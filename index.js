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
// Error handling middleware (e.g. for malformed JSON)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON format in request body. Please ensure your JSON is valid (no extra quotes or backslashes).',
      message: err.message
    });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

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
