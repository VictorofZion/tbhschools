const express = require('express');
const router = express.Router();
const { uploadMaterial, getMaterialsByClass } = require('../controllers/materialController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Teachers & Admins can upload class notes and assignments
router.post('/upload', authenticateToken, authorizeRoles('teacher', 'admin'), uploadMaterial);

// Students and Teachers can fetch class materials by class level
router.get('/class/:classLevel', authenticateToken, getMaterialsByClass);

module.exports = router;