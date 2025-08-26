const { Attendance, Employee, User, AuditLog } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { GeoFence } = require('../models');
const { Branch } = require('../models');

// Haversine formula to calculate distance between two lat/lon points in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
};

// Clock in functionality
const clockIn = async (req, res) => {
  try {
    const { latitude, longitude, location } = req.body;
    const employeeId = req.user.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile associated with this user'
      });
    }

    // Get employee's branch to find associated geofences
    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: Branch, as: 'branch' }]
    });

    if (!employee || !employee.branchId) {
      return res.status(400).json({
        success: false,
        message: 'Employee branch not found or not assigned'
      });
    }

    const geofences = await GeoFence.findAll({
      where: {
        branchId: employee.branchId,
        isActive: true,
      },
    });

    let isInGeoFence = false;
    if (latitude && longitude && geofences.length > 0) {
      for (const fence of geofences) {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(fence.latitude),
          parseFloat(fence.longitude)
        );
        if (distance <= fence.radiusMeters) {
          isInGeoFence = true;
          break;
        }
      }
    } else if (geofences.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Location data (latitude, longitude) is required for geo-fenced clock-in.'
        });
    }

    // Check if already clocked in today
    const today = moment().startOf('day').toDate();
    const tomorrow = moment().endOf('day').toDate();
    
    const existingAttendance = await Attendance.findOne({
      where: {
        employeeId,
        date: {
          [Op.between]: [today, tomorrow]
        }
      }
    });
    
    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'Already clocked in today'
      });
    }
    
    // Create or update attendance record
    const now = new Date();
    let attendance;
    
    if (existingAttendance) {
      attendance = await existingAttendance.update({
        clockIn: now,
        clockInLocation: location || 'Not specified',
        inLatitude: latitude,
        inLongitude: longitude,
        isInGeoFence: isInGeoFence,
        status: 'present'
      });
    } else {
      attendance = await Attendance.create({
        employeeId,
        date: today,
        clockIn: now,
        clockInLocation: location || 'Not specified',
        inLatitude: latitude,
        inLongitude: longitude,
        isInGeoFence: isInGeoFence,
        status: 'present'
      });
    }
    
    // Log the action
    await AuditLog.create({
      action: 'CLOCK_IN',
      entityType: 'Attendance',
      entityId: attendance.id,
      newValues: {
        clockIn: attendance.clockIn,
        clockInLocation: attendance.clockInLocation,
        inLatitude: attendance.inLatitude,
        inLongitude: attendance.inLongitude,
        isInGeoFence: attendance.isInGeoFence,
        date: moment(attendance.date).format('YYYY-MM-DD'), // Add date for easier filtering
        employeeId: attendance.employeeId, // Add employeeId for filtering
      },
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress,
      // Add a more descriptive message for the audit log
      message: `Employee ${req.user.employeeId} clocked in at ${moment(attendance.clockIn).format('YYYY-MM-DD HH:mm:ss')}`,
    });
    
    res.json({
      success: true,
      message: isInGeoFence ? 'Clocked in successfully' : 'Clocked in, but outside geofence',
      data: attendance
    });
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock in',
      error: error.message
    });
  }
};

// Clock out functionality
const clockOut = async (req, res) => {
  try {
    const { latitude, longitude, location } = req.body;
    const employeeId = req.user.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile associated with this user'
      });
    }

    // Get employee's branch to find associated geofences
    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: Branch, as: 'branch' }]
    });

    if (!employee || !employee.branchId) {
      return res.status(400).json({
        success: false,
        message: 'Employee branch not found or not assigned'
      });
    }

    const geofences = await GeoFence.findAll({
      where: {
        branchId: employee.branchId,
        isActive: true,
      },
    });

    let isOutGeoFence = false;
    if (latitude && longitude && geofences.length > 0) {
      for (const fence of geofences) {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(fence.latitude),
          parseFloat(fence.longitude)
        );
        if (distance <= fence.radiusMeters) {
          isOutGeoFence = true;
          break;
        }
      }
    } else if (geofences.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Location data (latitude, longitude) is required for geo-fenced clock-out.'
        });
    }
    
    // Find today's attendance record
    const today = moment().startOf('day').toDate();
    const tomorrow = moment().endOf('day').toDate();
    
    const attendance = await Attendance.findOne({
      where: {
        employeeId,
        date: {
          [Op.between]: [today, tomorrow]
        }
      }
    });
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No clock-in record found for today'
      });
    }
    
    if (attendance.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'Already clocked out today'
      });
    }
    
    const now = new Date();
    const clockInTime = new Date(attendance.clockIn);
    
    // Calculate work hours (in hours)
    const workHours = (now - clockInTime) / (1000 * 60 * 60);
    
    // Update attendance record
    await attendance.update({
      clockOut: now,
      clockOutLocation: location || 'Not specified',
      outLatitude: latitude,
      outLongitude: longitude,
      isInGeoFence: attendance.isInGeoFence && isOutGeoFence, // Both clock-in and clock-out must be in geofence
      workHours: parseFloat(workHours.toFixed(2))
    });
    
    // Log the action
    await AuditLog.create({
      action: 'CLOCK_OUT',
      entityType: 'Attendance',
      entityId: attendance.id,
      newValues: {
        clockOut: attendance.clockOut,
        clockOutLocation: attendance.clockOutLocation,
        outLatitude: attendance.outLatitude,
        outLongitude: attendance.outLongitude,
        isInGeoFence: attendance.isInGeoFence,
        workHours: attendance.workHours,
        date: moment(attendance.date).format('YYYY-MM-DD'), // Add date for easier filtering
        employeeId: attendance.employeeId, // Add employeeId for filtering
      },
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress,
      // Add a more descriptive message for the audit log
      message: `Employee ${req.user.employeeId} clocked out at ${moment(attendance.clockOut).format('YYYY-MM-DD HH:mm:ss')}`,
    });
    
    res.json({
      success: true,
      message: isOutGeoFence ? 'Clocked out successfully' : 'Clocked out, but outside geofence',
      data: attendance
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock out',
      error: error.message
    });
  }
};

