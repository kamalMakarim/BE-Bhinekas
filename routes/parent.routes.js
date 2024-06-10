const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller.js');
const logController = require('../controllers/log.controller.js');

router.get('/getLogs', logController.getLogs);
router.get('/getChatLogs', chatController.getChatLogs);
router.post('/postChatLog', chatController.postChatLogs);
module.exports = router;