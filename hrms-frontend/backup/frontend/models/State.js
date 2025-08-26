const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'StateID'
    },
    countryId: {
      type: DataTypes.INTEGER,
      field: 'CountryID'
    },
    stateCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'StateCode'
    },
    stateName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'StateName'
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
    tableName: 'States',
    schema: 'System',
    timestamps: false
  });

  State.associate = (models) => {
    State.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country'
    });
    State.hasMany(models.City, {
      foreignKey: 'stateId',
      as: 'cities'
    });
  };

  return State;
}; 