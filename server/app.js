// ES6 imports and environment config
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

// Route & middleware imports
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.route.js';
import paymentRoutes from './routes/payment.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

// Initialize Express app
const app = express();

// Built-in middleware for JSON and form data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration (frontend URL must be in .env)
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));

// Third-party middleware
app.use(cookieParser());
app.use(morgan('dev'));

// Health check route
app.get('/ping', (req, res) => {
  res.send('pong');
});

// API routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Handle undefined routes (404 Not Found)
app.all('*', (req, res) => {
  res.status(404).send('Oops: Page Not Found');
});

// Global error handling middleware
app.use(errorMiddleware);

// Export the configured app
export default app;
