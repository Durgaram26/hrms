const { Leave, Employee, LeaveBalance, AuditLog, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// Get all leave requests (for HR/Admin)
const getLeaveRequests = async (req, res) => {
    try {
        const { status, employeeId, startDate, endDate, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }
        if (employeeId) {
            whereClause.employeeId = employeeId;
        }
        if (startDate && endDate) {
            whereClause.appliedDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Leave.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'companyId', 'departmentId'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['email']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['email'],
                    required: false
                }
            ],
            order: [['appliedDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                records: rows
            }
        });

    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave requests',
            error: error.message
        });
    }
};

// Apply for leave (for employees)
const applyForLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason, isHalfDay, halfDayPeriod, attachmentPath } = req.body;
        
        // Get employee ID from user
        const user = await User.findOne({
            where: { id: req.user.id },
            include: [{
                model: Employee,
                as: 'employee',
                required: false
            }]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find employee by email
        const employee = await Employee.findOne({
            where: { email: user.email }
        });

        if (!employee) {
            return res.status(400).json({
                success: false,
                message: 'No employee profile associated with this user'
            });
        }

        // Basic validation
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All fields (Leave Type, Start Date, End Date, Reason) are required.'
            });
        }

        // Check if leave dates are valid
        const start = moment(startDate);
        const end = moment(endDate);
        if (start.isAfter(end)) {
            return res.status(400).json({
                success: false,
                message: 'Start Date cannot be after End Date.'
            });
        }

        // Calculate total days
        let totalDays = end.diff(start, 'days') + 1;
        if (isHalfDay) {
            totalDays = 0.5;
        }

        // Check leave balance
        const currentYear = moment().year();
        const employeeLeaveBalance = await LeaveBalance.findOne({
            where: {
                employeeId: employee.id,
                leaveType: leaveType,
                year: currentYear
            }
        });

        if (!employeeLeaveBalance || employeeLeaveBalance.remaining < totalDays) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient leave balance.'
            });
        }
        
        const newLeaveRequest = await Leave.create({
            employeeId: employee.id,
            leaveType: leaveType,
            startDate: startDate,
            endDate: endDate,
            totalDays: totalDays,
            reason: reason,
            status: 'pending',
            appliedDate: new Date(),
            isHalfDay: isHalfDay || false,
            halfDayPeriod: halfDayPeriod || null,
            attachmentPath: attachmentPath || null
        });

        // Log the action
        await AuditLog.create({
            TableName: 'Leaves',
            RecordID: newLeaveRequest.id,
            Action: 'LEAVE_APPLICATION_SUBMITTED',
            OldValues: null,
            NewValues: JSON.stringify(newLeaveRequest.toJSON()),
            UserID: user.email
        });

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully, pending approval.',
            data: newLeaveRequest
        });

    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit leave application',
            error: error.message
        });
    }
};

