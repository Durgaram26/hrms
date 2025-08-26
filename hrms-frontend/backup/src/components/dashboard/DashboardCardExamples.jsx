import React from 'react';
import DashboardCard from './DashboardCard';
import { Row, Col, ProgressBar } from 'react-bootstrap';

const DashboardCardExamples = () => {
  return (
    <div className="dashboard-examples">
      <h4 className="mb-4">Dashboard Card Examples</h4>
      
      <h5 className="mb-3">Basic Cards</h5>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <DashboardCard 
            title="Total Employees"
            value="248"
            icon="fas fa-users"
            color="primary"
            change="+12% from last month"
            changeType="positive"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Present Today"
            value="215"
            icon="fas fa-user-check"
            color="success"
            change="86.7% attendance rate"
            changeType="neutral"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="On Leave"
            value="18"
            icon="fas fa-calendar-alt"
            color="warning"
            change="+5 from yesterday"
            changeType="negative"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Late Arrivals"
            value="15"
            icon="fas fa-clock"
            color="danger"
            change="-3 from yesterday"
            changeType="positive"
          />
        </Col>
      </Row>
      
      <h5 className="mb-3">Cards with Variants</h5>
      <Row className="g-3 mb-4">
        <Col md={3}>
          <DashboardCard 
            title="New Hires"
            subtitle="This month"
            value="12"
            icon="fas fa-user-plus"
            color="info"
            variant="outlined"
            badge="New"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Resignations"
            subtitle="This month"
            value="3"
            icon="fas fa-user-minus"
            color="danger"
            variant="filled"
            badge="Alert"
            badgeColor="danger"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Open Positions"
            subtitle="Active recruitments"
            value="8"
            icon="fas fa-briefcase"
            color="success"
            variant="gradient"
            footer="4 in final interview stage"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Training Programs"
            subtitle="In progress"
            value="5"
            icon="fas fa-graduation-cap"
            color="secondary"
            variant="default"
            footer="Next: React Advanced on July 25"
          />
        </Col>
      </Row>
      
      <h5 className="mb-3">Cards with Custom Content</h5>
      <Row className="g-3 mb-4">
        <Col md={6}>
          <DashboardCard 
            title="Department Distribution"
            value="5 Departments"
            icon="fas fa-sitemap"
            color="primary"
          >
            <div className="mt-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Engineering</small>
                <small>45%</small>
              </div>
              <ProgressBar now={45} variant="primary" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>HR & Admin</small>
                <small>15%</small>
              </div>
              <ProgressBar now={15} variant="info" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>Sales & Marketing</small>
                <small>25%</small>
              </div>
              <ProgressBar now={25} variant="success" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>Finance</small>
                <small>10%</small>
              </div>
              <ProgressBar now={10} variant="warning" className="mb-2" style={{height: "8px"}} />
              
              <div className="d-flex justify-content-between mb-1">
                <small>Operations</small>
                <small>5%</small>
              </div>
              <ProgressBar now={5} variant="danger" className="mb-2" style={{height: "8px"}} />
            </div>
          </DashboardCard>
        </Col>
        
        <Col md={6}>
          <DashboardCard 
            title="Leave Balance Overview"
            value="Team Average: 18 days"
            icon="fas fa-umbrella-beach"
            color="warning"
          >
            <div className="mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Used</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Annual Leave</td>
                    <td>8 days</td>
                    <td>12 days</td>
                  </tr>
                  <tr>
                    <td>Sick Leave</td>
                    <td>3 days</td>
                    <td>9 days</td>
                  </tr>
                  <tr>
                    <td>Personal Leave</td>
                    <td>1 day</td>
                    <td>4 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </Col>
      </Row>
      
      <h5 className="mb-3">Interactive Cards</h5>
      <Row className="g-3">
        <Col md={3}>
          <DashboardCard 
            title="Pending Approvals"
            value="8"
            icon="fas fa-clipboard-check"
            color="danger"
            onClick={() => alert('Navigate to approvals page')}
            badge="Action Required"
            badgeColor="danger"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Upcoming Reviews"
            value="12"
            icon="fas fa-star"
            color="warning"
            onClick={() => alert('Navigate to performance reviews')}
            badge="This Week"
            badgeColor="warning"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Birthdays"
            value="3"
            icon="fas fa-birthday-cake"
            color="info"
            onClick={() => alert('View upcoming birthdays')}
            footer="Next: John Doe (July 23)"
          />
        </Col>
        <Col md={3}>
          <DashboardCard 
            title="Work Anniversaries"
            value="5"
            icon="fas fa-award"
            color="success"
            onClick={() => alert('View work anniversaries')}
            footer="Next: Jane Smith (5 years)"
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardCardExamples;