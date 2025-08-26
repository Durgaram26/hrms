const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Position = sequelize.define("Position", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'DesignationID'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'DesignationName'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'DesignationCode'
    },
    description: {
      type: DataTypes.STRING,
      field: 'Description'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      field: 'DepartmentID'
    }
  }, {
    tableName: 'Designations',
    schema: 'HR',
    timestamps: false
  });

  Position.associate = (models) => {
    Position.hasMany(models.Employee, {
      foreignKey: 'positionId',
      as: 'employees'
    });
    Position.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  };

  return Position;
}; 