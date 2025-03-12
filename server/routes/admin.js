const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Protect all admin routes
router.use(authMiddleware);
router.use(isAdmin);

// Admin routes
router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/unsuspend', adminController.unsuspendUser);
router.get('/logs', adminController.getLogs);

module.exports = router;