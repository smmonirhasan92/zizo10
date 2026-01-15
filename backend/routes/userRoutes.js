const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload-photo', authMiddleware, upload.single('photo'), userController.uploadProfilePhoto);
router.put('/profile', authMiddleware, upload.single('photo'), userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

// Plan & Upgrade Routes
router.get('/plans', authMiddleware, userController.getAccountPlans);
router.post('/upgrade-tier', authMiddleware, userController.upgradeAccountTier);

const notificationController = require('../controllers/notificationController');

// Notification Routes (Step 7)
router.get('/notifications/my', authMiddleware, notificationController.getMyNotifications);
router.post('/notifications/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
