const express = require('express');
const router = express.Router();
const multer = require('multer');
const storageController = require('../controllers/storageController');
const auth = require('../middleware/auth');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 1024 * 1024 * 100 } // 100MB max file size
});

router.use(auth);

// Storage routes
router.get('/quota', storageController.getQuota);
router.get('/files', storageController.getFiles);
router.post('/upload', upload.single('file'), storageController.uploadFile);
router.delete('/files/:fileId', storageController.deleteFile);
router.get('/files/:fileId/download', storageController.downloadFile);

module.exports = router;