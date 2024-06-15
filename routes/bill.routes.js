const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill.controller.js');

router.get('/getBill', billController.getBill);
router.post('/postBill', billController.postBill);

module.exports = router;