// Get current user's attendance status
const getMyAttendanceStatus = async (req, res) => {
  try {
    const { latitude, longitude } = req.query; // Get lat/lon from query params
    const employeeId = req.user.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile associated with this user'
      });
    }
    
    // Get employee's branch to find associated geofences
    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: Branch, as: 'branch' }]
    });

    if (!employee || !employee.branchId) {
      return res.status(400).json({
        success: false,
        message: 'Employee branch not found or not assigned'
      });
    }

    const geofences = await GeoFence.findAll({
      where: {
        branchId: employee.branchId,
        isActive: true,
      },
    });

    let isInGeoFence = false;
    let geoFenceMessage = '';

    if (latitude && longitude && geofences.length > 0) {
      for (const fence of geofences) {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(fence.latitude),
          parseFloat(fence.longitude)
        );
        if (distance <= fence.radiusMeters) {
          isInGeoFence = true;
          break;
        }
      }
      geoFenceMessage = isInGeoFence ? 'You are within the office geofence.' : 'You are outside the office geofence.';
    } else if (geofences.length > 0) {
      geoFenceMessage = 'Your location is required for geo-fenced attendance. Please enable location services.';
    }
    
    // Find today's attendance record
    const today = moment().startOf('day').toDate();
    const tomorrow = moment().endOf('day').toDate();
    
    const attendance = await Attendance.findOne({
      where: {
        employeeId,
        date: {
          [Op.between]: [today, tomorrow]
        }
      }
    });
    
    if (!attendance) {
      return res.json({
        success: true,
        data: {
          status: 'not-checked-in',
          message: 'Not checked in today',
          isInGeoFence,
          geoFenceMessage,
        }
      });
    }
    
    let status = 'checked-in';
    let message = 'Checked in at ' + moment(attendance.clockIn).format('HH:mm:ss');
    
    if (attendance.clockOut) {
      status = 'checked-out';
      message = `Checked in at ${moment(attendance.clockIn).format('HH:mm:ss')} and checked out at ${moment(attendance.clockOut).format('HH:mm:ss')}. Total work hours: ${attendance.workHours}`;
    }
    
    res.json({
      success: true,
      data: {
        status,
        message,
        attendance,
        isInGeoFence,
        geoFenceMessage,
      }
    });
  } catch (error) {
    console.error('Error getting attendance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance status',
      error: error.message
    });
  }
};

// Get employee's attendance history
const getMyAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { startDate, endDate, page = 1, limit = 31 } = req.query;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile associated with this user'
      });
    }
    
    const whereClause = { employeeId };
    
    // Add date filters if provided
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    const offset = (page - 1) * limit;
    
    // Get attendance records
    const { count, rows } = await Attendance.findAndCountAll({
      where: whereClause,
      order: [['date', 'DESC']],
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
    console.error('Error getting attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance history',
      error: error.message
    });
  }
};

// Get all employees' attendance for HR/Admin
const getAllAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate, employeeId, status, page = 1, limit = 20 } = req.query;
    
    const whereClause = {};
    
    // Add filters if provided
    if (date) {
      whereClause.date = new Date(date);
    } else if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const offset = (page - 1) * limit;
    
    // Get attendance records with employee details
    const { count, rows } = await Attendance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        }
      ],
      order: [['date', 'DESC'], ['employeeId', 'ASC']],
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
    console.error('Error getting all attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance records',
      error: error.message
    });
  }
};

// Request attendance regularization
const requestRegularization = async (req, res) => {
  try {
    const { attendanceId, reason } = req.body;
    const employeeId = req.user.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile associated with this user'
      });
    }
    
    // Find the attendance record
    const attendance = await Attendance.findByPk(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check if this is the employee's own attendance record
    if (attendance.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You can only request regularization for your own attendance'
      });
    }
    
    // Check if regularization is already requested
    if (attendance.isRegularizationRequested) {
      return res.status(400).json({
        success: false,
        message: 'Regularization already requested for this attendance'
      });
    }
    
    // Update attendance record
    await attendance.update({
      isRegularizationRequested: true,
      regularizationReason: reason,
      regularizationStatus: 'pending'
    });
    
    // Log the action
    await AuditLog.create({
      action: 'REGULARIZATION_REQUEST',
      entityType: 'Attendance',
      entityId: attendance.id,
      newValues: { 
        isRegularizationRequested: true,
        regularizationReason: reason,
        regularizationStatus: 'pending'
      },
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      success: true,
      message: 'Regularization requested successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error requesting regularization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request regularization',
      error: error.message
    });
  }
};

