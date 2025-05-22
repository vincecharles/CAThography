import express from 'express';
import InformalRoute from '../models/InformalRoute.js';
import { auth, checkRole } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get all informal routes
router.get('/', async (req, res) => {
  try {
    const { type, region, city, barangay } = req.query;
    const query = { active: true };

    if (type) query.type = type;
    if (region) query.region = region;
    if (city) query.city = city;
    if (barangay) query.barangay = barangay;

    const routes = await InformalRoute.find(query);
    res.json(routes);
  } catch (error) {
    logger.error('Error fetching informal routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get nearby informal routes
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1000, type } = req.query;
    const query = {
      active: true,
      'stops.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    if (type) query.type = type;

    const routes = await InformalRoute.find(query);
    res.json(routes);
  } catch (error) {
    logger.error('Error fetching nearby informal routes:', error);
    res.status(500).json({ error: 'Failed to fetch nearby routes' });
  }
});

// Get route details
router.get('/:routeId', async (req, res) => {
  try {
    const route = await InformalRoute.findOne({
      routeId: req.params.routeId,
      active: true
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    logger.error('Error fetching route details:', error);
    res.status(500).json({ error: 'Failed to fetch route details' });
  }
});

// Add new route (admin/operator only)
router.post('/', auth, checkRole(['ADMIN', 'OPERATOR']), async (req, res) => {
  try {
    const route = new InformalRoute(req.body);
    await route.save();
    logger.info(`New informal route created: ${route.routeId}`);
    res.status(201).json(route);
  } catch (error) {
    logger.error('Error creating informal route:', error);
    res.status(400).json({ error: 'Failed to create route' });
  }
});

// Update route (admin/operator only)
router.patch('/:routeId', auth, checkRole(['ADMIN', 'OPERATOR']), async (req, res) => {
  try {
    const route = await InformalRoute.findOneAndUpdate(
      { routeId: req.params.routeId },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    logger.info(`Informal route updated: ${route.routeId}`);
    res.json(route);
  } catch (error) {
    logger.error('Error updating informal route:', error);
    res.status(400).json({ error: 'Failed to update route' });
  }
});

// Delete route (admin only)
router.delete('/:routeId', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const route = await InformalRoute.findOneAndUpdate(
      { routeId: req.params.routeId },
      { active: false, lastUpdated: new Date() },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    logger.info(`Informal route deleted: ${route.routeId}`);
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    logger.error('Error deleting informal route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

export default router; 