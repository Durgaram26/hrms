const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'CountryID'
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'CountryCode'
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'CountryName'
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
    }
  }, {
    tableName: 'Countries',
    schema: 'System',
    timestamps: false
  });

  Country.associate = (models) => {
    Country.hasMany(models.State, {
      foreignKey: 'countryId',
      as: 'states'
    });
  };

  return Country;
}; 