const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// Activity logs routes
router.get('/logs', adminController.getLogs);
router.get('/users/:userId/logs', adminController.getUserLogs);

module.exports = router;