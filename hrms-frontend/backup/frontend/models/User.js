const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false }
  }, {
    // FIX: Disable Sequelize's default timestamps, as the DB table might not have createdAt/updatedAt
    timestamps: true
  });

  return User;
};