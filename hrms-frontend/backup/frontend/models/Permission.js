const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Permission;
};