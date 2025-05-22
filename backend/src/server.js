import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import logger, { stream } from './config/logger.js';

// Import routes
import routeRoutes from './routes/routes.js';
import stopRoutes from './routes/stops.js';
import fareRoutes from './routes/fares.js';
import authRoutes from './routes/auth.js';
import informalRouteRoutes from './routes/informalRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream }));

// Routes
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/informal', informalRouteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 