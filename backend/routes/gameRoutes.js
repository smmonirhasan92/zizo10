const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const { User } = require('../models');

// Middleware to check Admin Role
const adminCheck = async (req, res, next) => {
    try {
        const userId = req.user.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const allowedRoles = ['admin', 'super_admin', 'employee_admin'];
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Refresh role in request object for downstream controllers
        req.user.user.role = user.role;
        next();
    } catch (err) {
        console.error("Admin Check Middleware Error:", err);
        res.status(500).json({ message: 'Server Error during Auth Check' });
    }
};

router.get('/', authMiddleware, gameController.getGameInfo);
// router.get('/', gameController.getGameInfo); // Info logic removed for now or needs update
router.post('/play', authMiddleware, gameController.playGame);
// router.post('/guess', authMiddleware, gameController.submitGuess); // Legacy removed
router.post('/settings', authMiddleware, adminCheck, gameController.updateSettings);
router.get('/settings', authMiddleware, adminCheck, gameController.getSettings);

module.exports = router;
