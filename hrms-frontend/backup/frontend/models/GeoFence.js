const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const GeoFence = sequelize.define('GeoFence', {
    geoFenceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'GeoFenceID'
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'BranchID'
    },
    geoFenceName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'GeoFenceName'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      field: 'Latitude'
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      field: 'Longitude'
    },
    radiusMeters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'RadiusMeters'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'IsActive'
    },
    createdDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'CreatedDate'
    },
  }, {
    tableName: 'GeoFences',
    schema: 'Attendance',
    timestamps: false
  });

  GeoFence.associate = (models) => {
    GeoFence.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch',
    });
  };

  return GeoFence;
}; 