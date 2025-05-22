import express from 'express';
const router = express.Router();

// POST login
router.post('/login', async (req, res) => {
    try {
        res.json({ message: 'Login endpoint' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST register
router.post('/register', async (req, res) => {
    try {
        res.json({ message: 'Register endpoint' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 