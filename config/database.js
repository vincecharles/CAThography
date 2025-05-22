import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // If we're already connected, return the existing connection
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
        });
        
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

export default connectDB; 