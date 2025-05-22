import express from 'express';
import Stop from '../models/Stop.js';

const router = express.Router();

// Get stops near a location
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon, radius = 1, region, city } = req.query;
        
        const query = {
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            },
            active: true
        };

        if (region) query.region = region;
        if (city) query.city = city;

        const stops = await Stop.find(query);
        res.json(stops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stop details
router.get('/:stopId', async (req, res) => {
    try {
        const stop = await Stop.findOne({ stopId: req.params.stopId });
        if (!stop) {
            return res.status(404).json({ error: 'Stop not found' });
        }
        res.json(stop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stops by region and city
router.get('/region/:region/city/:city', async (req, res) => {
    try {
        const stops = await Stop.find({
            region: req.params.region,
            city: req.params.city,
            active: true
        });
        res.json(stops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stops along a route
router.get('/route/:routeId', async (req, res) => {
    try {
        const { routeId } = req.params;
        // This would typically involve a join with the trips and stop_times collections
        // For now, we'll return a placeholder
        res.json({ message: 'This endpoint will be implemented with trip data' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get accessible stops
router.get('/accessible', async (req, res) => {
    try {
        const stops = await Stop.find({
            wheelchairBoarding: 1,
            active: true
        });
        res.json(stops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 