// Update leave request status (Approve/Reject - for HR/Admin)
const updateLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewComments } = req.body; // status: 'approved' or 'rejected'

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided. Must be "approved" or "rejected".'
            });
        }

        // Get user email for audit log
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const leaveRequest = await Leave.findByPk(id, {
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeCode', 'firstName', 'lastName']
            }]
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        if (leaveRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Leave request is already ${leaveRequest.status} and cannot be modified.`
            });
        }

        const oldStatus = leaveRequest.status;

        await leaveRequest.update({
            status: status,
            reviewedBy: req.user.id,
            reviewedDate: new Date(),
            reviewComments: reviewComments || null
        });

        // Update leave balance if approved
        if (status === 'approved') {
            const currentYear = moment().year();
            const leaveBalance = await LeaveBalance.findOne({
                where: {
                    employeeId: leaveRequest.employeeId,
                    leaveType: leaveRequest.leaveType,
                    year: currentYear
                }
            });

            if (leaveBalance) {
                await leaveBalance.update({
                    used: leaveBalance.used + leaveRequest.totalDays,
                    remaining: leaveBalance.remaining - leaveRequest.totalDays
                });
            }
        }

        // Log the action
        await AuditLog.create({
            TableName: 'Leaves',
            RecordID: leaveRequest.id,
            Action: `LEAVE_APPLICATION_${status.toUpperCase()}`,
            OldValues: JSON.stringify({ status: oldStatus }),
            NewValues: JSON.stringify({ status: status, reviewedBy: req.user.id, reviewComments: reviewComments }),
            UserID: user.email
        });

        res.json({
            success: true,
            message: `Leave request ${status} successfully.`,
            data: leaveRequest
        });

    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave request',
            error: error.message
        });
    }
};

// Get leave requests for current employee
const getMyLeaveRequests = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const employee = await Employee.findOne({
            where: { email: user.email }
        });

        if (!employee) {
            return res.status(400).json({
                success: false,
                message: 'No employee profile associated with this user'
            });
        }

        const leaveRequests = await Leave.findAll({
            where: { employeeId: employee.id },
            include: [{
                model: User,
                as: 'reviewer',
                attributes: ['email'],
                required: false
            }],
            order: [['appliedDate', 'DESC']]
        });

        res.json({
            success: true,
            data: leaveRequests
        });

    } catch (error) {
        console.error('Error fetching employee leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave requests',
            error: error.message
        });
    }
};

// Get leave balance for current employee
const getMyLeaveBalance = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const employee = await Employee.findOne({
            where: { email: user.email }
        });

        if (!employee) {
            return res.status(400).json({
                success: false,
                message: 'No employee profile associated with this user'
            });
        }

        const currentYear = moment().year();
        const leaveBalances = await LeaveBalance.findAll({
            where: { 
                employeeId: employee.id,
                year: currentYear
            }
        });

        res.json({
            success: true,
            data: leaveBalances
        });

    } catch (error) {
        console.error('Error fetching leave balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave balance',
            error: error.message
        });
    }
};

// Withdraw/Cancel leave request (for employees)
const withdrawLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get user from JWT token
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find employee by email
        const employee = await Employee.findOne({
            where: { email: user.email }
        });

        if (!employee) {
            return res.status(400).json({
                success: false,
                message: 'No employee profile associated with this user'
            });
        }

        const leaveRequest = await Leave.findOne({
            where: { 
                id: id,
                employeeId: employee.id
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeCode', 'firstName', 'lastName']
            }]
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found or you do not have permission to withdraw this request.'
            });
        }

        // Only allow withdrawal of pending requests
        if (leaveRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot withdraw a ${leaveRequest.status} leave request. Only pending requests can be withdrawn.`
            });
        }

        const oldStatus = leaveRequest.status;

        await leaveRequest.update({
            status: 'cancelled',
            reviewedBy: req.user.id,
            reviewedDate: new Date(),
            reviewComments: 'Withdrawn by employee'
        });

        // Log the action
        await AuditLog.create({
            TableName: 'Leaves',
            RecordID: leaveRequest.id,
            Action: 'LEAVE_APPLICATION_WITHDRAWN',
            OldValues: JSON.stringify({ status: oldStatus }),
            NewValues: JSON.stringify({ status: 'cancelled', reviewComments: 'Withdrawn by employee' }),
            UserID: user.email
        });

        res.json({
            success: true,
            message: 'Leave request withdrawn successfully.',
            data: leaveRequest
        });

    } catch (error) {
        console.error('Error withdrawing leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to withdraw leave request',
            error: error.message
        });
    }
};

// Delete leave request (for employees - only their own cancelled/rejected requests)
const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get user from JWT token
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find employee by email
        const employee = await Employee.findOne({
            where: { email: user.email }
        });

        if (!employee) {
            return res.status(400).json({
                success: false,
                message: 'No employee profile associated with this user'
            });
        }

        const leaveRequest = await Leave.findOne({
            where: { 
                id: id,
                employeeId: employee.id
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeCode', 'firstName', 'lastName']
            }]
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found or you do not have permission to delete this request.'
            });
        }

        // Only allow deletion of cancelled or rejected requests
        if (!['cancelled', 'rejected'].includes(leaveRequest.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete a ${leaveRequest.status} leave request. Only cancelled or rejected requests can be deleted.`
            });
        }

        // Log the action before deletion
        try {
            await AuditLog.create({
                TableName: 'Leaves',
                RecordID: leaveRequest.id,
                Action: 'LEAVE_APPLICATION_DELETED',
                OldValues: JSON.stringify(leaveRequest.toJSON()),
                NewValues: null,
                UserID: user.email
            });
        } catch (auditError) {
            console.error('Audit log failed for leave deletion:', auditError);
            // Continue with deletion even if audit fails
        }

        await leaveRequest.destroy();

        res.json({
            success: true,
            message: 'Leave request deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete leave request',
            error: error.message
        });
    }
};

// Get leave statistics for HR dashboard
const getLeaveStats = async (req, res) => {
    try {
        const currentYear = moment().year();
        
        // Get pending leave requests count
        const pendingCount = await Leave.count({
            where: { status: 'pending' }
        });
        
        // Get employees on leave today
        const today = moment().format('YYYY-MM-DD');
        const onLeaveToday = await Leave.count({
            where: {
                status: 'approved',
                startDate: { [Op.lte]: today },
                endDate: { [Op.gte]: today }
            }
        });
        
        // Get leave requests by status
        const leavesByStatus = await Leave.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });
        
        res.json({
            success: true,
            data: {
                pendingRequests: pendingCount,
                onLeaveToday: onLeaveToday,
                leavesByStatus: leavesByStatus
            }
        });
        
    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave statistics',
            error: error.message
        });
    }
};

module.exports = {
    getLeaveRequests,
    applyForLeave,
    updateLeaveRequest,
    getMyLeaveRequests,
    getMyLeaveBalance,
    withdrawLeaveRequest,
    deleteLeaveRequest,
    getLeaveStats
}; 