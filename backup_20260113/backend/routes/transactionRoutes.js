const express = require('express');
const { User } = require('../models');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const settingsController = require('../controllers/settingsController');
const walletController = require('../controllers/walletController'); // Import walletController
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

router.post('/send', authMiddleware, walletController.sendMoney);
router.post('/mobile-recharge', authMiddleware, walletController.mobileRecharge);
router.get('/history', authMiddleware, transactionController.getHistory);

router.post('/add-money', authMiddleware, upload.single('proofImage'), walletController.requestRecharge);

// Sys Settings
router.get('/settings/payment', authMiddleware, settingsController.getPaymentSettings);
router.put('/settings/payment', authMiddleware, (req, res, next) => {
    // Basic Admin Check Inline
    if (req.user.user.role !== 'admin' && req.user.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}, settingsController.updatePaymentSettings);

// Admin/Agent Routes (Inline middleware for simplicity or move to separate file later)
const checkRole = (roles) => async (req, res, next) => {
    try {
        // Fetch fresh user data from DB to ensure role is up-to-date
        const user = await User.findByPk(req.user.user.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update request user role with fresh DB role
        req.user.user.role = user.role;
        next();
    } catch (err) {
        console.error('Role Check Error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

router.get('/pending', authMiddleware, checkRole(['admin', 'super_admin', 'employee_admin']), transactionController.getPendingTransactions);
router.get('/all', authMiddleware, checkRole(['admin', 'super_admin']), transactionController.getAllTransactions);
router.post('/assign', authMiddleware, checkRole(['admin', 'super_admin', 'employee_admin']), transactionController.assignTransaction);
router.get('/assigned', authMiddleware, checkRole(['agent', 'admin', 'super_admin']), transactionController.getAssignedTransactions);
router.post('/complete', authMiddleware, checkRole(['agent', 'admin', 'super_admin']), transactionController.completeTransaction);

module.exports = router;
