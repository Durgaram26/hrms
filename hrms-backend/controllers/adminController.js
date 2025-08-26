const { User, Permission, RolePermission, AuditLog, GeoFence, Branch, City, State, Country, Company, Employee } = require('../models');
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const moment = require('moment'); // Added for date formatting

// Get all users for role management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'hr', 'employee', 'manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: admin, hr, employee, manager'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent users from changing their own role
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const oldRole = user.role;
    await user.update({ role });

    // Log the role change in audit log
    await AuditLog.create({
      action: 'ROLE_UPDATE',
      entityType: 'User',
      entityId: user.id,
      oldValues: { role: oldRole },
      newValues: { role: user.role },
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// Get all permissions
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['module', 'ASC'], ['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
};

// Get permissions for a specific role
const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    const validRoles = ['admin', 'hr', 'employee', 'manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: admin, hr, employee, manager'
      });
    }
    
    const rolePermissions = await RolePermission.findAll({
      where: { role },
      include: [{ model: Permission, as: 'permission' }]
    });
    
    res.json({
      success: true,
      data: rolePermissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role permissions',
      error: error.message
    });
  }
};

// Update role permissions
const updateRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;
    
    // Validate role
    const validRoles = ['admin', 'hr', 'employee', 'manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: admin, hr, employee, manager'
      });
    }
    
    // Validate permissions exist
    const permissions = await Permission.findAll({
      where: { id: permissionIds }
    });
    
    if (permissions.length !== permissionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more permission IDs are invalid'
      });
    }
    
    // Get current permissions for audit logging
    const currentPermissions = await RolePermission.findAll({
      where: { role },
      include: [{ model: Permission }]
    });
    
    const oldPermissionIds = currentPermissions.map(rp => rp.permissionId);
    
    // Delete all current permissions for the role
    await RolePermission.destroy({ where: { role } });
    
    // Add new permissions
    const rolePermissions = await Promise.all(
      permissionIds.map(permissionId => 
        RolePermission.create({ role, permissionId })
      )
    );
    
    // Log the permission changes
    await AuditLog.create({
      action: 'PERMISSION_UPDATE',
      entityType: 'Role',
      entityId: 0, // No specific ID for roles
      oldValues: { permissionIds: oldPermissionIds },
      newValues: { permissionIds },
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      success: true,
      message: `Permissions updated for role: ${role}`,
      data: rolePermissions
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role permissions',
      error: error.message
    });
  }
};

// Create a new permission
const createPermission = async (req, res) => {
  try {
    const { name, description, module } = req.body;
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission with this name already exists'
      });
    }
    
    const permission = await Permission.create({
      name,
      description,
      module
    });
    
    // Log the permission creation
    await AuditLog.create({
      action: 'PERMISSION_CREATE',
      entityType: 'Permission',
      entityId: permission.id,
      newValues: { name, description, module },
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error.message
    });
  }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, entityType } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (action) whereClause.action = action;
    if (entityType) whereClause.entityType = entityType;
    
    const logs = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        logs: logs.rows,
        totalCount: logs.count,
        totalPages: Math.ceil(logs.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

// Create a new geo-fence
const createGeofence = async (req, res) => {
  try {
    const { geoFenceName, branchId, latitude, longitude, radiusMeters } = req.body;

    if (!geoFenceName || !branchId || !latitude || !longitude || !radiusMeters) {
      return res.status(400).json({ success: false, message: 'All geo-fence fields are required.' });
    }

    const geoFence = await GeoFence.create({
      geoFenceName,
      branchId,
      latitude,
      longitude,
      radiusMeters,
      isActive: true, // Default to active
      createdDate: new Date(),
    });

    // Re-fetch the geofence to include the associated Branch data
    const newGeoFenceWithBranch = await GeoFence.findByPk(geoFence.id, {
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['branchName'], // Only fetch the branch name
      }],
    });

    // FIX: Wrap AuditLog creation in try-catch to prevent 500 if audit fails
    try {
      await AuditLog.create({
        action: 'CREATE',
        entityType: 'GeoFence',
        // FIX: Use geoFence.id, as Sequelize often maps primary keys to 'id'
        entityId: geoFence.id, 
        newValues: geoFence.toJSON(),
        performedById: req.user?.id, // Use optional chaining
        performedByEmail: req.user?.email, // Use optional chaining
        ipAddress: req.ip || req.connection.remoteAddress
      });
    } catch (auditErr) {
      console.error('AuditLog error (geo-fence create):', auditErr);
      // Do not re-throw, allow geo-fence creation to succeed even if audit fails.
    }

    res.status(201).json({ success: true, message: 'Geo-fence created successfully', data: newGeoFenceWithBranch });
  } catch (error) {
    console.error('Error creating geo-fence:', error);
    res.status(500).json({ success: false, message: 'Failed to create geo-fence', error: error.message });
  }
};

