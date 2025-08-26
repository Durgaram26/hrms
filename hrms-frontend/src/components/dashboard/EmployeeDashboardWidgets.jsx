import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import DashboardCard from './DashboardCard';

const EmployeeDashboardWidgets = () => {
  const [stats, setStats] = useState({
    attendanceRate: 0,
    leaveBalance: 0,
    upcomingHolidays: 0,
    pendingRequests: 0,
    loading: true
  });

  const [user, setUser] = useState({
    name: '',
    department: '',
    position: '',
    joiningDate: '',
    loading: true
  });

  useEffect(() => {
    // Simulating API call - in a real app, replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // const response = await axios.get('/api/employee/dashboard-stats');
        // setStats({ ...response.data, loading: false });
        
        // Simulated data for demonstration
        setTimeout(() => {
          setStats({
            attendanceRate: 96.5,
            leaveBalance: 18,
            upcomingHolidays: 2,
            pendingRequests: 1,
            loading: false
          });
          
          setUser({
            name: 'John Doe',
            department: 'Engineering',
            position: 'Senior Developer',
            joiningDate: 'June 15, 2023',
            loading: false
          });
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false }));
        setUser(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const leaveBalances = [
    { type: 'Annual Leave', used: 6, total: 20, color: 'primary' },
    { type: 'Sick Leave', used: 2, total: 10, color: 'danger' },
    { type: 'Personal Leave', used: 1, total: 5, color: 'warning' },
    { type: 'Compensatory Off', used: 0, total: 2, color: 'success' }
  ];

  const upcomingHolidays = [
    { id: 1, name: 'Independence Day', date: 'August 15, 2025', type: 'National' },
    { id: 2, name: 'Labor Day', date: 'September 2, 2025', type: 'National' }
  ];

  const recentAttendance = [
    { date: 'July 20, 2025', status: 'Present', checkIn: '09:02 AM', checkOut: '06:05 PM' },
    { date: 'July 19, 2025', status: 'Present', checkIn: '08:55 AM', checkOut: '06:10 PM' },
    { date: 'July 18, 2025', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 'July 17, 2025', status: 'Present', checkIn: '08:58 AM', checkOut: '06:15 PM' },
    { date: 'July 16, 2025', status: 'Leave', checkIn: '-', checkOut: '-' }
  ];

  return (
    <>
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="avatar-lg me-3 bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <i className="fas fa-user fa-2x text-primary"></i>
                </div>
                <div>
                  <h5 className="mb-1">{user.loading ? 'Loading...' : `Welcome, ${user.name}`}</h5>
                  <p className="text-muted mb-0">
                    {user.loading ? '' : `${user.position} | ${user.department}`}
                  </p>
                  <small className="text-muted">
                    {user.loading ? '' : `Joined on ${user.joiningDate}`}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Attendance Rate"
            subtitle="This month"
            value={stats.loading ? '...' : `${stats.attendanceRate}%`}
            icon="fas fa-chart-line"
            color="success"
            loading={stats.loading}
            variant="filled"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Leave Balance"
            subtitle="Annual leave"
            value={stats.loading ? '...' : `${stats.leaveBalance} days`}
            icon="fas fa-umbrella-beach"
            color="primary"
            loading={stats.loading}
            variant="filled"
            onClick={() => alert('View leave details')}
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <DashboardCard 
            title="Leave Balance Overview"
            value="All leave types"
            icon="fas fa-calendar-alt"
            color="primary"
            variant="outlined"
          >
            <div className="mt-3">
              {leaveBalances.map((leave, index) => (
                <div key={index}>
                  <div className="d-flex justify-content-between mb-1">
                    <small>{leave.type}</small>
                    <small>{leave.used} / {leave.total} days used</small>
                  </div>
                  <ProgressBar 
                    now={(leave.used / leave.total) * 100} 
                    variant={leave.color} 
                    className="mb-2" 
                    style={{height: "8px"}} 
                  />
                </div>
              ))}
            </div>
          </DashboardCard>
        </Col>
        
        <Col md={6}>
          <DashboardCard 
            title="Recent Attendance"
            value="Last 5 days"
            icon="fas fa-clock"
            color="info"
            variant="outlined"
          >
            <div className="mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((day, index) => (
                    <tr key={index}>
                      <td>{day.date}</td>
                      <td>
                        <span className={`badge bg-${day.status === 'Present' ? 'success' : 'warning'}`}>
                          {day.status}
                        </span>
                      </td>
                      <td>{day.checkIn}</td>
                      <td>{day.checkOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <DashboardCard 
            title="Upcoming Holidays"
            value={stats.loading ? '...' : stats.upcomingHolidays}
            icon="fas fa-gift"
            color="danger"
            loading={stats.loading}
            variant="gradient"
          >
            <div className="mt-3">
              <ul className="list-group list-group-flush">
                {upcomingHolidays.map(holiday => (
                  <li key={holiday.id} className="list-group-item px-0">
                    <div className="d-flex justify-content-between">
                      <span>{holiday.name}</span>
                      <span className="text-muted">{holiday.date}</span>
                    </div>
                    <small className="text-muted">{holiday.type}</small>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardCard>
        </Col>
        <Col md={4}>
          <DashboardCard 
            title="Pending Requests"
            value={stats.loading ? '...' : stats.pendingRequests}
            icon="fas fa-clipboard-list"
            color="warning"
            loading={stats.loading}
            variant="gradient"
            onClick={() => alert('View pending requests')}
            badge={stats.pendingRequests > 0 ? "Action Required" : null}
            badgeColor="warning"
          />
        </Col>
        <Col md={4}>
          <DashboardCard 
            title="Quick Actions"
            value="Employee Self-Service"
            icon="fas fa-bolt"
            color="secondary"
            variant="gradient"
          >
            <div className="mt-3">
              <div className="d-grid gap-2">
                <button className="btn btn-sm btn-outline-primary">
                  <i className="fas fa-calendar-plus me-2"></i>Apply for Leave
                </button>
                <button className="btn btn-sm btn-outline-success">
                  <i className="fas fa-clock me-2"></i>Clock In/Out
                </button>
                <button className="btn btn-sm btn-outline-info">
                  <i className="fas fa-file-alt me-2"></i>View Payslips
                </button>
              </div>
            </div>
          </DashboardCard>
        </Col>
      </Row>
    </>
  );
};

export default EmployeeDashboardWidgets;