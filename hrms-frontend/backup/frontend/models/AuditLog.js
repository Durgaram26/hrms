const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    oldValues: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('oldValues');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('oldValues', value ? JSON.stringify(value) : null);
      }
    },
    newValues: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('newValues');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('newValues', value ? JSON.stringify(value) : null);
      }
    },
    performedById: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    performedByEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    // FIX: Disable Sequelize's default timestamps, as the DB table uses 'ActionDate'
    timestamps: false,
    tableName: 'AuditLog', // Ensure the table name is correctly mapped
    schema: 'System' // Ensure the schema is correctly mapped
  });

  return AuditLog;
};