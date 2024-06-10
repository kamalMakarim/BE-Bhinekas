const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');

router.post('/addUser', adminController.addUser);
router.get('/getStudents', adminController.getStudents);
router.get('/getTeachers', adminController.getTeachers);
router.get('/getParents', adminController.getParents);
router.get('/getAllKelas', adminController.getAllClasses);
router.get('/getAllExtracurriculars', adminController.getAllExtracurriculars);

module.exports = router;