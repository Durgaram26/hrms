import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// import Navbar from "../components/Navbar"; // No longer needed
import "../styles/theme.css";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
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

  const deleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/employees/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the list after deletion
      fetchEmployees();
    } catch (err) {
      setError("Failed to delete employee. Please try again.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentFilter = (e) => {
    setFilterDepartment(e.target.value);
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = (employee.fullName || '').toString().toLowerCase();
    const code = (employee.employeeCode || '').toString().toLowerCase();
    const mail = (employee.email || '').toString().toLowerCase();

    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          code.includes(searchTerm.toLowerCase()) ||
                          mail.includes(searchTerm.toLowerCase());

    const deptId = employee.departmentId || employee.department?.id;
    const matchesDepartment = !filterDepartment || deptId === parseInt(filterDepartment);

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="container text-center mt-4">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Employee List</h2>
        <Link to="/employees/add" className="btn btn-primary">
          Add Employee
        </Link>
      </div>

          {/* Search and Filter */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <select
                  className="form-control"
                  value={filterDepartment}
                  onChange={handleDepartmentFilter}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employeeCode}</td>
                    <td>{employee.fullName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department?.name || '-'}</td>
                    <td>{employee.position?.name || '-'}</td>
                    <td>
                      <span className={`badge ${employee.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="btn btn-info btn-sm"
                        >
                          View
                        </Link>
                        <Link
                          to={`/employees/edit/${employee.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteEmployee(employee.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center text-secondary mt-4">
              No employees found
            </div>
          )}
    </div>
  );
}
