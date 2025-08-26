import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployee(response.data.data); // Access the 'data' property from the response
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch employee details");
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ marginLeft: "220px", padding: "20px" }}>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginLeft: "220px", padding: "20px" }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ marginLeft: "220px", padding: "20px" }}>
        <div className="alert alert-warning">Employee not found</div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: "220px", padding: "20px" }}>
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">My Profile</h2>
          <Link to="/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>

        <div className="row">
          {/* Personal Information */}
          <div className="col-md-6 mb-4">
            <h3 className="h5 mb-3">Personal Information</h3>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <th width="35%">Full Name</th>
                    <td>{employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || '-'}</td>
                  </tr>
                  <tr>
                    <th>Employee Code</th>
                    <td>{employee.employeeCode || '-'}</td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>{employee.gender || '-'}</td>
                  </tr>
                  <tr>
                    <th>Date of Birth</th>
                    <td>{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '-'}</td>
                  </tr>
                  <tr>
                    <th>Blood Group</th>
                    <td>{employee.bloodGroup || '-'}</td>
                  </tr>
                  <tr>
                    <th>Marital Status</th>
                    <td>{employee.maritalStatus || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-md-6 mb-4">
            <h3 className="h5 mb-3">Contact Information</h3>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <th width="35%">Personal Email</th>
                    <td>{employee.personalEmail || '-'}</td>
                  </tr>
                  <tr>
                    <th>Company Email</th>
                    <td>{employee.email || '-'}</td>
                  </tr>
                  <tr>
                    <th>Personal Phone</th>
                    <td>{employee.personalPhone || '-'}</td>
                  </tr>
                  <tr>
                    <th>Company Phone</th>
                    <td>{employee.companyPhone || '-'}</td>
                  </tr>
                  <tr>
                    <th>Emergency Contact</th>
                    <td>{employee.emergencyContact || '-'}</td>
                  </tr>
                  <tr>
                    <th>Emergency Contact Name</th>
                    <td>{employee.emergencyContactName || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Employment Details */}
          <div className="col-md-6 mb-4">
            <h3 className="h5 mb-3">Employment Details</h3>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <th width="35%">Department</th>
                    <td>{employee.department?.name || '-'}</td>
                  </tr>
                  <tr>
                    <th>Position</th>
                    <td>{employee.position?.name || '-'}</td>
                  </tr>
                  <tr>
                    <th>Branch</th>
                    <td>{employee.branch?.branchName || '-'}</td>
                  </tr>
                  <tr>
                    <th>Join Date</th>
                    <td>{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : '-'}</td>
                  </tr>
                  <tr>
                    <th>Employment Type</th>
                    <td>{employee.employmentType || '-'}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span className={`badge ${employee.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Address Information */}
          <div className="col-md-6 mb-4">
            <h3 className="h5 mb-3">Address Information</h3>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <th width="35%">Current Address</th>
                    <td>{employee.currentAddress || '-'}</td>
                  </tr>
                  <tr>
                    <th>Permanent Address</th>
                    <td>{employee.permanentAddress || '-'}</td>
                  </tr>
                  <tr>
                    <th>City</th>
                    <td>{employee.city?.cityName || '-'}</td>
                  </tr>
                  <tr>
                    <th>Pin Code</th>
                    <td>{employee.pinCode || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link to="/dashboard/employee" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
