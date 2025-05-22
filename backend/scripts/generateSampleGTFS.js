import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateSampleGTFS = () => {
    const dataPath = join(__dirname, '../data/gtfs');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    // Generate routes.txt
    const routes = [
        {
            route_id: 'LRT1-1',
            agency_id: 'LRT1',
            route_short_name: 'LRT1',
            route_long_name: 'Baclaran - Roosevelt',
            route_type: '1',
            route_color: 'FF0000',
            route_text_color: 'FFFFFF'
        }
    ];

    // Generate stops.txt
    const stops = [
        {
            stop_id: 'LRT1-BAC',
            stop_code: 'BAC',
            stop_name: 'Baclaran',
            stop_desc: 'Baclaran Station',
            stop_lat: '14.5347',
            stop_lon: '120.9972',
            wheelchair_boarding: '1'
        },
        {
            stop_id: 'LRT1-EDSA',
            stop_code: 'EDSA',
            stop_name: 'EDSA',
            stop_desc: 'EDSA Station',
            stop_lat: '14.5378',
            stop_lon: '120.9917',
            wheelchair_boarding: '1'
        }
    ];

    // Generate fare_attributes.txt
    const fareAttributes = [
        {
            fare_id: 'LRT1-REGULAR',
            price: '15.00',
            currency_type: 'PHP',
            payment_method: '0',
            transfers: '0'
        },
        {
            fare_id: 'LRT1-STUDENT',
            price: '12.00',
            currency_type: 'PHP',
            payment_method: '0',
            transfers: '0'
        }
    ];

    // Generate fare_rules.txt
    const fareRules = [
        {
            fare_id: 'LRT1-REGULAR',
            route_id: 'LRT1-1',
            origin_id: 'LRT1-BAC',
            destination_id: 'LRT1-EDSA'
        },
        {
            fare_id: 'LRT1-STUDENT',
            route_id: 'LRT1-1',
            origin_id: 'LRT1-BAC',
            destination_id: 'LRT1-EDSA'
        }
    ];

    // Write files
    fs.writeFileSync(join(dataPath, 'routes.txt'), stringify(routes, { header: true }));
    fs.writeFileSync(join(dataPath, 'stops.txt'), stringify(stops, { header: true }));
    fs.writeFileSync(join(dataPath, 'fare_attributes.txt'), stringify(fareAttributes, { header: true }));
    fs.writeFileSync(join(dataPath, 'fare_rules.txt'), stringify(fareRules, { header: true }));

    console.log('Sample GTFS data generated successfully');
};

generateSampleGTFS(); 