// Delete a geo-fence
const deleteGeofence = async (req, res) => {
  try {
    const { id } = req.params;

    const geoFence = await GeoFence.findByPk(id);
    if (!geoFence) {
      return res.status(404).json({ success: false, message: 'Geo-fence not found.' });
    }

    await geoFence.destroy();

    // FIX: Wrap AuditLog creation in a try-catch block to prevent failure
    try {
      await AuditLog.create({
        action: 'DELETE',
        entityType: 'GeoFence',
        entityId: id, // Use the id from params directly
        oldValues: geoFence.toJSON(),
        // FIX: Use optional chaining to prevent crash if req.user is undefined
        performedById: req.user?.id,
        performedByEmail: req.user?.email,
        ipAddress: req.ip || req.connection.remoteAddress,
      });
    } catch (auditErr) {
      console.error('AuditLog error (geo-fence delete):', auditErr);
      // Do not re-throw; allow the deletion to be considered a success
    }

    res.json({ success: true, message: 'Geo-fence deleted successfully' });
  } catch (error) {
    console.error('Error deleting geo-fence:', error);
    res.status(500).json({ success: false, message: 'Failed to delete geo-fence', error: error.message });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const { companyId } = req.query; // Get companyId from query parameter
    const whereClause = {};
    if (companyId) {
      whereClause.companyId = parseInt(companyId); // Filter by companyId if provided
    }

    const branches = await Branch.findAll({
      where: whereClause, // Apply filter
      include: [
        { model: City, as: 'city', include: [{ model: State, as: 'state', include: [{ model: Country, as: 'country' }] }] },
      ],
      order: [['branchName', 'ASC']]
    });

    res.json({ success: true, data: branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
  }
};

// Create a new branch
const createBranch = async (req, res) => {
  try {
    const { branchName, branchCode, address, cityId, phone, email, isHeadOffice, companyId } = req.body; // FIX: Destructure companyId from req.body

    if (!branchName || !branchCode || !address || !cityId || !companyId) { // FIX: Add companyId to required fields
      return res.status(400).json({ success: false, message: 'Branch Name, Code, Address, City, and Company are required.' });
    }

    // Removed hardcoded companyId = 1
    
    const branch = await Branch.create({
      companyId: parseInt(companyId), // FIX: Ensure companyId is integer
      branchName,
      branchCode,
      address,
      cityId: parseInt(cityId), // Ensure cityId is integer
      phone,
      email,
      isHeadOffice: isHeadOffice || false,
      isActive: true,
      createdDate: new Date(),
    });

    // FIX: Wrap AuditLog creation in try-catch to prevent 500 if audit fails
    try {
      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Branch',
        // FIX: Use branch.id directly, as Sequelize typically maps primary keys to 'id'
        entityId: branch.id, 
        newValues: branch.toJSON(),
        performedById: req.user?.id, // Use optional chaining
        performedByEmail: req.user?.email, // Use optional chaining
        ipAddress: req.ip || req.connection.remoteAddress
      });
    } catch (auditErr) {
      console.error('AuditLog error (branch create):', auditErr);
      // Do not re-throw, allow branch creation to succeed even if audit fails.
    }

    res.status(201).json({ success: true, message: 'Branch created successfully', data: branch });
  } catch (error) {
    console.error('Error creating branch:', error);
    // FIX: Comprehensive error handling for branch creation
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const value = error.errors[0]?.value || 'this value';
      return res.status(400).json({ success: false, message: `Failed to create branch: Duplicate ${field} '${value}'. Please use a unique value.`, error: error.message });
    } else if (error.name === 'SequelizeValidationError') {
      const field = error.errors[0]?.path || 'field';
      const message = error.errors[0]?.message || 'Invalid data provided.';
      return res.status(400).json({ success: false, message: `Validation Error: ${field} - ${message}`, error: error.message });
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      // This means the companyId or cityId provided might not exist or be invalid.
      return res.status(400).json({ success: false, message: 'Failed to create branch: Invalid Company or City ID provided. Ensure the company and city exist.', error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create branch', error: error.message });
  }
};

// Update an existing branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, branchCode, address, cityId, phone, email, isHeadOffice, isActive } = req.body;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    const oldValues = branch.toJSON();

    await branch.update({
      branchName: branchName || branch.branchName,
      branchCode: branchCode || branch.branchCode,
      address: address || branch.address,
      cityId: cityId ? parseInt(cityId) : branch.cityId,
      phone: phone || branch.phone,
      email: email || branch.email,
      isHeadOffice: typeof isHeadOffice === 'boolean' ? isHeadOffice : branch.isHeadOffice,
      isActive: typeof isActive === 'boolean' ? isActive : branch.isActive,
      modifiedDate: new Date(),
    });

    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'Branch',
      entityId: branch.branchId,
      oldValues,
      newValues: branch.toJSON(),
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'Branch updated successfully', data: branch });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ success: false, message: 'Failed to update branch', error: error.message });
  }
};

