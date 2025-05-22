import express from 'express';
const router = express.Router();

// GET all informal routes
router.get('/', async (req, res) => {
    try {
        res.json({ message: 'Get all informal routes' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single informal route
router.get('/:id', async (req, res) => {
    try {
        res.json({ message: `Get informal route ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 