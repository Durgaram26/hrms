const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TableName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    RecordID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    OldValues: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NewValues: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    UserID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ActionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    tableName: 'AuditLog',
    schema: 'System'
  });

  return AuditLog;
};