const express = require('express');
const router = express.Router();
const { createAssignment, getAssignmentsByClass } = require('../controllers/assignmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Upload assignments
router.post('/upload', authenticateToken, authorizeRoles('teacher', 'admin'), createAssignment);

// Get assignments for a class
router.get('/class/:classLevel', authenticateToken, getAssignmentsByClass);

module.exports = router;