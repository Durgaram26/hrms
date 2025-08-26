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
  });

  // Define associations in a separate function to be called after all models are defined
  AttendanceRegularization.associate = (models) => {
    AttendanceRegularization.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    AttendanceRegularization.belongsTo(models.Attendance, {
      foreignKey: 'attendanceId',
      as: 'attendance'
    });
    AttendanceRegularization.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });
  };

  return AttendanceRegularization;
};