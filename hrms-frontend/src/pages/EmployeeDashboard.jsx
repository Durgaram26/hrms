import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/theme.css";
import { Modal, Button, Form } from "react-bootstrap";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    leaveBalance: 0,
    attendanceThisMonth: 0,
    pendingRequests: 0,
    upcomingHolidays: 0,
    recentActivities: [],
    upcomingEvents: [],
  });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveFeedback, setLeaveFeedback] = useState(null);

  useEffect(() => {
    fetchEmployeeData();
    fetchDashboardStats();
    fetchRecentActivities();
    fetchUpcomingEvents();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployee(response.data.data); // Access the 'data' property from the response
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch employee data:", err);
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees/dashboard-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats((prevStats) => ({ ...prevStats, ...response.data.data }));
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const fetchRecentActivities = async () => {
    // This will require a new backend endpoint for audit logs or employee-specific activities
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/employees/recent-activities`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(prev => ({ ...prev, recentActivities: response.data.data }));
    } catch (err) {
      console.error("Failed to fetch recent activities:", err);
    }
  };

  const fetchUpcomingEvents = async () => {
    // This will require a new backend endpoint for holidays and company events
    try {
      // const token = localStorage.getItem("token");
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/upcoming`, { headers: { Authorization: `Bearer ${token}` } });
      // setStats(prev => ({ ...prev, upcomingEvents: response.data.data }));
      setStats((prev) => ({
        ...prev,
        upcomingEvents: [
          {
            type: "holiday",
            name: "Republic Day",
            date: "Jan 26, 2024",
            icon: "fas fa-star text-warning",
          },
          {
            type: "holiday",
            name: "Independence Day",
            date: "Aug 15, 2024",
            icon: "fas fa-star text-warning",
          },
          {
            type: "company",
            name: "Team Lunch",
            date: "Tomorrow",
            icon: "fas fa-birthday-cake text-danger",
          },
          {
            type: "company",
            name: "Monthly Meeting",
            date: "Friday",
            icon: "fas fa-users text-info",
          },
        ],
      }));
    } catch (err) {
      console.error("Failed to fetch upcoming events:", err);
    }
  };

  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    setLeaveFeedback(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/leaves`,
        leaveForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveFeedback({ type: "success", message: "Leave request submitted!" });
      setLeaveForm({ leaveType: "annual", startDate: "", endDate: "", reason: "" });
      setTimeout(() => setShowLeaveModal(false), 1200);
      fetchDashboardStats(); // Refresh stats after leave submission
    } catch (err) {
      setLeaveFeedback({ type: "danger", message: err.response?.data?.message || "Failed to submit leave request." });
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginLeft: "220px", padding: "20px" }}>
        <Sidebar role="employee" />
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: "220px", padding: "20px" }}>
      <Sidebar role="employee" />

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Welcome back, {employee?.fullName || `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || 'Employee'}! 👋</h1>
          <p className="text-muted mb-0">Here's what's happening with your account today.</p>
        </div>
        <div className="text-end">
          <p className="mb-1 text-muted">Employee ID</p>
          <h5 className="mb-0 text-primary">{employee?.employeeCode || 'N/A'}</h5>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="fas fa-calendar-check text-success" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">{stats.leaveBalance}</h4>
              <p className="text-muted mb-0">Leave Balance</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="fas fa-clock text-info" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">{stats.attendanceThisMonth}</h4>
              <p className="text-muted mb-0">Days Present</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="fas fa-hourglass-half text-warning" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">{stats.pendingRequests}</h4>
              <p className="text-muted mb-0">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="fas fa-umbrella-beach text-primary" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">{stats.upcomingHolidays}</h4>
              <p className="text-muted mb-0">Upcoming Holidays</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Profile Information */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Profile Information
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center"
                     style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-user text-muted" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>

              <div className="row">
                <div className="col-12 mb-2">
                  <small className="text-muted">Full Name</small>
                  <p className="mb-0 fw-bold">{employee?.firstName} {employee?.lastName}</p>
                </div>

                <div className="col-12 mb-2">
                  <small className="text-muted">Employee Code</small>
                  <p className="mb-0">{employee?.employeeCode}</p>
                </div>

                <div className="col-12 mb-2">
                  <small className="text-muted">Department</small>
                  <p className="mb-0">{employee?.department?.name || 'N/A'}</p>
                </div>

                <div className="col-12 mb-2">
                  <small className="text-muted">Position</small>
                  <p className="mb-0">{employee?.position?.name || 'N/A'}</p>
                </div>

                <div className="col-12 mb-2">
                  <small className="text-muted">Email</small>
                  <p className="mb-0">{employee?.email || 'N/A'}</p>
                </div>

                <div className="col-12 mb-2">
                  <small className="text-muted">Join Date</small>
                  <p className="mb-0">
                    {employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="col-12">
                  <small className="text-muted">Status</small>
                  <p className="mb-0">
                    <span className={`badge ${employee?.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {employee?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/attendance" className="btn btn-outline-primary">
                  <i className="fas fa-clock me-2"></i>
                  Mark Attendance
                </Link>
                <button className="btn btn-outline-success" onClick={() => setShowLeaveModal(true)}>
                  <i className="fas fa-calendar-plus me-2"></i>
                  Request Leave
                </button>
                <Link to="/profile/edit" className="btn btn-outline-info">
                  <i className="fas fa-edit me-2"></i>
                  Update Profile
                </Link>
                <Link to="/payslips" className="btn btn-outline-warning">
                  <i className="fas fa-file-invoice-dollar me-2"></i>
                  View Payslips
                </Link>
                <Link to="/requests" className="btn btn-outline-secondary">
                  <i className="fas fa-tasks me-2"></i>
                  My Requests
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Recent Activities
              </h5>
            </div>
            <div className="card-body">
              {stats.recentActivities.length > 0 ? (
                <div className="timeline">
                  {stats.recentActivities.map((activity, index) => (
                    <div className="timeline-item" key={index}>
                      <div className={`timeline-marker bg-${activity.type}`}></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">{activity.description}</h6>
                        <p className="text-muted mb-0 small">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No recent activities to display.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Upcoming Events
              </h5>
            </div>
            <div className="card-body">
              {stats.upcomingEvents.length > 0 ? (
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Holidays</h6>
                    <ul className="list-unstyled">
                      {stats.upcomingEvents.filter(event => event.type === 'holiday').map((event, index) => (
                        <li className="mb-2" key={index}>
                          <i className={`${event.icon} me-2`}></i>
                          <strong>{event.name}</strong> - {event.date}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-success">Company Events</h6>
                    <ul className="list-unstyled">
                      {stats.upcomingEvents.filter(event => event.type === 'company').map((event, index) => (
                        <li className="mb-2" key={index}>
                          <i className={`${event.icon} me-2`}></i>
                          <strong>{event.name}</strong> - {event.date}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No upcoming events to display.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Leave Request Modal */}
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Leave</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleLeaveSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Leave Type</Form.Label>
              <Form.Select name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveInputChange} required>
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
                <option value="emergency">Emergency</option>
                <option value="unpaid">Unpaid</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control as="textarea" name="reason" value={leaveForm.reason} onChange={handleLeaveInputChange} rows={3} required />
            </Form.Group>
            {leaveFeedback && (
              <div className={`alert alert-${leaveFeedback.type}`}>{leaveFeedback.message}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLeaveModal(false)} disabled={leaveSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={leaveSubmitting}>
              {leaveSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
