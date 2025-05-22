import express from 'express';
import Route from '../models/Route.js';

const router = express.Router();

// Get routes near a location
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon, radius = 1, region, city } = req.query;
        
        const query = { active: true };
        if (region) query.region = region;
        if (city) query.city = city;

        const routes = await Route.find(query);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get route details
router.get('/:routeId', async (req, res) => {
    try {
        const route = await Route.findOne({ routeId: req.params.routeId });
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json(route);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get routes by region and city
router.get('/region/:region/city/:city', async (req, res) => {
    try {
        const routes = await Route.find({
            region: req.params.region,
            city: req.params.city,
            active: true
        });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all regions
router.get('/regions/list', async (req, res) => {
    try {
        const regions = await Route.distinct('region');
        res.json(regions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get cities in a region
router.get('/region/:region/cities', async (req, res) => {
    try {
        const cities = await Route.distinct('city', { region: req.params.region });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 