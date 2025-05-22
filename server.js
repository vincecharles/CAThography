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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/informal', informalRouteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Initialize database connection only when needed
let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) {
        return;
    }
    try {
        const conn = await connectDB();
        if (conn) {
            isConnected = true;
        } else {
            logger.warn('Database connection failed, but continuing without it');
        }
    } catch (error) {
        logger.error('Database connection error:', error);
        // Don't throw the error, just log it
    }
};

// Middleware to ensure database connection
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        logger.error('Database middleware error:', error);
        next();
    }
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}

// Export for serverless
export default app;
