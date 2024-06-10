const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller.js');

router.get('/getMystudents', teacherController.getMystudents);

module.exports = router;