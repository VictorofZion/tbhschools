const express = require('express');
const router = express.Router();
const { initiateRemitaPayment, verifyRemitaPayment } = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Students can initiate fee payments
router.post('/initiate', authenticateToken, authorizeRoles('student', 'admin'), initiateRemitaPayment);

// Verify payment status after checkout
router.post('/verify', authenticateToken, verifyRemitaPayment);

module.exports = router;