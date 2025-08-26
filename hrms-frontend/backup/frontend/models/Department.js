const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define("Department", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'DepartmentID'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'DepartmentName'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'DepartmentCode'
    },
    description: {
      type: DataTypes.STRING,
      field: 'Description'
    }
  }, {
    tableName: 'Departments',
    schema: 'HR',
    timestamps: false
  });

  Department.associate = (models) => {
    Department.hasMany(models.Employee, {
      foreignKey: 'departmentId',
      as: 'employees'
    });
    Department.hasMany(models.Position, {
      foreignKey: 'departmentId',
      as: 'positions'
    });
  };

  return Department;
}; 