import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        // Don't exit process in production (serverless) environment
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error; // Re-throw the error to be handled by the caller
    }
};

export default connectDB; 