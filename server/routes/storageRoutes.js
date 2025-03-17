const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const storageController = require('../controllers/storageController');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp'); // Temporary storage before moving to database
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});

// Routes
router.get('/info', auth, storageController.getStorageInfo);
router.get('/files', auth, storageController.getFiles);
router.post('/upload', auth, upload.single('file'), storageController.uploadFile);
router.get('/download/:id', auth, storageController.downloadFile);
router.delete('/files/:id', auth, storageController.deleteFile);

module.exports = router;