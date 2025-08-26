const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Employee = sequelize.define("Employee", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Ensure autoIncrement is explicitly true
      field: 'EmployeeID' // Map to the actual column name in MSSQL
    },
    companyId: {
      type: DataTypes.INTEGER,
      field: 'CompanyID'
    },
    branchId: {
      type: DataTypes.INTEGER,
      field: 'BranchID'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      field: 'DepartmentID'
    },
    positionId: {
      type: DataTypes.INTEGER,
      field: 'DesignationID'
    },
    employeeCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'EmployeeCode'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'FirstName'
    },
    middleName: {
      type: DataTypes.STRING,
      field: 'MiddleName'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'LastName'
    },
    gender: {
      type: DataTypes.CHAR(1),
      field: 'Gender'
    },
    dateOfBirth: {
      type: DataTypes.DATE, // FIX: Change to DataTypes.DATE for better compatibility with MS SQL Server
      field: 'DateOfBirth'
    },
    maritalStatus: {
      type: DataTypes.STRING,
      field: 'MaritalStatus'
    },
    bloodGroup: {
      type: DataTypes.STRING,
      field: 'BloodGroup'
    },
    personalEmail: {
      type: DataTypes.STRING,
      field: 'PersonalEmail'
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: 'CompanyEmail'
    },
    personalPhone: {
      type: DataTypes.STRING,
      field: 'PersonalPhone'
    },
    companyPhone: {
      type: DataTypes.STRING,
      field: 'CompanyPhone'
    },
    emergencyContact: {
      type: DataTypes.STRING,
      field: 'EmergencyContact'
    },
    emergencyContactName: {
      type: DataTypes.STRING,
      field: 'EmergencyContactName'
    },
    permanentAddress: {
      type: DataTypes.STRING,
      field: 'PermanentAddress'
    },
    currentAddress: {
      type: DataTypes.STRING,
      field: 'CurrentAddress'
    },
    cityId: {
      type: DataTypes.INTEGER,
      field: 'CityID'
    },
    pinCode: {
      type: DataTypes.STRING,
      field: 'PinCode'
    },
    dateOfJoining: {
      type: DataTypes.DATE, // FIX: Change to DataTypes.DATE
      allowNull: false,
      field: 'DateOfJoining'
    },
    dateOfConfirmation: {
      type: DataTypes.DATE, // FIX: Change to DataTypes.DATE
      field: 'DateOfConfirmation'
    },
    probationPeriod: {
      type: DataTypes.INTEGER,
      field: 'ProbationPeriod'
    },
    employmentType: {
      type: DataTypes.STRING,
      field: 'EmploymentType'
    },
    reportingManagerId: {
      type: DataTypes.INTEGER,
      field: 'ReportingManagerID'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: 'IsActive'
    },
    terminationDate: {
      type: DataTypes.DATE, // FIX: Change to DataTypes.DATE
      field: 'TerminationDate'
    },
    terminationReason: {
      type: DataTypes.STRING,
      field: 'TerminationReason'
    },
    profileImagePath: {
      type: DataTypes.STRING,
      field: 'ProfileImagePath'
    },
    createdDate: {
      type: DataTypes.DATE,
      field: 'CreatedDate'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: 'CreatedBy'
    },
    modifiedDate: {
      type: DataTypes.DATE,
      field: 'ModifiedDate'
    },
    modifiedBy: {
      type: DataTypes.INTEGER,
      field: 'ModifiedBy'
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'employee',
      field: 'Role'
    }
  }, {
    tableName: 'Employees',
    schema: 'HR',
    timestamps: false,
    hasTrigger: true,
  });

  Employee.associate = (models) => {
    Employee.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
    Employee.belongsTo(models.Position, {
      foreignKey: 'positionId',
      as: 'position'
    });
    Employee.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      targetKey: 'id',
      as: 'branch'
    });
    Employee.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
    Employee.belongsTo(models.User, {
      foreignKey: 'email',
      targetKey: 'email',
      as: 'user'
    });
    // Leave request associations
    Employee.hasMany(models.Leave, {
      foreignKey: 'employeeId',
      as: 'leaveRequests'
    });
    Employee.hasMany(models.LeaveBalance, {
      foreignKey: 'employeeId',
      as: 'leaveBalances'
    });
  };

  return Employee;
};

