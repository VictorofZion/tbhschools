const express = require('express');
const router = express.Router();

const { 
  uploadResult, 
  getStudentResults, 
  getStudentsList 
} = require('../controllers/academicController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Teachers & Admins view full student dropdown roster
router.get('/students-list', authenticateToken, authorizeRoles('teacher', 'admin'), getStudentsList);

// Teachers & Admins upload grade results
router.post('/results', authenticateToken, authorizeRoles('teacher', 'admin'), uploadResult);

// View student results
router.get('/results/:studentId', authenticateToken, authorizeRoles('student', 'teacher', 'admin'), getStudentResults);

module.exports = router;