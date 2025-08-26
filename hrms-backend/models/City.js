const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const City = sequelize.define('City', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'CityID'
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'StateID'
    },
    cityCode: {
      type: DataTypes.STRING(10),
      field: 'CityCode'
    },
    cityName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'CityName'
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
    tableName: 'Cities',
    schema: 'System',
    timestamps: false
  });

  City.associate = (models) => {
    City.belongsTo(models.State, {
      foreignKey: 'StateID',
      as: 'state'
    });
    City.hasMany(models.Branch, {
      foreignKey: 'cityId',
      as: 'branches'
    });
    City.hasMany(models.Employee, {
      foreignKey: 'cityId',
      as: 'employees'
    });
  };

  return City;
};