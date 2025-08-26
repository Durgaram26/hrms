const { LeaveBalance, Employee } = require('../models');

async function seedLeaveBalances() {
  try {
    console.log('Starting leave balance seeding...');
    
    // Get all employees
    const employees = await Employee.findAll();
    
    if (employees.length === 0) {
      console.log('No employees found. Please add employees first.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const leaveTypes = [
      { type: 'annual', totalAllowed: 21 },
      { type: 'sick', totalAllowed: 12 },
      { type: 'personal', totalAllowed: 5 },
      { type: 'emergency', totalAllowed: 3 }
    ];

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        await LeaveBalance.findOrCreate({
          where: {
            employeeId: employee.id,
            year: currentYear,
            leaveType: leaveType.type
          },
          defaults: {
            employeeId: employee.id,
            year: currentYear,
            leaveType: leaveType.type,
            totalAllowed: leaveType.totalAllowed,
            used: 0,
            remaining: leaveType.totalAllowed,
            carryForward: 0
          }
        });
        
        console.log(`Leave balance created for employee ${employee.employeeCode} - ${leaveType.type}`);
      }
    }

    console.log('Leave balances seeded successfully!');
  } catch (error) {
    console.error('Error seeding leave balances:', error);
  }
}

module.exports = seedLeaveBalances;