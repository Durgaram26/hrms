const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Branch = sequelize.define('Branch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'BranchID'
    },
    companyId: {
      type: DataTypes.INTEGER,
      field: 'CompanyID'
    },
    branchName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'BranchName'
    },
    branchCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'BranchCode'
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
    isHeadOffice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'IsHeadOffice'
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
    tableName: 'Branches',
    schema: 'HR',
    timestamps: false
  });

  Branch.associate = (models) => {
    Branch.belongsTo(models.Company, {
      foreignKey: 'CompanyID',
      as: 'company'
    });
    Branch.belongsTo(models.City, {
      foreignKey: 'CityID',
      as: 'city'
    });
    Branch.hasMany(models.Employee, {
      foreignKey: 'branchId',
      as: 'employees'
    });
    Branch.hasMany(models.GeoFence, {
      foreignKey: 'branchId',
      as: 'geofences'
    });
  };

  return Branch;
};