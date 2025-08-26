const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'CompanyID'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'CompanyName'
    },
    companyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'CompanyCode'
    },
    address: {
      type: DataTypes.STRING,
      field: 'Address'
    },
    cityId: {
      type: DataTypes.INTEGER,
      field: 'CityID'
    },
    phone: {
      type: DataTypes.STRING,
      field: 'Phone'
    },
    email: {
      type: DataTypes.STRING,
      field: 'Email'
    },
    website: {
      type: DataTypes.STRING,
      field: 'Website'
    },
    taxId: {
      type: DataTypes.STRING,
      field: 'TaxID'
    },
    pan: {
      type: DataTypes.STRING,
      field: 'PAN'
    },
    gst: {
      type: DataTypes.STRING,
      field: 'GST'
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
    tableName: 'Companies',
    schema: 'HR',
    timestamps: false
  });

  Company.associate = (models) => {
    Company.hasMany(models.Branch, {
      foreignKey: 'companyId',
      as: 'branches'
    });
    Company.belongsTo(models.City, {
      foreignKey: 'cityId',
      as: 'city'
    });
  };

  return Company;
}; 