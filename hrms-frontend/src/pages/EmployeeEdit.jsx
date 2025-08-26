import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    bloodGroup: "",
    personalEmail: "",
    companyEmail: "",
    personalPhone: "",
    companyPhone: "",
    emergencyContact: "",
    emergencyContactName: "",
    currentAddress: "",
    permanentAddress: "",
    city: "",
    pinCode: "",
    departmentId: "", // Use ID
    positionId: "",   // Use ID
    dateOfJoining: "",
    employmentType: "",
    isActive: true
  });

  useEffect(() => {
    fetchEmployeeDetails();
    fetchDepartments();
  }, [id]);

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

  const fetchPositions = async (departmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/positions/by-department/${departmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPositions(response.data);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData(response.data);
      if (response.data.departmentId) {
        fetchPositions(response.data.departmentId);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch employee details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Fetch positions when department changes
    if (name === 'departmentId') {
      fetchPositions(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/employees/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/employees/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update employee");
      window.scrollTo(0, 0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/employees/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/employees");
    } catch (err) {
      setError("Failed to delete employee. Please try again.");
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
        <div className="container text-center mt-4">Loading...</div>
    );
  }

  return (
      <div className="container mt-4">
        <div className="card">
          <h2 className="mb-4">Edit Employee</h2>

          {error && (
            <div className="alert alert-danger mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <h3 className="h5 mb-3">Personal Information</h3>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Employee Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Gender</label>
                  <select
                    className="form-control"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Blood Group</label>
                  <input
                    type="text"
                    className="form-control"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <h3 className="h5 mb-3">Contact Information</h3>
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="mb-1">Personal Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="mb-1">Company Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Personal Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="personalPhone"
                    value={formData.personalPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <h3 className="h5 mb-3">Employment Details</h3>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Department</label>
                  <select
                    className="form-control"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Position</label>
                  <select
                    className="form-control"
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Employment Type</label>
                  <select
                    className="form-control"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="mb-1">Date of Joining</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mt-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      id="isActive"
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Active Employee
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <h3 className="h5 mb-3">Address Information</h3>
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="mb-1">Current Address</label>
                  <textarea
                    className="form-control"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="mb-1">Permanent Address</label>
                  <textarea
                    className="form-control"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="mb-1">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="mb-1">Pin Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary me-2">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/employees/${id}`)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                style={{ marginLeft: 'auto' }}
              >
                Delete Employee
              </button>
            </div>
          </form>
        </div>
      </div>
  );
} 