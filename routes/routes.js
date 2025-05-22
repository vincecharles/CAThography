import express from 'express';
const router = express.Router();

// GET all routes
router.get('/', async (req, res) => {
    try {
        res.json({ message: 'Get all routes' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single route
router.get('/:id', async (req, res) => {
    try {
        res.json({ message: `Get route ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 