const { Employee, Department, Position, User, Branch, Company, LeaveBalance, Attendance, Leave } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db'); // FIX: Import sequelize instance
const moment = require('moment');

const generateEmployeeCode = async () => {
  const latestEmployee = await Employee.findOne({
    order: [['employeeCode', 'DESC']],
  });

  let nextCodeNum = 1;
  if (latestEmployee && latestEmployee.employeeCode) {
    const lastCodeNum = parseInt(latestEmployee.employeeCode.replace('EMP', ''), 10);
    if (!isNaN(lastCodeNum)) {
      nextCodeNum = lastCodeNum + 1;
    }
  }
  return `EMP${String(nextCodeNum).padStart(4, '0')}`;
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['name'] },
        { model: Position, as: 'position', attributes: ['name'] }
      ]
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department', attributes: ['name'] },
        { model: Position, as: 'position', attributes: ['name'] }
      ]
    });
    if (!employee) return res.status(404).json({ message: "Not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  const {
    firstName, lastName, email, dateOfJoining, departmentId, positionId, branchId,
    middleName, gender, dateOfBirth, maritalStatus, bloodGroup, personalEmail, personalPhone,
    companyPhone, emergencyContact, emergencyContactName, permanentAddress, currentAddress,
    cityId, pinCode, dateOfConfirmation, probationPeriod, employmentType, reportingManagerId,
    terminationDate, terminationReason, profileImagePath, role,
  } = req.body;

  // CompanyID is no longer required from the client, only branchId
  if (!firstName || !lastName || !email || !dateOfJoining || !departmentId || !positionId || !branchId) {
    return res.status(400).json({ message: 'First Name, Last Name, Email, Date of Joining, Department, Position, and Branch are required.' });
  }

  try {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      const err = new Error(`Branch with ID ${branchId} does not exist.`);
      err.statusCode = 404;
      throw err;
    }
    
    const companyId = branch.companyId;

    const existingEmail = await Employee.findOne({ where: { email } });
    if (existingEmail) {
      const err = new Error('Email already in use');
      err.statusCode = 400;
      throw err;
    }

    const employeeCode = await generateEmployeeCode();

    const newEmployee = await Employee.create({
      companyId: companyId,
      branchId: parseInt(branchId),
      departmentId: parseInt(departmentId),
      positionId: parseInt(positionId),
      employeeCode,
      firstName,
      middleName: middleName || null,
      lastName,
      gender: gender ? gender.charAt(0).toUpperCase() : null,
      dateOfBirth: dateOfBirth || null,
      maritalStatus: maritalStatus || null,
      bloodGroup: bloodGroup || null,
      personalEmail: personalEmail || null,
      email,
      personalPhone: personalPhone || null,
      companyPhone: companyPhone || null,
      emergencyContact: emergencyContact || null,
      emergencyContactName: emergencyContactName || null,
      permanentAddress: permanentAddress || null,
      currentAddress: currentAddress || null,
      cityId: cityId || null,
      pinCode: pinCode || null,
      dateOfJoining,
      dateOfConfirmation: dateOfConfirmation || null,
      probationPeriod: probationPeriod || null,
      employmentType: employmentType || null,
      reportingManagerId: reportingManagerId || null,
      isActive: true,
      terminationDate: terminationDate || null,
      terminationReason: terminationReason || null,
      profileImagePath: profileImagePath || null,
      role: role || 'employee'
    });

    // Re-fetch the created employee to include associated data
    const createdEmployee = await Employee.findOne({
      where: { id: newEmployee.id },
      include: [
        { model: Department, as: 'department', attributes: ['name'] },
        { model: Position, as: 'position', attributes: ['name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: createdEmployee,
    });

  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: String(err.message),
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: "Not found" });

    await employee.update(req.body, { returning: false }); // Prevent conflict with trigger
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getEmployeeProfile = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // First get the user to find their email
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find employee by email
    const employee = await Employee.findOne({
      where: { email: user.email },
      attributes: [
        'id',
        'employeeCode',
        'firstName',
        'middleName',
        'lastName',
        'fullName',
        'email',
        'personalEmail',
        'companyPhone',
        'personalPhone',
        'dateOfJoining',
        'role',
        'profileImagePath',
        'gender',
        'dateOfBirth',
        'maritalStatus',
        'bloodGroup',
        'emergencyContact',
        'emergencyContactName',
        'permanentAddress',
        'currentAddress',
        'pinCode',
        'dateOfConfirmation',
        'probationPeriod',
        'employmentType',
        'isActive',
        'terminationDate',
        'terminationReason',
        'createdDate',
        'modifiedDate',
      ],
      include: [
        { model: Department, as: 'department', attributes: ['name'] },
        { model: Position, as: 'position', attributes: ['name'] },
        { model: Branch, as: 'branch', attributes: ['id', 'branchName'] },
        { model: User, as: 'user', attributes: ['email', 'role'] } // Assuming a User association exists
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log('Fetched Employee Profile:', employee.toJSON()); // Log the employee object

    res.json({
      success: true,
      data: employee
    });
  } catch (err) {
    console.error('Error fetching employee profile:', err);
    res.status(500).json({ message: 'Failed to fetch employee profile', error: err.message });
  }
};

exports.getRecentEmployeeActivities = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const recentActivities = await AuditLog.findAll({
      where: {
        performedById: req.user.id, // Assuming performedById in AuditLog maps to User.id
        entityType: 'Attendance', // Filter for attendance-related activities
        action: { [Op.in]: ['CLOCK_IN', 'CLOCK_OUT', 'REGULARIZATION_REQUEST'] }, // Specific attendance actions
      },
      order: [['timestamp', 'DESC']],
      limit: 5, // Get the 5 most recent activities
    });

    const formattedActivities = recentActivities.map(activity => {
      let description = activity.message || `An action (${activity.action}) occurred.`;
      let type = 'secondary'; // Default type

      if (activity.action === 'CLOCK_IN') {
        type = 'success';
        description = `Clocked in at ${moment(activity.timestamp).format('HH:mm A')}`;
      } else if (activity.action === 'CLOCK_OUT') {
        type = 'info';
        description = `Clocked out at ${moment(activity.timestamp).format('HH:mm A')}`;
      } else if (activity.action === 'REGULARIZATION_REQUEST') {
        type = 'warning';
        description = `Requested attendance regularization`;
      }

      return {
        description,
        time: moment(activity.timestamp).fromNow(),
        type,
      };
    });

    res.json({
      success: true,
      data: formattedActivities,
    });

  } catch (err) {
    console.error("Error fetching recent employee activities:", err);
    res.status(500).json({ message: "Failed to fetch recent activities", error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const emp = await Employee.findByPk(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  await emp.destroy();
  res.json({ message: "Deleted successfully" });
};

exports.getEmployeeDashboardStats = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // 1. Fetch Leave Balance
    const leaveBalance = await LeaveBalance.sum('remaining', {
      where: {
        employeeId: employeeId,
        year: moment().year(),
      },
    });

    // 2. Fetch Attendance for Current Month
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const attendanceThisMonth = await Attendance.count({
      where: {
        employeeId: employeeId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        status: 'present', // Assuming 'present' status indicates attended days
      },
    });

    // 3. Fetch Pending Leave Requests
    const pendingLeaveRequests = await Leave.count({
      where: {
        employeeId: employeeId,
        status: 'pending',
      },
    });

    // 4. Fetch Pending Attendance Regularization Requests
    const pendingRegularizationRequests = await Attendance.count({
      where: {
        employeeId: employeeId,
        isRegularizationRequested: true,
        regularizationStatus: 'pending',
      },
    });

    const pendingRequests = pendingLeaveRequests + pendingRegularizationRequests;

    // 5. Fetch Upcoming Holidays (Placeholder - requires a Holiday model/data)
    // For now, return a static number or an empty array
    const upcomingHolidays = 0; // Replace with actual logic to fetch holidays

    res.json({
      success: true,
      data: {
        leaveBalance: leaveBalance || 0,
        attendanceThisMonth: attendanceThisMonth || 0,
        pendingRequests: pendingRequests,
        upcomingHolidays: upcomingHolidays,
      },
    });

  } catch (err) {
    console.error("Error fetching employee dashboard stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: err.message });
  }
};