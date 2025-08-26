const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const LeaveBalance = sequelize.define('LeaveBalance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leaveType: {
      type: DataTypes.ENUM('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'),
      allowNull: false
    },
    totalAllowed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    carryForward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  // Define associations in a separate function to be called after all models are defined
  LeaveBalance.associate = (models) => {
    LeaveBalance.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  };

  return LeaveBalance;
};