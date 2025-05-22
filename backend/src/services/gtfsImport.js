import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import Fare from '../models/Fare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GTFSImportService {
  constructor(dataPath, agencyId) {
    this.dataPath = dataPath;
    this.agencyId = agencyId;
  }

  async importGTFS() {
    try {
      await connectDB();
      console.log('Connected to MongoDB');

      await this.#importRoutes();
      await this.#importStops();
      await this.#importFares();

      console.log('GTFS import completed successfully');
    } catch (error) {
      console.error('Error importing GTFS data:', error);
      throw error;
    }
  }

  async #importRoutes() {
    const routesFile = path.join(this.dataPath, 'routes.txt');
    const routes = this.#readCSV(routesFile);

    for (const route of routes) {
      const routeDoc = {
        routeId: route.route_id,
        agencyId: this.agencyId,
        shortName: route.route_short_name,
        longName: route.route_long_name,
        type: parseInt(route.route_type),
        color: route.route_color || '#000000',
        textColor: route.route_text_color || '#FFFFFF',
        region: this.#determineRegion(route),
        city: this.#determineCity(route),
        active: true
      };

      await Route.findOneAndUpdate(
        { routeId: route.route_id },
        routeDoc,
        { upsert: true, new: true }
      );
    }

    console.log('Routes imported successfully');
  }

  async #importStops() {
    const stopsFile = path.join(this.dataPath, 'stops.txt');
    const stops = this.#readCSV(stopsFile);

    for (const stop of stops) {
      const stopDoc = {
        stopId: stop.stop_id,
        code: stop.stop_code,
        name: stop.stop_name,
        description: stop.stop_desc,
        location: {
          type: 'Point',
          coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)]
        },
        type: parseInt(stop.location_type),
        parentStation: stop.parent_station,
        wheelchairBoarding: parseInt(stop.wheelchair_boarding),
        region: this.#determineRegion(stop),
        city: this.#determineCity(stop),
        active: true
      };

      await Stop.findOneAndUpdate(
        { stopId: stop.stop_id },
        stopDoc,
        { upsert: true, new: true }
      );
    }

    console.log('Stops imported successfully');
  }

  async #importFares() {
    const fareRulesFile = path.join(this.dataPath, 'fare_rules.txt');
    const fareAttributesFile = path.join(this.dataPath, 'fare_attributes.txt');

    const fareRules = this.#readCSV(fareRulesFile);
    const fareAttributes = this.#readCSV(fareAttributesFile);

    for (const rule of fareRules) {
      const fareAttr = fareAttributes.find(attr => attr.fare_id === rule.fare_id);
      
      if (!fareAttr) continue;

      const fareDoc = {
        fareId: rule.fare_id,
        routeId: rule.route_id,
        fromStopId: rule.origin_id,
        toStopId: rule.destination_id,
        amount: parseFloat(fareAttr.price),
        currency: fareAttr.currency_type || 'PHP',
        fareType: this.#determineFareType(fareAttr),
        paymentMethod: this.#determinePaymentMethod(fareAttr),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        region: this.#determineRegion(rule),
        city: this.#determineCity(rule),
        active: true
      };

      await Fare.findOneAndUpdate(
        { fareId: rule.fare_id },
        fareDoc,
        { upsert: true, new: true }
      );
    }

    console.log('Fares imported successfully');
  }

  #readCSV(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
    } catch (error) {
      console.error(`Error reading CSV file ${filePath}:`, error);
      throw error;
    }
  }

  #determineRegion(data) {
    // Implement region determination logic based on coordinates or other data
    return 'NCR'; // Default to NCR for now
  }

  #determineCity(data) {
    // Implement city determination logic based on coordinates or other data
    return 'Manila'; // Default to Manila for now
  }

  #determineFareType(fareAttr) {
    // Implement fare type determination logic
    return 'REGULAR';
  }

  #determinePaymentMethod(fareAttr) {
    // Implement payment method determination logic
    return 'CASH';
  }
}

export default GTFSImportService; 