import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import DashboardCard from './DashboardCard';

const HRDashboardWidgets = () => {
  const [stats, setStats] = useState({
    presentToday: 0,
    onLeave: 0,
    lateArrivals: 0,
    pendingLeaveRequests: 0,
    upcomingBirthdays: 0,
    pendingOnboarding: 0,
    loading: true
  });

  useEffect(() => {
    // Simulating API call - in a real app, replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // const response = await axios.get('/api/hr/dashboard-stats');
        // setStats({ ...response.data, loading: false });
        
        // Simulated data for demonstration
        setTimeout(() => {
          setStats({
            presentToday: 215,
            onLeave: 18,
            lateArrivals: 15,
            pendingLeaveRequests: 8,
            upcomingBirthdays: 3,
            pendingOnboarding: 5,
            loading: false
          });
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const attendanceOverview = [
    { name: 'Present', percentage: 86.7, color: 'success' },
    { name: 'On Leave', percentage: 7.3, color: 'warning' },
    { name: 'Late', percentage: 6.0, color: 'danger' }
  ];

  const pendingLeaves = [
    { id: 1, employee: 'John Doe', type: 'Annual Leave', days: '3 days', from: 'Jul 25, 2025', to: 'Jul 27, 2025' },
    { id: 2, employee: 'Jane Smith', type: 'Sick Leave', days: '1 day', from: 'Jul 24, 2025', to: 'Jul 24, 2025' },
    { id: 3, employee: 'Mike Johnson', type: 'Personal Leave', days: '2 days', from: 'Jul 26, 2025', to: 'Jul 27, 2025' },
    { id: 4, employee: 'Sarah Williams', type: 'Annual Leave', days: '5 days', from: 'Jul 28, 2025', to: 'Aug 1, 2025' }
  ];

  const upcomingBirthdaysList = [
    { id: 1, employee: 'John Doe', date: 'Jul 23, 2025', age: 32 },
    { id: 2, employee: 'Jane Smith', date: 'Jul 28, 2025', age: 29 },
    { id: 3, employee: 'Mike Johnson', date: 'Aug 2, 2025', age: 35 }
  ];

  return (
    <>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <DashboardCard 
            title="Present Today"
            value={stats.loading ? '...' : stats.presentToday}
            icon="fas fa-user-check"
            color="success"
            loading={stats.loading}
            change={stats.loading ? null : "86.7% attendance rate"}
            changeType="neutral"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="On Leave"
            value={stats.loading ? '...' : stats.onLeave}
            icon="fas fa-calendar-alt"
            color="warning"
            loading={stats.loading}
            change={stats.loading ? null : "+5 from yesterday"}
            changeType="negative"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Late Arrivals"
            value={stats.loading ? '...' : stats.lateArrivals}
            icon="fas fa-clock"
            color="danger"
            loading={stats.loading}
            change={stats.loading ? null : "-3 from yesterday"}
            changeType="positive"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Pending Leave Requests"
            value={stats.loading ? '...' : stats.pendingLeaveRequests}
            icon="fas fa-clipboard-list"
            color="primary"
            loading={stats.loading}
            badge="Action Required"
            badgeColor="primary"
            onClick={() => alert('Navigate to leave approvals')}
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <DashboardCard 
            title="Attendance Overview"
            subtitle="Today's statistics"
            value="248 Total Employees"
            icon="fas fa-chart-pie"
            color="info"
            variant="filled"
          >
            <div className="mt-3">
              {attendanceOverview.map((item, index) => (
                <div key={index}>
                  <div className="d-flex justify-content-between mb-1">
                    <small>{item.name}</small>
                    <small>{item.percentage}%</small>
                  </div>
                  <ProgressBar 
                    now={item.percentage} 
                    variant={item.color} 
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
            title="Department Statistics"
            subtitle="Employee distribution"
            value="8 Departments"
            icon="fas fa-building"
            color="primary"
            variant="filled"
          >
            <div className="mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Present</th>
                    <th>On Leave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Engineering</td>
                    <td>112</td>
                    <td>98</td>
                    <td>8</td>
                  </tr>
                  <tr>
                    <td>HR & Admin</td>
                    <td>37</td>
                    <td>35</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>Sales & Marketing</td>
                    <td>62</td>
                    <td>55</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>Finance</td>
                    <td>25</td>
                    <td>22</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>Operations</td>
                    <td>12</td>
                    <td>10</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <DashboardCard 
            title="Upcoming Birthdays"
            value={stats.loading ? '...' : stats.upcomingBirthdays}
            icon="fas fa-birthday-cake"
            color="success"
            loading={stats.loading}
            variant="outlined"
            footer="Next: John Doe (July 23)"
          >
            <div className="mt-3">
              <ul className="list-group list-group-flush">
                {upcomingBirthdaysList.map(birthday => (
                  <li key={birthday.id} className="list-group-item px-0">
                    <div className="d-flex justify-content-between">
                      <span>{birthday.employee}</span>
                      <span className="text-muted">{birthday.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardCard>
        </Col>
        <Col md={4}>
          <DashboardCard 
            title="Pending Onboarding"
            value={stats.loading ? '...' : stats.pendingOnboarding}
            icon="fas fa-user-plus"
            color="warning"
            loading={stats.loading}
            variant="outlined"
            onClick={() => alert('Navigate to onboarding tasks')}
            badge="Action Required"
            badgeColor="warning"
          />
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Pending Leave Approvals</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {pendingLeaves.map(leave => (
                  <div key={leave.id} className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">{leave.employee}</h6>
                      <small className="badge bg-warning text-dark">{leave.type}</small>
                    </div>
                    <p className="mb-1 text-muted small">
                      {leave.days} ({leave.from} - {leave.to})
                    </p>
                  </div>
                ))}
              </div>
            </Card.Body>
            <Card.Footer className="bg-white text-center">
              <button className="btn btn-sm btn-primary">View All Requests</button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HRDashboardWidgets;