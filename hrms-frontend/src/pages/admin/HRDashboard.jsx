import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchRecentAttendance();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/departments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch employees");
      setLoading(false);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/attendance/recent`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentAttendance(response.data.data.records);
    } catch (err) {
      console.error("Failed to fetch recent attendance:", err);
    }
  };

  const deleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/employees/${employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchEmployees(); // Refresh the list after deletion
      } catch (err) {
        setError("Failed to delete employee. Please try again.");
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentFilter = (e) => {
    setFilterDepartment(e.target.value);
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = (employee.fullName || "").toString().toLowerCase();
    const mail = (employee.email || "").toString().toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      mail.includes(searchTerm.toLowerCase());

    const deptId = employee.departmentId || employee.department?.id;
    const matchesDepartment =
      !filterDepartment || deptId === parseInt(filterDepartment);

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 alert alert-danger">{error}</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">HR Dashboard</h2>
        <Link
          to="/employees/add"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Employee
        </Link>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Employee Directory</h4>
        </div>
        <div className="card-body">
          {/* Search and Filter */}
          <div className="row mb-4">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={filterDepartment}
                onChange={handleDepartmentFilter}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Department</th>
                  <th scope="col">Position</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.fullName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department?.name || "-"}</td>
                    <td>{employee.position?.name || "-"}</td>
                    <td>
                      <Link
                        to={`/employees/edit/${employee.id}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        <i className="bi bi-pencil-square"></i> Edit
                      </Link>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Attendance Logs */}
      <div className="card mt-4">
        <div className="card-header bg-info text-white">
          <h4 className="card-title mb-0">
            <i className="fas fa-clock me-2"></i> Recent Attendance Logs
          </h4>
        </div>
        <div className="card-body">
          {recentAttendance.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee Code</th>
                    <th>Action</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((log) => (
                    <tr key={log.id}>
                      <td>{log.employeeName}</td>
                      <td>{log.employeeCode}</td>
                      <td>{log.action.replace('_', ' ')}</td>
                      <td>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No recent attendance logs to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard; 