const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'AttendanceID'
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'EmployeeID'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'AttendanceDate'
    },
    shiftId: {
      type: DataTypes.INTEGER,
      field: 'ShiftID'
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'InTime'
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'OutTime'
    },
    inLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'InLatitude'
    },
    inLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'InLongitude'
    },
    outLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'OutLatitude'
    },
    outLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'OutLongitude'
    },
    isInGeoFence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'IsInGeoFence'
    },
    totalHours: {
        type: DataTypes.DECIMAL(4,2),
        field: 'TotalHours'
    },
    breakTime: {
        type: DataTypes.DECIMAL(4,2),
        field: 'BreakTime'
    },
    workHours: {
      type: DataTypes.DECIMAL(4,2),
      allowNull: true,
      field: 'WorkingHours'
    },
    overtimeHours: {
        type: DataTypes.DECIMAL(4,2),
        field: 'OvertimeHours'
    },
    status: {
      type: DataTypes.STRING,
      field: 'Status'
    },
    isLate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'IsLate'
    },
    lateMinutes: {
        type: DataTypes.INTEGER,
        field: 'LateMinutes'
    },
    isEarlyGoing: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'IsEarlyGoing'
    },
    earlyGoingMinutes: {
        type: DataTypes.INTEGER,
        field: 'EarlyGoingMinutes'
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'Remarks'
    },
    createdDate: {
      type: DataTypes.DATE,
      field: 'CreatedDate'
    }
  }, {
    tableName: 'DailyAttendance',
    schema: 'Attendance',
    timestamps: false
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  };

  return Attendance;
};