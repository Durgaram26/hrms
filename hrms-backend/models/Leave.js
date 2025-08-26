const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Leave = sequelize.define('Leave', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leaveType: {
      type: DataTypes.ENUM('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending'
    },
    appliedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reviewedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewComments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachmentPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isHalfDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    halfDayPeriod: {
      type: DataTypes.ENUM('morning', 'afternoon'),
      allowNull: true
    }
  });

  // Define associations in a separate function to be called after all models are defined
  Leave.associate = (models) => {
    Leave.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    Leave.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });
  };

  return Leave;
};