// Delete a branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    await branch.destroy();

    await AuditLog.create({
      action: 'DELETE',
      entityType: 'Branch',
      entityId: branch.branchId,
      oldValues: branch.toJSON(),
      performedById: req.user.id,
      performedByEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ success: false, message: 'Failed to delete branch', error: error.message });
  }
};

// Get all cities (for dropdowns)
const getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll({
      include: [
        { model: State, as: 'state', include: [{ model: Country, as: 'country' }] },
      ],
      order: [['cityName', 'ASC']]
    });
    res.json({ success: true, data: cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities', error: error.message });
  }
};

// Get all states (Used in City/Company Management)
const getAllStates = async (req, res) => {
  try {
    const { countryId } = req.query; // Filter by countryId if provided
    const whereClause = {};

    if (countryId) {
      const parsedCountryId = parseInt(countryId);
      // FIX: Add validation to ensure countryId is a valid number
      if (isNaN(parsedCountryId) || parsedCountryId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid Country ID provided. Must be a positive number.' });
      }
      whereClause.countryId = parsedCountryId;
    }
    
    const states = await State.findAll({
      where: whereClause,
      include: [
        { model: Country, as: 'country' },
      ],
      order: [['stateName', 'ASC']]
    });
    res.json({ success: true, data: states });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch states', error: error.message });
  }
};

// Create a new city
const createCity = async (req, res) => {
  try {
    const { cityName, cityCode, stateId } = req.body;

    if (!cityName || !stateId) {
      return res.status(400).json({ success: false, message: 'City Name and State are required.' });
    }

    const city = await City.create({
      cityName,
      cityCode,
      stateId: parseInt(stateId),
      isActive: true,
      createdDate: new Date(),
    });

    console.log('Audit Log Create City:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('city.cityId:', city.cityId);

    // FIX: Wrap AuditLog creation in try-catch to prevent 500 if audit fails
    try {
      await AuditLog.create({
        action: 'CREATE',
        entityType: 'City',
        // FIX: Ensure city.id is used for entityId
        entityId: city.id, 
        newValues: city.toJSON(),
        performedById: req.user?.id, // Use optional chaining
        performedByEmail: req.user?.email, // Use optional chaining
        ipAddress: req.ip || req.connection.remoteAddress
      });
    } catch (auditErr) {
      console.error('AuditLog error (city create):', auditErr);
      // Do not re-throw, allow city creation to succeed even if audit fails.
    }

    res.status(201).json({ success: true, message: 'City created successfully', data: city });
  } catch (error) {
    console.error('Error creating city:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const value = error.errors[0]?.value || 'this value';
      return res.status(400).json({ success: false, message: `Failed to create city: Duplicate ${field} '${value}'. Please use a unique value.`, error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create city', error: error.message });
  }
};

// Update an existing city
const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName, cityCode, stateId, isActive } = req.body;

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const oldValues = city.toJSON();

    await city.update({
      cityName: cityName || city.cityName,
      cityCode: cityCode || city.cityCode,
      stateId: stateId ? parseInt(stateId) : city.stateId,
      isActive: typeof isActive === 'boolean' ? isActive : city.isActive,
      modifiedDate: new Date(),
    });

    console.log('Audit Log Update City:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('city.cityId:', city.cityId);

    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'City',
      entityId: city.cityId,
      oldValues,
      newValues: city.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'City updated successfully', data: city });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ success: false, message: 'Failed to update city', error: error.message });
  }
};

// Delete a city
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    // Check for associated branches/companies before deleting
    const associatedBranches = await Branch.count({ where: { cityId: id } });
    const associatedCompanies = await Company.count({ where: { cityId: id } });
    
    if (associatedBranches > 0 || associatedCompanies > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete city: it is associated with branches or companies. Please update them first.' });
    }

    await city.destroy();

    console.log('Audit Log Delete City:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('city.cityId:', city.cityId);

    await AuditLog.create({
      action: 'DELETE',
      entityType: 'City',
      entityId: city.cityId,
      oldValues: city.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ success: false, message: 'Failed to delete city', error: error.message });
  }
};

// Get all countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      order: [['countryName', 'ASC']]
    });
    res.json({ success: true, data: countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch countries', error: error.message });
  }
};

// Create a new country
const createCountry = async (req, res) => {
  try {
    const { countryName, countryCode } = req.body;

    if (!countryName || !countryCode) {
      return res.status(400).json({ success: false, message: 'Country Name and Code are required.' });
    }

    const country = await Country.create({
      countryName,
      countryCode,
      isActive: true,
      createdDate: new Date(),
    });

    // Try to create audit log, but do not fail if it errors
    try {
      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Country',
        // FIX: Use the primary key from the instance.
        entityId: country.get('countryId'),
        newValues: country.toJSON(),
        performedById: req.user?.id || 0,
        performedByEmail: req.user?.email || 'system',
        ipAddress: req.ip || req.connection.remoteAddress
      });
    } catch (auditErr) {
      console.error('AuditLog error (country create):', auditErr);
      // Do not throw
    }

    res.status(201).json({ success: true, message: 'Country created successfully', data: country });
  } catch (error) {
    console.error('Error creating country:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const value = error.errors[0]?.value || 'this value';
      return res.status(400).json({ success: false, message: `Failed to create country: Duplicate ${field} '${value}'. Please use a unique value.`, error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create country', error: error.message });
  }
};

// Update an existing country
const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { countryName, countryCode, isActive } = req.body;

    const country = await Country.findByPk(id);
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found.' });
    }

    const oldValues = country.toJSON();

    await country.update({
      countryName: countryName || country.countryName,
      countryCode: countryCode || country.countryCode,
      isActive: typeof isActive === 'boolean' ? isActive : country.isActive,
      modifiedDate: new Date(),
    });

    console.log('Audit Log Create Country Update:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('country.countryId:', country.countryId);

    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'Country',
      entityId: country.countryId,
      oldValues,
      newValues: country.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'Country updated successfully', data: country });
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ success: false, message: 'Failed to update country', error: error.message });
  }
};

// Delete a country
const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByPk(id);
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found.' });
    }

    // Check for associated states before deleting
    const associatedStates = await State.count({ where: { countryId: id } });
    if (associatedStates > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete country: it is associated with states. Please update them first.' });
    }

    await country.destroy();

    console.log('Audit Log Delete Country:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('country.countryId:', country.countryId);

    await AuditLog.create({
      action: 'DELETE',
      entityType: 'Country',
      entityId: country.countryId,
      oldValues: country.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ success: false, message: 'Failed to delete country', error: error.message });
  }
};

// Create a new state
const createState = async (req, res) => {
  try {
    const { stateName, stateCode, countryId } = req.body;

    if (!stateName || !countryId) {
      return res.status(400).json({ success: false, message: 'State Name and Country are required.' });
    }
    if (isNaN(parseInt(countryId))) {
      return res.status(400).json({ success: false, message: 'Invalid countryId for state creation.' });
    }

    const state = await State.create({
      stateName,
      stateCode,
      countryId: parseInt(countryId),
      isActive: true,
      createdDate: new Date(),
    });

    // Try to create audit log, but do not fail if it errors
    try {
      await AuditLog.create({
        action: 'CREATE',
        entityType: 'State',
        // FIX: Use the primary key from the instance.
        entityId: state.get('stateId'),
        newValues: state.toJSON(),
        performedById: req.user?.id || 0,
        performedByEmail: req.user?.email || 'system',
        ipAddress: req.ip || req.connection.remoteAddress
      });
    } catch (auditErr) {
      console.error('AuditLog error (state create):', auditErr);
    }

    res.status(201).json({ success: true, message: 'State created successfully', data: state });
  } catch (error) {
    console.error('Error creating state:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const value = error.errors[0]?.value || 'this value';
      return res.status(400).json({ success: false, message: `Failed to create state: Duplicate ${field} '${value}'. Please use a unique value.`, error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create state', error: error.message });
  }
};

// Update an existing state
const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName, stateCode, countryId, isActive } = req.body;

    const state = await State.findByPk(id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found.' });
    }

    const oldValues = state.toJSON();

    await state.update({
      stateName: stateName || state.stateName,
      stateCode: stateCode || state.stateCode,
      countryId: countryId ? parseInt(countryId) : state.countryId,
      isActive: typeof isActive === 'boolean' ? isActive : state.isActive,
      modifiedDate: new Date(),
    });

    console.log('Audit Log Update State:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('state.stateId:', state.stateId);

    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'State',
      entityId: state.stateId,
      oldValues,
      newValues: state.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'State updated successfully', data: state });
  } catch (error) {
    console.error('Error updating state:', error);
    res.status(500).json({ success: false, message: 'Failed to update state', error: error.message });
  }
};

// Delete a state
const deleteState = async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findByPk(id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found.' });
    }

    // Check for associated cities before deleting
    const associatedCities = await City.count({ where: { stateId: id } });
    if (associatedCities > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete state: it is associated with cities. Please update them first.' });
    }

    await state.destroy();

    console.log('Audit Log Delete State:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('state.stateId:', state.stateId);

    await AuditLog.create({
      action: 'DELETE',
      entityType: 'State',
      entityId: state.stateId,
      oldValues: state.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'State deleted successfully' });
  } catch (error) {
    console.error('Error deleting state:', error);
    res.status(500).json({ success: false, message: 'Failed to delete state', error: error.message });
  }
};


// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [
        { model: City, as: 'city', include: [{ model: State, as: 'state', include: [{ model: Country, as: 'country' }] }] },
      ],
      order: [['companyName', 'ASC']]
    });
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch companies', error: error.message });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id, {
      include: [
        { model: City, as: 'city', include: [{ model: State, as: 'state', include: [{ model: Country, as: 'country' }] }] },
      ],
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company details', error: error.message });
  }
};

// Create a new company (inline country/state/city/branches creation)
const createCompany = async (req, res) => {
  try {
    let {
      companyName,
      companyCode,
      address,
      countryId,
      countryName,
      countryCode: newCountryCode,
      stateId,
      stateName,
      stateCode: newStateCode,
      cityId,
      cityName,
      cityCode: newCityCode,
      phone,
      email,
      website,
      taxId,
      pan,
      gst,
      branches // Array of branches with branchName, branchCode, address, state/city info
    } = req.body;

    // 1. Country
    if (!countryId && countryName) {
      try { // ADDED try...catch for nested country creation
        let country = await Country.findOne({ where: { countryName } });
        if (!country) {
          country = await Country.create({ countryName, countryCode: newCountryCode || '', isActive: true, createdDate: new Date() });
        }
        // FIX: Use .id for consistency if primary key is mapped to 'id' by Sequelize
        countryId = country.id || country.countryId;
      } catch (nestedError) {
        if (nestedError.name === 'SequelizeUniqueConstraintError') {
          const field = nestedError.errors[0]?.path || 'field';
          const value = nestedError.errors[0]?.value || 'this value';
          return res.status(400).json({ success: false, message: `Failed to create company: Duplicate country ${field} '${value}'. Please use a unique value for country.`, error: nestedError.message });
        }
        throw nestedError; // Re-throw other errors to be caught by the main try-catch
      }
    }
    if (!countryId) return res.status(400).json({ success: false, message: 'Country is required.' });

    // 2. State
    if (!stateId && stateName) {
      try { // ADDED try...catch for nested state creation
        let state = await State.findOne({ where: { stateName, countryId } });
        if (!state) {
          state = await State.create({ stateName, stateCode: newStateCode || '', countryId, isActive: true, createdDate: new Date() });
        }
        // FIX: Use .id for consistency
        stateId = state.id || state.stateId;
      } catch (nestedError) {
        if (nestedError.name === 'SequelizeUniqueConstraintError') {
          const field = nestedError.errors[0]?.path || 'field';
          const value = nestedError.errors[0]?.value || 'this value';
          return res.status(400).json({ success: false, message: `Failed to create company: Duplicate state ${field} '${value}'. Please use a unique value for state.`, error: nestedError.message });
        }
        throw nestedError; // Re-throw other errors
      }
    }
    if (!stateId) return res.status(400).json({ success: false, message: 'State is required.' });

    // 3. City
    if (!cityId && cityName) {
      try { // ADDED try...catch for nested city creation
        let city = await City.findOne({ where: { cityName, stateId } });
        if (!city) {
          city = await City.create({ cityName, cityCode: newCityCode || '', stateId, isActive: true, createdDate: new Date() });
        }
        // FIX: Use .id for consistency
        cityId = city.id || city.cityId;
      } catch (nestedError) {
        if (nestedError.name === 'SequelizeUniqueConstraintError') {
          const field = nestedError.errors[0]?.path || 'field';
          const value = nestedError.errors[0]?.value || 'this value';
          return res.status(400).json({ success: false, message: `Failed to create company: Duplicate city ${field} '${value}'. Please use a unique value for city.`, error: nestedError.message });
        }
        throw nestedError; // Re-throw other errors
      }
    }
    if (!cityId) return res.status(400).json({ success: false, message: 'City is required.' });

    // 4. Create Company
    const company = await Company.create({
      companyName,
      companyCode,
      address,
      cityId,
      phone,
      email,
      website,
      taxId,
      pan,
      gst,
      isActive: true,
      createdDate: new Date(),
    });

    // 5. Branches (if provided)
    let createdBranches = [];
    if (Array.isArray(branches)) {
      for (const branch of branches) {
        let { branchName, branchCode, address: branchAddress, stateId: branchStateId, stateName: branchStateName, stateCode: branchStateCode, cityId: branchCityId, cityName: branchCityName, cityCode: branchCityCode, phone: branchPhone, email: branchEmail, isHeadOffice } = branch;

        // State for branch
        if (!branchStateId && branchStateName) {
          try {
            let state = await State.findOne({ where: { stateName: branchStateName, countryId } });
            if (!state) {
              state = await State.create({ stateName: branchStateName, stateCode: branchStateCode || '', countryId, isActive: true, createdDate: new Date() });
            }
            // FIX: Use .id for consistency for nested state
            branchStateId = state.id || state.stateId;
          } catch (nestedError) {
            if (nestedError.name === 'SequelizeUniqueConstraintError') {
              const field = nestedError.errors[0]?.path || 'field';
              const value = nestedError.errors[0]?.value || 'this value';
              return res.status(400).json({ success: false, message: `Failed to create company: Duplicate state ${field} '${value}' in branch.`, error: nestedError.message });
            }
            throw nestedError; // Re-throw other errors
          }
        }

        // City for branch
        if (!branchCityId && branchCityName) {
          try {
            let city = await City.findOne({ where: { cityName: branchCityName, stateId: branchStateId } });
            if (!city) {
              city = await City.create({ cityName: branchCityName, cityCode: branchCityCode || '', stateId: branchStateId, isActive: true, createdDate: new Date() });
            }
            // FIX: Use .id for consistency for nested city
            branchCityId = city.id || city.cityId;
          } catch (nestedError) {
            if (nestedError.name === 'SequelizeUniqueConstraintError') {
              const field = nestedError.errors[0]?.path || 'field';
              const value = nestedError.errors[0]?.value || 'this value';
              return res.status(400).json({ success: false, message: `Failed to create company: Duplicate city ${field} '${value}' in branch.`, error: nestedError.message });
            }
            throw nestedError; // Re-throw other errors
          }
        }

        // Create branch
        const createdBranch = await Branch.create({
          companyId: company.id, // FIX: Ensure company.id is used, not company.companyId
          branchName,
          branchCode,
          address: branchAddress,
          // FIX: Ensure branchCityId is a valid number, handle potential undefined/null from frontend
          cityId: branchCityId ? parseInt(branchCityId) : null, 
          phone: branchPhone,
          email: branchEmail,
          isHeadOffice: !!isHeadOffice,
          isActive: true,
          createdDate: new Date(),
        });
        createdBranches.push(createdBranch);
      }
    }

    res.status(201).json({ success: true, message: 'Company created successfully', data: { companyId: company.id, company, branches: createdBranches } });
  } catch (error) {
    console.error('Error creating company:', error);
    // FIX: Comprehensive error handling for company creation
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const value = error.errors[0]?.value || 'this value';
      return res.status(400).json({ success: false, message: `Failed to create company: Duplicate ${field} '${value}'. Please use a unique value.`, error: error.message });
    } else if (error.name === 'SequelizeValidationError') {
      const field = error.errors[0]?.path || 'field';
      const message = error.errors[0]?.message || 'Invalid data provided.';
      return res.status(400).json({ success: false, message: `Validation Error: ${field} - ${message}`, error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create company', error: error.message });
  }
};

// Update an existing company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, companyCode, address, cityId, phone, email, website, taxId, pan, gst, isActive } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const oldValues = company.toJSON();

    await company.update({
      companyName: companyName || company.companyName,
      companyCode: companyCode || company.companyCode,
      address: address || company.address,
      cityId: cityId ? parseInt(cityId) : company.cityId,
      phone: phone || company.phone,
      email: email || company.email,
      website: website || company.website,
      taxId: taxId || company.taxId,
      pan: pan || company.pan,
      gst: gst || company.gst,
      isActive: typeof isActive === 'boolean' ? isActive : company.isActive,
      modifiedDate: new Date(),
    });

    console.log('Audit Log Update Company:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('company.companyId:', company.companyId);

    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'Company',
      entityId: company.companyId,
      oldValues,
      newValues: company.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'Company updated successfully', data: company });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ success: false, message: 'Failed to update company', error: error.message });
  }
};

