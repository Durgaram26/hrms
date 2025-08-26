const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const AttendanceRegularization = sequelize.define('AttendanceRegularization', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attendanceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    requestDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    requestedClockInTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    requestedClockOutTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'AttendanceRegularizations', // Explicitly define table name
    schema: 'Attendance', // Define the schema here
    timestamps: true // Assuming you want timestamps for this table
  });

  // Define associations in a separate function to be called after all models are defined
  AttendanceRegularization.associate = (models) => {
    AttendanceRegularization.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      targetKey: 'id', // Ensure this matches the primary key of the Employee model
      // Do not specify sourceKey if it's the foreign key itself
    });
    AttendanceRegularization.belongsTo(models.Attendance, {
      foreignKey: 'attendanceId',
      as: 'attendance',
      targetKey: 'id', // Ensure this matches the primary key of the Attendance model
      // Do not specify sourceKey if it's the foreign key itself
    });
    AttendanceRegularization.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer',
      targetKey: 'id', // Ensure this matches the primary key of the User model
      schema: 'dbo', // Specify the schema for the User model
      // Do not specify sourceKey if it's the foreign key itself
    });
  };

  return AttendanceRegularization;
};