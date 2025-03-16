const express = require('express');
const router = express.Router();
const multer = require('multer');
const storageController = require('../controllers/storageController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});

// Storage routes with proper callback functions
router.get('/quota', auth, storageController.getQuota);
router.get('/files', auth, storageController.getFiles);
router.post('/upload', auth, upload.single('file'), storageController.uploadFile);
router.get('/files/:id/download', auth, storageController.downloadFile);
router.delete('/files/:id', auth, storageController.deleteFile);

module.exports = router;