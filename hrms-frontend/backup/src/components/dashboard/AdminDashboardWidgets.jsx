import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import axios from 'axios';

const AdminDashboardWidgets = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    newHires: 0,
    pendingApprovals: 0,
    systemHealth: 98,
    loading: true
  });

  useEffect(() => {
    // Simulating API call - in a real app, replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // const response = await axios.get('/api/admin/dashboard-stats');
        // setStats({ ...response.data, loading: false });
        
        // Simulated data for demonstration
        setTimeout(() => {
          setStats({
            totalEmployees: 248,
            activeEmployees: 235,
            departments: 8,
            newHires: 12,
            pendingApprovals: 15,
            systemHealth: 98,
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

  const departmentDistribution = [
    { name: 'Engineering', percentage: 45, color: 'primary' },
    { name: 'HR & Admin', percentage: 15, color: 'info' },
    { name: 'Sales & Marketing', percentage: 25, color: 'success' },
    { name: 'Finance', percentage: 10, color: 'warning' },
    { name: 'Operations', percentage: 5, color: 'danger' }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'updated employee profile', time: '10 minutes ago' },
    { id: 2, user: 'Jane Smith', action: 'approved leave request', time: '25 minutes ago' },
    { id: 3, user: 'Mike Johnson', action: 'added new employee', time: '1 hour ago' },
    { id: 4, user: 'Sarah Williams', action: 'generated payroll', time: '2 hours ago' },
    { id: 5, user: 'Robert Brown', action: 'updated company policy', time: '3 hours ago' }
  ];

  return (
    <>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <DashboardCard 
            title="Total Employees"
            value={stats.loading ? '...' : stats.totalEmployees}
            icon="fas fa-users"
            color="primary"
            loading={stats.loading}
            change={stats.loading ? null : "+5% from last month"}
            changeType="positive"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Active Employees"
            value={stats.loading ? '...' : stats.activeEmployees}
            icon="fas fa-user-check"
            color="success"
            loading={stats.loading}
            change={stats.loading ? null : `${Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% active rate`}
            changeType="neutral"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Departments"
            value={stats.loading ? '...' : stats.departments}
            icon="fas fa-building"
            color="info"
            loading={stats.loading}
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="New Hires"
            subtitle="This month"
            value={stats.loading ? '...' : stats.newHires}
            icon="fas fa-user-plus"
            color="warning"
            loading={stats.loading}
            badge="New"
            badgeColor="warning"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <DashboardCard 
            title="Department Distribution"
            value="5 Departments"
            icon="fas fa-sitemap"
            color="primary"
            variant="filled"
          >
            <div className="mt-3">
              {departmentDistribution.map((dept, index) => (
                <div key={index}>
                  <div className="d-flex justify-content-between mb-1">
                    <small>{dept.name}</small>
                    <small>{dept.percentage}%</small>
                  </div>
                  <ProgressBar 
                    now={dept.percentage} 
                    variant={dept.color} 
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
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon="fas fa-heartbeat"
            color="success"
            variant="filled"
          >
            <div className="mt-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Server Uptime</small>
                <small>99.9%</small>
              </div>
              <ProgressBar now={99.9} variant="success" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>Database Performance</small>
                <small>97%</small>
              </div>
              <ProgressBar now={97} variant="info" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>API Response Time</small>
                <small>95%</small>
              </div>
              <ProgressBar now={95} variant="primary" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>Storage Usage</small>
                <small>65%</small>
              </div>
              <ProgressBar now={65} variant="warning" className="mb-2" style={{height: "8px"}} />
            </div>
          </DashboardCard>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <DashboardCard 
            title="Pending Approvals"
            value={stats.loading ? '...' : stats.pendingApprovals}
            icon="fas fa-clipboard-check"
            color="danger"
            loading={stats.loading}
            onClick={() => alert('Navigate to approvals page')}
            badge="Action Required"
            badgeColor="danger"
            variant="outlined"
          />
        </Col>
        <Col md={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Recent Activity</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">{activity.user}</h6>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                    <p className="mb-1 text-muted small">{activity.action}</p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboardWidgets;