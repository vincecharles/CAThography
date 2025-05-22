import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import connectDB from '../src/config/database.js';
import InformalRoute from '../src/models/InformalRoute.js';

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

const importUVExpressRoutes = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/uv_express');
    const routesFile = path.join(dataPath, 'routes.csv');
    const stopsFile = path.join(dataPath, 'stops.csv');

    // Read and parse CSV files
    const routesData = parse(fs.readFileSync(routesFile), {
      columns: true,
      skip_empty_lines: true
    });

    const stopsData = parse(fs.readFileSync(stopsFile), {
      columns: true,
      skip_empty_lines: true
    });

    // Process routes
    for (const route of routesData) {
      const routeStops = stopsData.filter(stop => stop.routeId === route.routeId);
      
      const routeDoc = {
        routeId: route.routeId,
        type: 'UV_EXPRESS',
        routeNumber: route.routeNumber,
        name: route.name,
        description: route.description,
        operator: route.operator,
        region: route.region,
        city: route.city,
        barangay: route.barangay,
        stops: routeStops.map(stop => ({
          stopId: stop.stopId,
          name: stop.name,
          location: {
            type: 'Point',
            coordinates: [parseFloat(stop.longitude), parseFloat(stop.latitude)]
          },
          landmark: stop.landmark,
          isTerminal: stop.isTerminal === 'true'
        })),
        schedule: {
          startTime: route.startTime,
          endTime: route.endTime,
          frequency: parseInt(route.frequency),
          peakHours: JSON.parse(route.peakHours || '[]')
        },
        fare: {
          base: parseFloat(route.baseFare),
          perKm: parseFloat(route.perKmFare),
          minimum: parseFloat(route.minimumFare),
          peakMultiplier: parseFloat(route.peakMultiplier || '1.2'),
          discounts: {
            student: parseFloat(route.studentDiscount || '0.2'),
            senior: parseFloat(route.seniorDiscount || '0.2'),
            pwd: parseFloat(route.pwdDiscount || '0.2')
          }
        },
        vehicle: {
          type: 'VAN',
          capacity: parseInt(route.capacity),
          features: JSON.parse(route.features || '[]')
        }
      };

      await InformalRoute.findOneAndUpdate(
        { routeId: route.routeId },
        routeDoc,
        { upsert: true, new: true }
      );

      console.log(`Imported UV Express route: ${route.routeId}`);
    }

    console.log('UV Express routes import completed');
  } catch (error) {
    console.error('Error importing UV Express routes:', error);
  } finally {
    process.exit(0);
  }
};

// Run the import
connectToDatabase().then(importUVExpressRoutes); 