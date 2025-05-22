import app from '../server.js';
import logger from '../config/logger.js';

// Add error handling for the serverless function
app.use((err, req, res, next) => {
    logger.error('Serverless function error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Export the Express app as a serverless function
export default app; 