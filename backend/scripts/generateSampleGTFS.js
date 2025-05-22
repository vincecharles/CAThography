import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../src/config/database.js';
import Route from '../src/models/Route.js';
import Stop from '../src/models/Stop.js';
import Fare from '../src/models/Fare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectToDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const generateSampleData = async () => {
  try {
    // Clear existing data
    await Route.deleteMany({});
    await Stop.deleteMany({});
    await Fare.deleteMany({});

    // Create sample routes
    const routes = [
      {
        routeId: 'LRT1-001',
        name: 'LRT Line 1',
        description: 'Baclaran to Roosevelt',
        type: 'RAIL',
        operator: 'LRTA',
        region: 'NCR',
        city: 'Manila',
        stops: []
      },
      {
        routeId: 'BUS-001',
        name: 'EDSA Carousel',
        description: 'Monumento to PITX',
        type: 'BUS',
        operator: 'MMDA',
        region: 'NCR',
        city: 'Manila',
        stops: []
      }
    ];

    // Create sample stops
    const stops = [
      {
        stopId: 'LRT1-001',
        name: 'Baclaran Station',
        location: {
          type: 'Point',
          coordinates: [120.9825, 14.5347]
        },
        landmark: 'Baclaran Church',
        isTerminal: true
      },
      {
        stopId: 'LRT1-002',
        name: 'EDSA Station',
        location: {
          type: 'Point',
          coordinates: [120.9833, 14.5350]
        },
        landmark: 'EDSA',
        isTerminal: false
      }
    ];

    // Create sample fares
    const fares = [
      {
        fareId: 'FARE-001',
        routeId: 'LRT1-001',
        amount: 20,
        currency: 'PHP',
        type: 'REGULAR'
      },
      {
        fareId: 'FARE-002',
        routeId: 'BUS-001',
        amount: 15,
        currency: 'PHP',
        type: 'REGULAR'
      }
    ];

    // Save to database
    await Route.insertMany(routes);
    await Stop.insertMany(stops);
    await Fare.insertMany(fares);

    console.log('Sample data generated successfully');
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
};

// Run the script
connectToDatabase().then(generateSampleData); 