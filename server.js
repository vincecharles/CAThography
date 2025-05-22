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
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;

// Add more detailed startup logging and error handling
const server = app.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        logger.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`API endpoints available at:`);
    logger.info(`- http://localhost:${PORT}/api/routes`);
    logger.info(`- http://localhost:${PORT}/api/stops`);
    logger.info(`- http://localhost:${PORT}/api/fares`);
    logger.info(`- http://localhost:${PORT}/api/auth`);
    logger.info(`- http://localhost:${PORT}/api/informal`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please try a different port.`);
    } else {
        logger.error(`Server error: ${error.message}`);
    }
    process.exit(1);
});
