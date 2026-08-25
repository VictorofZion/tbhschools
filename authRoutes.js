const express = require('express');
const router = express.Router();
const { login, createUser } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public Route: Login for Admin, Teachers, and Students
router.post('/login', login);

// Protected Route: Admin creates new users
router.post('/create-user', authenticateToken, authorizeRoles('admin'), createUser);

module.exports = router;