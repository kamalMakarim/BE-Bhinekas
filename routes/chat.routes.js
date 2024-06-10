const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller.js');

router.get('/getChatLogs', chatController.getChatLogs);
router.post('/postChatLog', chatController.postChatLogs);
module.exports = router;