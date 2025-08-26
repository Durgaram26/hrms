import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const HRLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewComments: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveRequests(response.data.data.records || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setAlert({
        show: true,
        message: 'Error fetching leave requests',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (request) => {
    setSelectedRequest(request);
    setReviewData({
      status: '',
      reviewComments: ''
    });
    setShowModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/leaves/${selectedRequest.id}`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlert({
        show: true,
        message: `Leave request ${reviewData.status} successfully!`,
        type: 'success'
      });
      
      setShowModal(false);
      fetchLeaveRequests();
      
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error updating leave request',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Leave Management - HR</h2>
            <Button variant="outline-primary" onClick={fetchLeaveRequests}>
              Refresh
            </Button>
          </div>

          {alert.show && (
            <Alert 
              variant={alert.type} 
              onClose={() => setAlert({ show: false, message: '', type: '' })} 
              dismissible
            >
              {alert.message}
            </Alert>
          )}

          <Card>
            <Card.Header>
              <h5>Employee Leave Requests</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center">No leave requests found</td>
                      </tr>
                    ) : (
                      leaveRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            {request.employee ? 
                              `${request.employee.firstName} ${request.employee.lastName} (${request.employee.employeeCode})` 
                              : 'N/A'
                            }
                          </td>
                          <td className="text-capitalize">{request.leaveType}</td>
                          <td>{new Date(request.startDate).toLocaleDateString()}</td>
                          <td>{new Date(request.endDate).toLocaleDateString()}</td>
                          <td>{request.totalDays}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>{new Date(request.appliedDate).toLocaleDateString()}</td>
                          <td>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {request.reason}
                            </div>
                          </td>
                          <td>
                            {request.status === 'pending' ? (
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => handleReviewClick(request)}
                              >
                                Review
                              </Button>
                            ) : (
                              <span className="text-muted">
                                {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                {request.reviewedDate && (
                                  <small className="d-block">
                                    on {new Date(request.reviewedDate).toLocaleDateString()}
                                  </small>
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Leave Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <div className="mb-3">
                <strong>Employee:</strong> {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
              </div>
              <div className="mb-3">
                <strong>Leave Type:</strong> <span className="text-capitalize">{selectedRequest.leaveType}</span>
              </div>
              <div className="mb-3">
                <strong>Duration:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} to {new Date(selectedRequest.endDate).toLocaleDateString()} ({selectedRequest.totalDays} days)
              </div>
              <div className="mb-3">
                <strong>Reason:</strong> {selectedRequest.reason}
              </div>
              
              <Form onSubmit={handleReviewSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Decision</Form.Label>
                  <Form.Select
                    name="status"
                    value={reviewData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Decision</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Comments (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="reviewComments"
                    value={reviewData.reviewComments}
                    onChange={handleInputChange}
                    placeholder="Add any comments about this decision..."
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit Decision'}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HRLeaveManagement;