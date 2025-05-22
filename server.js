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

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream }));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CAThography API' });
});

// Routes
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/informal', informalRouteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize database connection
connectDB().catch(err => {
    logger.error('Failed to connect to MongoDB:', err);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

const PORT = process.env.PORT || 4000;

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}

// Export for serverless
export default app;
