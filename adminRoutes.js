const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, updateFeeStatus } = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.patch('/students/:studentId/fee-status', updateFeeStatus);

module.exports = router;