const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller.js');

router.get('/getLogs', logController.getLogs);
router.post('/postLog', logController.postLog);
module.exports = router;