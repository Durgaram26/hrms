const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  // Define associations in a separate function to be called after all models are defined
  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.Permission, {
      foreignKey: 'permissionId',
      as: 'permission'
    });
  };

  return RolePermission;
};