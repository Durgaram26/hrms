const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, allowRoles } = require('../middleware/auth');

// @route   GET /api/leaves
// @desc    Get all leave requests (for HR/Admin)
// @access  Private (Admin, HR)
router.get('/', verifyToken, allowRoles('hr', 'admin'), leaveController.getLeaveRequests);

// @route   GET /api/leaves/my-requests
// @desc    Get current employee's leave requests
// @access  Private
router.get('/my-requests', verifyToken, leaveController.getMyLeaveRequests);

// @route   GET /api/leaves/my-balance
// @desc    Get current employee's leave balance
// @access  Private
router.get('/my-balance', verifyToken, leaveController.getMyLeaveBalance);

// @route   GET /api/leaves/stats
// @desc    Get leave statistics for dashboard
// @access  Private (Admin, HR)
router.get('/stats', verifyToken, allowRoles('hr', 'admin'), leaveController.getLeaveStats);

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Private
router.post('/', verifyToken, leaveController.applyForLeave);

// @route   PUT /api/leaves/:id
// @desc    Update a leave request status (Approve/Reject)
// @access  Private (Admin, HR)
router.put('/:id', verifyToken, allowRoles('hr', 'admin'), leaveController.updateLeaveRequest);

// @route   PUT /api/leaves/:id/withdraw
// @desc    Withdraw/Cancel a pending leave request
// @access  Private (Employee - own requests only)
router.put('/:id/withdraw', verifyToken, leaveController.withdrawLeaveRequest);

// @route   DELETE /api/leaves/:id
// @desc    Delete a cancelled/rejected leave request
// @access  Private (Employee - own requests only)
router.delete('/:id', verifyToken, leaveController.deleteLeaveRequest);

module.exports = router; 