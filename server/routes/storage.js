const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const storageController = require('../controllers/storageController');
const upload = require('../middleware/uploadMiddleware');

// Semua route membutuhkan autentikasi
router.use(authMiddleware);

// Get storage quota
router.get('/quota', storageController.getQuota);

// Get list of files
router.get('/files', storageController.getFiles);

// Upload file
router.post('/upload', upload.single('file'), storageController.uploadFile);

// Download file
router.get('/download/:id', storageController.downloadFile);

// Delete file
router.delete('/files/:id', storageController.deleteFile);

module.exports = router;