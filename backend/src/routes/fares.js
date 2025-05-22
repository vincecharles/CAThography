const express = require('express');
const router = express.Router();
const Fare = require('../models/Fare');

// Get fare between stops
router.get('/between', async (req, res) => {
    try {
        const { fromStopId, toStopId, routeId, fareType = 'Regular' } = req.query;
        
        const query = {
            fromStopId,
            toStopId,
            fareType,
            active: true,
            validFrom: { $lte: new Date() },
            validTo: { $gte: new Date() }
        };

        if (routeId) query.routeId = routeId;

        const fare = await Fare.findOne(query);
        if (!fare) {
            return res.status(404).json({ error: 'Fare not found' });
        }
        res.json(fare);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get fares for a route
router.get('/route/:routeId', async (req, res) => {
    try {
        const fares = await Fare.find({
            routeId: req.params.routeId,
            active: true,
            validFrom: { $lte: new Date() },
            validTo: { $gte: new Date() }
        });
        res.json(fares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get fares by region and city
router.get('/region/:region/city/:city', async (req, res) => {
    try {
        const { fareType } = req.query;
        const query = {
            region: req.params.region,
            city: req.params.city,
            active: true,
            validFrom: { $lte: new Date() },
            validTo: { $gte: new Date() }
        };

        if (fareType) query.fareType = fareType;

        const fares = await Fare.find(query);
        res.json(fares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available fare types
router.get('/types', async (req, res) => {
    try {
        const fareTypes = await Fare.distinct('fareType');
        res.json(fareTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available payment methods
router.get('/payment-methods', async (req, res) => {
    try {
        const paymentMethods = await Fare.distinct('paymentMethod');
        res.json(paymentMethods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 