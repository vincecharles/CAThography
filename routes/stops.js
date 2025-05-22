import express from 'express';
const router = express.Router();

// GET all stops
router.get('/', async (req, res) => {
    try {
        res.json({ message: 'Get all stops' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single stop
router.get('/:id', async (req, res) => {
    try {
        res.json({ message: `Get stop ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 