// Delete a company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Check for associated branches before deleting
    const associatedBranches = await Branch.count({ where: { companyId: id } });
    if (associatedBranches > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete company: branches are associated. Please delete branches first.' });
    }

    await company.destroy();

    console.log('Audit Log Delete Company:');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.email:', req.user?.email);
    console.log('company.companyId:', company.companyId);

    await AuditLog.create({
      action: 'DELETE',
      entityType: 'Company',
      entityId: company.companyId,
      oldValues: company.toJSON(),
      performedById: req.user?.id, // Use optional chaining
      performedByEmail: req.user?.email, // Use optional chaining
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    // FIX: More specific error handling for deletion, especially for foreign key constraints
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      // This means other entities like Employees, Departments, etc., are still linked.
      // You might need to extend this check to other tables explicitly if they are not already handled.
      return res.status(400).json({ success: false, message: 'Cannot delete company: It is still associated with other records (e.g., employees, departments, branches). Please delete or reassign them first.', error: error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      const value = error.errors[0]?.value || 'this value';
      return res.status(400).json({ success: false, message: `Failed to delete company: Duplicate ${field} '${value}'. Please use a unique value.`, error: error.message });
    } else if (error.name === 'SequelizeValidationError') {
      const field = error.errors[0]?.path || 'field';
      const message = error.errors[0]?.message || 'Invalid data provided.';
      return res.status(400).json({ success: false, message: `Validation Error: ${field} - ${message}`, error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to delete company', error: error.message });
  }
};

// Initialize default permissions (updated to include all geographical permissions)
const initializeDefaultPermissions = async () => {
  try {
    const defaultPermissions = [
      // Employee module permissions
      { name: 'employee.view', description: 'View employee details', module: 'Employee' },
      { name: 'employee.create', description: 'Create new employees', module: 'Employee' },
      { name: 'employee.edit', description: 'Edit employee details', module: 'Employee' },
      { name: 'employee.delete', description: 'Delete employees', module: 'Employee' },
      
      // Department module permissions
      { name: 'department.view', description: 'View departments', module: 'Department' },
      { name: 'department.create', description: 'Create departments', module: 'Department' },
      { name: 'department.edit', description: 'Edit departments', module: 'Department' },
      { name: 'department.delete', description: 'Delete departments', module: 'Department' },
      
      // Position module permissions
      { name: 'position.view', description: 'View positions', module: 'Position' },
      { name: 'position.create', description: 'Create positions', module: 'Position' },
      { name: 'position.edit', description: 'Edit positions', module: 'Position' },
      { name: 'position.delete', description: 'Delete positions', module: 'Position' },
      
      // User management permissions
      { name: 'user.view', description: 'View users', module: 'User' },
      { name: 'user.edit', description: 'Edit users', module: 'User' },
      { name: 'role.manage', description: 'Manage user roles', module: 'User' },
      { name: 'permission.manage', description: 'Manage permissions', module: 'User' },
      
      // Attendance module permissions
      { name: 'attendance.view', description: 'View attendance records', module: 'Attendance' },
      { name: 'attendance.manage', description: 'Manage attendance records', module: 'Attendance' },
      { name: 'attendance.report', description: 'Generate attendance reports', module: 'Attendance' },
      { name: 'attendance.regularize', description: 'Approve/reject attendance regularization', module: 'Attendance' },
      
      // Audit log permissions
      { name: 'audit.view', description: 'View audit logs', module: 'System' },
      
      // Geo-fence module permissions
      { name: 'geofence.manage', description: 'Manage geo-fence locations', module: 'Attendance' },
      // Branch view permission for dropdown
      { name: 'branch.view', description: 'View branches', module: 'HR' },
      // Company module permissions
      { name: 'company.view', description: 'View company details', module: 'HR' },
      { name: 'company.manage', description: 'Manage company profiles', module: 'HR' },
      { name: 'city.view', description: 'View cities', module: 'System' },
      { name: 'city.manage', description: 'Manage cities', module: 'System' },
      { name: 'country.view', description: 'View countries', module: 'System' },
      { name: 'country.manage', description: 'Manage countries', module: 'System' },
      { name: 'state.view', description: 'View states', module: 'System' },
      { name: 'state.manage', description: 'Manage states', module: 'System' }
    ];
    
    // Create permissions if they don't exist
    for (const perm of defaultPermissions) {
      await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: perm
      });
    }
    
    // Set default permissions for roles
    const adminPermissions = await Permission.findAll();
    const adminPermissionIds = adminPermissions.map(p => p.id);
    
    // Admin has all permissions
    for (const permId of adminPermissionIds) {
      await RolePermission.findOrCreate({
        where: { role: 'admin', permissionId: permId }
      });
    }
    
    // HR permissions
    const hrPermissions = await Permission.findAll({
      where: {
        name: {
          [Op.or]: [
            'employee.view', 'employee.create', 'employee.edit',
            'department.view', 'department.create', 'department.edit',
            'position.view', 'position.create', 'position.edit',
            'user.view',
            'attendance.view', 'attendance.manage', 'attendance.report', 'attendance.regularize',
            'branch.view',
            'company.view',
            'city.view', 'city.manage',
            'state.view', 'state.manage', // HR can manage states
            'country.view', 'country.manage' // HR can manage countries
          ]
        }
      }
    });
    
    for (const perm of hrPermissions) {
      await RolePermission.findOrCreate({
        where: { role: 'hr', permissionId: perm.id }
      });
    }
    
    // Manager permissions
    const managerPermissions = await Permission.findAll({
      where: {
        name: {
          [Op.or]: [
            'employee.view',
            'department.view',
            'position.view',
            'branch.view',
            'company.view',
            'city.view',
            'state.view', // Manager can view states
            'country.view' // Manager can view countries
          ]
        }
      }
    });
    
    for (const perm of managerPermissions) {
      await RolePermission.findOrCreate({
        where: { role: 'manager', permissionId: perm.id }
      });
    }
    
    // Employee permissions
    const employeePermissions = await Permission.findAll({
      where: {
        name: {
          [Op.or]: [
            'employee.view',
            'branch.view',
            'company.view',
            'city.view',
            'state.view', // Employee can view states
            'country.view' // Employee can view countries
          ]
        }
      }
    });
    
    for (const perm of employeePermissions) {
      await RolePermission.findOrCreate({
        where: { role: 'employee', permissionId: perm.id }
      });
    }
    
    console.log('✅ Default permissions initialized');
  } catch (error) {
    console.error('❌ Error initializing default permissions:', error);
  }
};

// Get recent attendance logs for HR/Admin dashboard
const getRecentAttendanceLogs = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await AuditLog.findAndCountAll({
      where: {
        entityType: 'Attendance',
        action: { [Op.in]: ['CLOCK_IN', 'CLOCK_OUT'] },
      },
      include: [
        {
          model: User,
          as: 'performedBy',
          attributes: ['email'],
          include: [{
            model: Employee,
            as: 'employee',
            attributes: ['firstName', 'lastName', 'employeeCode'],
          }]
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedLogs = logs.rows.map(log => {
      const employeeName = log.performedBy?.employee ? 
        `${log.performedBy.employee.firstName} ${log.performedBy.employee.lastName}` : 
        (log.performedBy?.email || 'N/A');

      return {
        id: log.id,
        action: log.action,
        employeeName: employeeName,
        employeeCode: log.performedBy?.employee?.employeeCode || 'N/A',
        timestamp: log.timestamp,
        message: log.message || `Employee ${employeeName} ${log.action.toLowerCase().replace('_', ' ')}`, // Use the message from audit log
        time: moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    res.json({
      success: true,
      data: {
        records: formattedLogs,
        total: logs.count,
        totalPages: Math.ceil(logs.count / limit),
        currentPage: parseInt(page),
      }
    });

  } catch (error) {
    console.error('Error fetching recent attendance logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent attendance logs', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getAllPermissions,
  getRolePermissions,
  updateRolePermissions,
  createPermission,
  getAuditLogs,
  initializeDefaultPermissions,
  createGeofence,
  deleteGeofence,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAllCities,
  getAllStates,
  createCity,
  updateCity,
  deleteCity,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyById,
  getAllCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  createState,
  updateState,
  deleteState,
  getRecentAttendanceLogs
};