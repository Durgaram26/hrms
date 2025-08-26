const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, allowRoles } = require('../middleware/auth');

// @route   GET /api/leaves
// @desc    Get all leave requests
// @access  Private (Admin, HR)
router.get('/', verifyToken, allowRoles('hr', 'admin'), leaveController.getLeaveRequests);

// @route   PUT /api/leaves/:id
// @desc    Update a leave request status
// @access  Private (Admin, HR)
router.put('/:id', verifyToken, allowRoles('hr', 'admin'), leaveController.updateLeaveRequest);

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Private
router.post('/', verifyToken, leaveController.applyForLeave);

module.exports = router; 