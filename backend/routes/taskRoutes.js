const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Admin: Create Task
router.post('/admin/tasks/create', authMiddleware, upload.single('photo'), taskController.createTask);
// Admin: List Tasks
router.get('/admin/tasks', authMiddleware, taskController.getAllTasks);

// Get Task Status (Daily Progress)
router.get('/status', authMiddleware, taskController.getTaskStatus);

// Submit Task (Claim Reward)
router.post('/submit', authMiddleware, taskController.submitTask);

module.exports = router;
