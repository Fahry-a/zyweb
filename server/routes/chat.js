const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.use(auth);

// Chat routes
router.get('/chats', chatController.getChats);
router.post('/chats', chatController.createChat);
router.get('/chats/:chatId', chatController.getChatById);
router.post('/chats/:chatId/messages', chatController.sendMessage);
router.get('/chats/:chatId/messages', chatController.getMessages);
router.post('/chats/:chatId/files', chatController.sendFile);

module.exports = router;