// Process regularization request (HR/Admin)
const processRegularization = async (req, res) => {
  try {
    const { attendanceId, status, clockIn, clockOut, workHours } = req.body;
    
    // Find the attendance record
    const attendance = await Attendance.findByPk(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check if there's a pending regularization request
    if (!attendance.isRegularizationRequested || attendance.regularizationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending regularization request for this attendance'
      });
    }
    
    const updateData = {
      regularizationStatus: status,
      regularizationApprovedBy: req.user.id,
      regularizationDate: new Date()
    };
    
    // If approved, update the attendance details
    if (status === 'approved') {
      if (clockIn) updateData.clockIn = new Date(clockIn);
      if (clockOut) updateData.clockOut = new Date(clockOut);
      if (workHours) updateData.workHours = workHours;
    }
    
    // Update attendance record
    await attendance.update(updateData);
    
    // Log the action
    await AuditLog.create({
      action: 'REGULARIZATION_PROCESS',
      entityType: 'Attendance',
      entityId: attendance.id,
      oldValues: {
        regularizationStatus: 'pending'
      },
      newValues: updateData,
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      success: true,
      message: `Regularization request ${status}`,
      data: attendance
    });
  } catch (error) {
    console.error('Error processing regularization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process regularization',
      error: error.message
    });
  }
};

// Get pending regularization requests (HR/Admin)
const getPendingRegularizations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get pending regularization requests
    const { count, rows } = await Attendance.findAndCountAll({
      where: {
        isRegularizationRequested: true,
        regularizationStatus: 'pending'
      },
      include: [
        {
          model: Employee,
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        }
      ],
      order: [['date', 'DESC']],
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
    console.error('Error getting pending regularizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending regularizations',
      error: error.message
    });
  }
};

// Generate attendance report
const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, departmentId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const whereClause = {
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
    
    // Add employee filter if provided
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    
    // Get attendance records
    let attendanceRecords = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          attributes: ['id', 'firstName', 'lastName', 'employeeId', 'departmentId']
        }
      ],
      order: [['employeeId', 'ASC'], ['date', 'ASC']]
    });
    
    // Filter by department if provided
    if (departmentId) {
      attendanceRecords = attendanceRecords.filter(record => 
        record.Employee && record.Employee.departmentId == departmentId
      );
    }
    
    // Process data for report
    const reportData = {};
    
    attendanceRecords.forEach(record => {
      const employeeId = record.employeeId;
      const employeeName = record.Employee ? 
        `${record.Employee.firstName} ${record.Employee.lastName}` : 
        'Unknown Employee';
      
      if (!reportData[employeeId]) {
        reportData[employeeId] = {
          employeeId,
          employeeName,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          totalWorkHours: 0,
          averageWorkHours: 0,
          attendanceRecords: []
        };
      }
      
      reportData[employeeId].totalDays++;
      
      if (record.status === 'present') {
        reportData[employeeId].presentDays++;
      } else if (record.status === 'absent') {
        reportData[employeeId].absentDays++;
      } else if (record.status === 'leave') {
        reportData[employeeId].leaveDays++;
      }
      
      if (record.workHours) {
        reportData[employeeId].totalWorkHours += record.workHours;
      }
      
      reportData[employeeId].attendanceRecords.push({
        date: record.date,
        status: record.status,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        workHours: record.workHours
      });
    });
    
    // Calculate average work hours
    Object.keys(reportData).forEach(key => {
      const employee = reportData[key];
      employee.averageWorkHours = employee.presentDays > 0 ? 
        parseFloat((employee.totalWorkHours / employee.presentDays).toFixed(2)) : 0;
    });
    
    res.json({
      success: true,
      data: {
        reportPeriod: {
          startDate,
          endDate
        },
        employees: Object.values(reportData)
      }
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate attendance report',
      error: error.message
    });
  }
};

// Get geofences for a specific branch
const getBranchGeofences = async (req, res) => {
    try {
        const { branchId } = req.params;

        const geofences = await GeoFence.findAll({
            where: {
                branchId: branchId,
                isActive: true,
            },
            include: [{
                model: Branch,
                as: 'branch',
                attributes: ['branchName']
            }]
        });

        res.json({
            success: true,
            message: 'Geofences fetched successfully',
            data: geofences,
        });
    } catch (error) {
        console.error('Error fetching geofences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch geofences',
            error: error.message,
        });
    }
};

module.exports = {
  clockIn,
  clockOut,
  getMyAttendanceStatus,
  getMyAttendanceHistory,
  getAllAttendance,
  requestRegularization,
  processRegularization,
  getPendingRegularizations,
  generateAttendanceReport,
  getBranchGeofences,
};