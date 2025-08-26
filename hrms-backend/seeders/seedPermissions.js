const { Permission, RolePermission } = require('../models');

async function seedPermissions() {
  try {
    // Define Permissions
    const permissionsToCreate = [
      { name: 'attendance.view', description: 'View all attendance records', module: 'Attendance' },
      { name: 'attendance.manage', description: 'Manage (approve/reject regularization) attendance records', module: 'Attendance' },
      // Add other permissions as needed for other modules
      { name: 'employee.view', description: 'View employee profiles', module: 'Employee' },
      { name: 'employee.manage', description: 'Add/Edit/Delete employee profiles', module: 'Employee' },
      { name: 'department.view', description: 'View department details', module: 'Department' },
      { name: 'department.manage', description: 'Create/Edit/Delete departments', module: 'Department' },
      { name: 'position.view', description: 'View position details', module: 'Position' },
      { name: 'position.manage', description: 'Create/Edit/Delete positions', module: 'Position' },
      { name: 'user.manage_roles', description: 'Assign/Change user roles', module: 'User Management' },
      { name: 'audit_log.view', description: 'View system audit logs', module: 'System' },
    ];

    for (const permData of permissionsToCreate) {
      await Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
      console.log(`Permission '${permData.name}' synced.`);
    }

    // Define Role-Permissions
    // Fetch created permissions to get their IDs
    const attendanceViewPerm = await Permission.findOne({ where: { name: 'attendance.view' } });
    const attendanceManagePerm = await Permission.findOne({ where: { name: 'attendance.manage' } });
    const employeeViewPerm = await Permission.findOne({ where: { name: 'employee.view' } });
    const employeeManagePerm = await Permission.findOne({ where: { name: 'employee.manage' } });
    const departmentViewPerm = await Permission.findOne({ where: { name: 'department.view' } });
    const departmentManagePerm = await Permission.findOne({ where: { name: 'department.manage' } });
    const positionViewPerm = await Permission.findOne({ where: { name: 'position.view' } });
    const positionManagePerm = await Permission.findOne({ where: { name: 'position.manage' } });
    const userManageRolesPerm = await Permission.findOne({ where: { name: 'user.manage_roles' } });
    const auditLogViewPerm = await Permission.findOne({ where: { name: 'audit_log.view' } });


    const rolePermissionsToCreate = [];

    // Admin Role: All permissions
    if (attendanceViewPerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: attendanceViewPerm.id });
    if (attendanceManagePerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: attendanceManagePerm.id });
    if (employeeViewPerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: employeeViewPerm.id });
    if (employeeManagePerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: employeeManagePerm.id });
    if (departmentViewPerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: departmentViewPerm.id });
    if (departmentManagePerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: departmentManagePerm.id });
    if (positionViewPerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: positionViewPerm.id });
    if (positionManagePerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: positionManagePerm.id });
    if (userManageRolesPerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: userManageRolesPerm.id });
    if (auditLogViewPerm) rolePermissionsToCreate.push({ role: 'admin', permissionId: auditLogViewPerm.id });

    // HR Role: Specific permissions
    if (attendanceViewPerm) rolePermissionsToCreate.push({ role: 'hr', permissionId: attendanceViewPerm.id });
    if (attendanceManagePerm) rolePermissionsToCreate.push({ role: 'hr', permissionId: attendanceManagePerm.id });
    if (employeeViewPerm) rolePermissionsToCreate.push({ role: 'hr', permissionId: employeeViewPerm.id });
    if (employeeManagePerm) rolePermissionsToCreate.push({ role: 'hr', permissionId: employeeManagePerm.id });
    if (departmentViewPerm) rolePermissionsToCreate.push({ role: 'hr', permissionId: departmentViewPerm.id });
    if (positionViewPerm) rolePermissionsToCreate.push({ role: 'hr', permissionId: positionViewPerm.id });

    // Employee Role: Limited permissions
    // Employees do not manage attendance directly via this dashboard, but clock in/out
    // They might view their own attendance, which would be handled by a different endpoint/permission if needed.

    for (const rolePermData of rolePermissionsToCreate) {
      await RolePermission.findOrCreate({
        where: {
          role: rolePermData.role,
          permissionId: rolePermData.permissionId
        },
        defaults: rolePermData
      });
      console.log(`Role '${rolePermData.role}' granted permission ID ${rolePermData.permissionId}.`);
    }

    console.log('Permissions and Role-Permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  } finally {
    // process.exit(0); // Only exit if this script is run standalone
  }
}

// seedPermissions(); // Don't run directly here, export for external execution

module.exports = seedPermissions; 