const express = require('express');
const router = express.Router();

const { 
  createExam, 
  addQuestions, 
  getExamsByClass, 
  getExamQuestions, 
  submitExam 
} = require('../controllers/examController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/create', authenticateToken, authorizeRoles('teacher', 'admin'), createExam);
router.post('/add-questions', authenticateToken, authorizeRoles('teacher', 'admin'), addQuestions);
router.get('/class/:classLevel', authenticateToken, getExamsByClass);
router.get('/questions/:examId', authenticateToken, getExamQuestions);
router.post('/submit', authenticateToken, authorizeRoles('student'), submitExam);

module.exports = router;