import express from 'express';
const router = express.Router();

// GET all fares
router.get('/', async (req, res) => {
    try {
        res.json({ message: 'Get all fares' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single fare
router.get('/:id', async (req, res) => {
    try {
        res.json({ message: `Get fare ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 