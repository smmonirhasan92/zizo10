const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Task Status (Daily Progress)
router.get('/status', authMiddleware, taskController.getTaskStatus);

// Submit Task (Claim Reward)
router.post('/submit', authMiddleware, taskController.submitTask);

module.exports = router;
