import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import GTFSImportService from '../src/services/gtfsImport.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const importGTFS = async () => {
    try {
        const dataPath = join(__dirname, '../data/gtfs');
        const agencyId = process.env.AGENCY_ID || 'LRT1'; // Default to LRT1

        const importer = new GTFSImportService(dataPath, agencyId);
        await importer.importGTFS();
        
        console.log('GTFS import completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error importing GTFS:', error);
        process.exit(1);
    }
};

importGTFS(); 