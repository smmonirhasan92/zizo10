const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const agentController = require('../controllers/agentController');
const userController = require('../controllers/userController');
const gameController = require('../controllers/gameController');
const settingsController = require('../controllers/settingsController');

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
        res.status(500).json({ message: 'Server Error during Auth Check', error: err.toString() });
    }
};

router.get('/recharges', authMiddleware, adminCheck, adminController.getPendingRecharges);
router.post('/manage-transaction', authMiddleware, adminCheck, adminController.manageTransaction);
router.get('/logs', authMiddleware, adminCheck, adminController.getAuditLogs);
router.get('/audit/financial', authMiddleware, adminCheck, adminController.getSystemFinancials);
router.post('/deposit-request', authMiddleware, adminCheck, adminController.handleDepositRequest);
router.post('/game-status', authMiddleware, adminCheck, adminController.updateGameStatus);
router.get('/user/:userId/game-stats', authMiddleware, adminCheck, gameController.getUserGameStats);
router.get('/game-logs', authMiddleware, adminCheck, gameController.getGameLogs);

// Deposit Settings
router.get('/deposit-settings', authMiddleware, adminCheck, gameController.getDepositSettings);
router.post('/deposit-settings', authMiddleware, adminCheck, gameController.updateDepositSettings);

// Agent Management Routes
router.post('/agent', authMiddleware, adminCheck, agentController.createAgent);
router.get('/agents', authMiddleware, adminCheck, agentController.getAgents);
router.put('/agent/commission', authMiddleware, adminCheck, agentController.updateAgentCommission);
router.post('/agent/balance', authMiddleware, adminCheck, agentController.adjustBalance);

// User Management Routes
router.get('/users', authMiddleware, adminCheck, userController.getAllUsers);
router.put('/user/role', authMiddleware, adminCheck, userController.updateUserRole);
router.post('/user/verify-agent', authMiddleware, adminCheck, agentController.verifyAgent);
router.put('/user/reset-password', authMiddleware, adminCheck, userController.adminResetPassword);

// Task Ad Management
router.post('/task-ad', authMiddleware, adminCheck, adminController.createTaskAd);
router.get('/task-ad', authMiddleware, adminCheck, adminController.getTaskAds);
router.delete('/task-ad/:id', authMiddleware, adminCheck, adminController.deleteTaskAd);

// Global System Settings
router.get('/settings/global', authMiddleware, adminCheck, settingsController.getGlobalSettings);
router.post('/settings/global', authMiddleware, adminCheck, settingsController.updateGlobalSettings);

// Account Plans / Tiers
router.get('/tiers', authMiddleware, adminCheck, adminController.getAccountTiers);
router.post('/tiers', authMiddleware, adminCheck, adminController.updateAccountTier);
router.delete('/tiers/:id', authMiddleware, adminCheck, adminController.deleteAccountTier);


module.exports = router;
