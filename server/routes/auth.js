const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(authMiddleware);
router.post('/change-password', authController.changePassword);
router.delete('/delete-account', authController.deleteAccount);
router.get('/profile', authController.getProfile);

module.exports = router;