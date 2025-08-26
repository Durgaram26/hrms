import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Modal, Toast, ToastContainer } from 'react-bootstrap';
import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Add some custom styles
const customStyles = `
  .action-buttons .btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    white-space: nowrap;
  }
  .table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
  }
  .table td {
    vertical-align: middle;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', requestId: null, requestData: null });
  
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'morning'
  });

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setFetchingData(true);
      await Promise.all([fetchLeaveRequests(), fetchLeaveBalance()]);
      setFetchingData(false);
    };
    loadData();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setLeaveRequests(response.data.data || []);
      } else {
        console.warn('Unexpected response format for leave requests:', response.data);
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves/my-balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setLeaveBalance(response.data.data || []);
      } else {
        console.warn('Unexpected response format for leave balance:', response.data);
        setLeaveBalance([]);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      setLeaveBalance([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isHalfDay' && checked) {
      // If half-day is selected, set end date to same as start date
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        endDate: prev.startDate
      }));
    } else if (name === 'startDate' && formData.isHalfDay) {
      // If start date changes and it's a half-day, update end date too
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endDate: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting leave request:', formData);
      
      const response = await axios.post('/api/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Leave request response:', response.data);
      
      // Check if the response indicates success
      if (response.data && response.data.success) {
        // Close the form first
        setShowForm(false);
        
        // Reset form data
        setFormData({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          isHalfDay: false,
          halfDayPeriod: 'morning'
        });
        
        // Show success message
        setAlert({
          show: true,
          message: response.data.message || 'Leave request submitted successfully! Your request is now pending approval.',
          type: 'success'
        });
        
        // Show toast notification
        setToastMessage('Leave request submitted successfully!');
        setShowToast(true);
        
        // Refresh data to show the new request (with small delay to ensure backend processing is complete)
        setTimeout(async () => {
          try {
            await Promise.all([fetchLeaveRequests(), fetchLeaveBalance()]);
          } catch (refreshError) {
            console.error('Error refreshing data:', refreshError);
            // Don't show error for refresh failure, the main action succeeded
          }
        }, 500);
        
        // Auto-hide alert after 5 seconds
        setTimeout(() => {
          setAlert({ show: false, message: '', type: '' });
        }, 5000);
      } else {
        // Handle unexpected response format
        throw new Error(response.data?.message || 'Unexpected response format');
      }
      
    } catch (error) {
      console.error('Leave request submission error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error submitting leave request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'danger'
      });
      
      // Auto-hide error alert after 8 seconds
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 8000);
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

  const handleWithdrawRequest = async (requestId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Attempting to withdraw leave request:', requestId);
      
      const response = await axios.put(`/api/leaves/${requestId}/withdraw`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Withdraw response:', response.data);
      
      // Check if the response indicates success
      if (response.data && response.data.success) {
        setAlert({
          show: true,
          message: response.data.message || 'Leave request withdrawn successfully!',
          type: 'success'
        });
        
        setToastMessage('Leave request withdrawn successfully!');
        setShowToast(true);
        
        // Refresh data (with small delay to ensure backend processing is complete)
        setTimeout(async () => {
          try {
            await Promise.all([fetchLeaveRequests(), fetchLeaveBalance()]);
          } catch (refreshError) {
            console.error('Error refreshing data:', refreshError);
            // Don't show error for refresh failure, the main action succeeded
          }
        }, 500);
        
        setTimeout(() => {
          setAlert({ show: false, message: '', type: '' });
        }, 5000);
      } else {
        // Handle unexpected response format
        throw new Error(response.data?.message || 'Unexpected response format');
      }
      
    } catch (error) {
      console.error('Withdraw error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error withdrawing leave request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Leave request not found or you do not have permission to withdraw it';
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot withdraw this leave request. Only pending requests can be withdrawn.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'danger'
      });
      
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 8000);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Attempting to delete leave request:', requestId);
      
      const response = await axios.delete(`/api/leaves/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.data);
      
      // Check if the response indicates success
      if (response.data && response.data.success) {
        setAlert({
          show: true,
          message: response.data.message || 'Leave request deleted successfully!',
          type: 'success'
        });
        
        setToastMessage('Leave request deleted successfully!');
        setShowToast(true);
        
        // Refresh data (with small delay to ensure backend processing is complete)
        setTimeout(async () => {
          try {
            await Promise.all([fetchLeaveRequests(), fetchLeaveBalance()]);
          } catch (refreshError) {
            console.error('Error refreshing data:', refreshError);
            // Don't show error for refresh failure, the main action succeeded
          }
        }, 500);
        
        setTimeout(() => {
          setAlert({ show: false, message: '', type: '' });
        }, 5000);
      } else {
        // Handle unexpected response format
        throw new Error(response.data?.message || 'Unexpected response format');
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error deleting leave request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Leave request not found or you do not have permission to delete it';
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot delete this leave request. Only cancelled or rejected requests can be deleted.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'danger'
      });
      
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 8000);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const showConfirmation = (type, requestId, requestData) => {
    setConfirmAction({ type, requestId, requestData });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction.type === 'withdraw') {
      handleWithdrawRequest(confirmAction.requestId);
    } else if (confirmAction.type === 'delete') {
      handleDeleteRequest(confirmAction.requestId);
    }
  };

  const canWithdraw = (status) => {
    console.log('Checking canWithdraw for status:', status);
    return status === 'pending';
  };
  
  const canDelete = (status) => {
    console.log('Checking canDelete for status:', status);
    return ['cancelled', 'rejected'].includes(status);
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Leave Management</h2>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setShowForm(true)}>
                Request Leave
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => {
                    console.log('Current leave requests:', leaveRequests);
                    console.log('Leave balance:', leaveBalance);
                  }}
                >
                  Debug Log
                </Button>
              )}
            </div>
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

          {/* Leave Balance Cards */}
          <div className="row mb-4">
            {leaveBalance.length === 0 ? (
              <div className="col-12">
                <Card className="text-center">
                  <Card.Body>
                    <i className="fas fa-calendar-times fa-2x text-muted mb-3"></i>
                    <h6 className="text-muted">No leave balance data available</h6>
                    <p className="text-muted">Please contact HR to set up your leave balances.</p>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              leaveBalance.map((balance, index) => {
                const usagePercentage = balance.totalAllowed > 0 ? (balance.used / balance.totalAllowed) * 100 : 0;
                const progressVariant = usagePercentage > 80 ? 'danger' : usagePercentage > 60 ? 'warning' : 'success';
                
                return (
                  <div key={index} className="col-md-3 mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title className="text-capitalize d-flex justify-content-between align-items-center">
                          {balance.leaveType}
                          <Badge bg="primary">{balance.remaining}</Badge>
                        </Card.Title>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>Used: {balance.used}</span>
                            <span>Total: {balance.totalAllowed}</span>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className={`progress-bar bg-${progressVariant}`}
                              role="progressbar" 
                              style={{ width: `${usagePercentage}%` }}
                              aria-valuenow={usagePercentage}
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                        <small className="text-muted">
                          {balance.remaining} days remaining
                          {balance.carryForward > 0 && (
                            <span className="text-info"> (+{balance.carryForward} carried forward)</span>
                          )}
                        </small>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })
            )}
          </div>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && leaveRequests.length > 0 && (
            <Card className="mb-3 border-info">
              <Card.Header className="bg-info text-white">
                <small>Debug Info (Development Only)</small>
              </Card.Header>
              <Card.Body>
                <small>
                  <strong>Leave Requests Status Check:</strong>
                  <ul className="mb-0">
                    {leaveRequests.map(req => (
                      <li key={req.id}>
                        ID: {req.id}, Status: "{req.status}", 
                        Can Withdraw: {canWithdraw(req.status) ? 'Yes' : 'No'}, 
                        Can Delete: {canDelete(req.status) ? 'Yes' : 'No'}
                      </li>
                    ))}
                  </ul>
                </small>
              </Card.Body>
            </Card>
          )}

          {/* Leave Requests Table */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Leave Requests</h5>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => {
                  fetchLeaveRequests();
                  fetchLeaveBalance();
                }}
                disabled={fetchingData}
              >
                {fetchingData ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Card.Header>
            <Card.Body>
              {fetchingData ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your leave requests...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No leave requests found</h6>
                  <p className="text-muted">Click "Request Leave" to submit your first leave request.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: '120px' }}>Leave Type</th>
                        <th style={{ minWidth: '100px' }}>Start Date</th>
                        <th style={{ minWidth: '100px' }}>End Date</th>
                        <th style={{ minWidth: '80px' }}>Days</th>
                        <th style={{ minWidth: '100px' }}>Status</th>
                        <th style={{ minWidth: '100px' }}>Applied Date</th>
                        <th style={{ minWidth: '150px' }}>Reason</th>
                        <th style={{ minWidth: '140px' }}>Actions</th>
                      </tr>
                    </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="text-capitalize">{request.leaveType}</td>
                        <td>{new Date(request.startDate).toLocaleDateString()}</td>
                        <td>{new Date(request.endDate).toLocaleDateString()}</td>
                        <td>
                          {request.totalDays}
                          {request.isHalfDay && (
                            <small className="text-muted d-block">
                              ({request.halfDayPeriod} half-day)
                            </small>
                          )}
                        </td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{new Date(request.appliedDate).toLocaleDateString()}</td>
                        <td>
                          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {request.reason}
                          </div>
                        </td>
                        <td style={{ minWidth: '140px' }}>
                          <div className="action-buttons d-flex gap-1 align-items-center flex-wrap">
                            {canWithdraw(request.status) && (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => showConfirmation('withdraw', request.id, request)}
                                disabled={loading}
                                title="Withdraw this pending request"
                                className="d-flex align-items-center"
                              >
                                <i className="fas fa-undo me-1"></i>
                                Withdraw
                              </Button>
                            )}
                            {canDelete(request.status) && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => showConfirmation('delete', request.id, request)}
                                disabled={loading}
                                title="Delete this cancelled/rejected request"
                                className="d-flex align-items-center"
                              >
                                <i className="fas fa-trash me-1"></i>
                                Delete
                              </Button>
                            )}
                            {request.status === 'approved' && (
                              <div className="d-flex align-items-center text-success">
                                <i className="fas fa-check-circle me-1"></i>
                                <small className="fw-bold">Approved</small>
                              </div>
                            )}
                            {request.status === 'rejected' && !canDelete(request.status) && (
                              <div className="d-flex align-items-center text-danger">
                                <i className="fas fa-times-circle me-1"></i>
                                <small className="fw-bold">Rejected</small>
                              </div>
                            )}
                            {request.status === 'cancelled' && !canDelete(request.status) && (
                              <div className="d-flex align-items-center text-muted">
                                <i className="fas fa-ban me-1"></i>
                                <small className="fw-bold">Cancelled</small>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Leave Request Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Leave Type</Form.Label>
                  <Form.Select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isHalfDay"
                    label="Half Day Leave"
                    checked={formData.isHalfDay}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.isHalfDay ? formData.startDate : formData.endDate}
                    onChange={handleInputChange}
                    required
                    disabled={formData.isHalfDay}
                    min={formData.startDate}
                  />
                </Form.Group>
              </div>
            </div>

            {formData.isHalfDay && (
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Half Day Period</Form.Label>
                    <Form.Select
                      name="halfDayPeriod"
                      value={formData.halfDayPeriod}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="morning">Morning (First Half)</option>
                      <option value="afternoon">Afternoon (Second Half)</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <div className="alert alert-info">
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      Half-day leave will be counted as 0.5 days
                    </small>
                  </div>
                </div>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Please provide reason for leave"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {confirmAction.type === 'withdraw' ? 'Withdraw Leave Request' : 'Delete Leave Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmAction.requestData && (
            <div>
              <p>
                {confirmAction.type === 'withdraw' 
                  ? 'Are you sure you want to withdraw this leave request?' 
                  : 'Are you sure you want to delete this leave request? This action cannot be undone.'
                }
              </p>
              <div className="bg-light p-3 rounded">
                <strong>Request Details:</strong>
                <ul className="mb-0 mt-2">
                  <li><strong>Leave Type:</strong> <span className="text-capitalize">{confirmAction.requestData.leaveType}</span></li>
                  <li><strong>Duration:</strong> {new Date(confirmAction.requestData.startDate).toLocaleDateString()} to {new Date(confirmAction.requestData.endDate).toLocaleDateString()}</li>
                  <li><strong>Days:</strong> {confirmAction.requestData.totalDays}</li>
                  <li><strong>Status:</strong> <span className="text-capitalize">{confirmAction.requestData.status}</span></li>
                </ul>
              </div>
              {confirmAction.type === 'withdraw' && (
                <div className="alert alert-warning mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Note:</strong> Withdrawing this request will change its status to "Cancelled" and it cannot be reactivated.
                </div>
              )}
              {confirmAction.type === 'delete' && (
                <div className="alert alert-danger mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This will permanently delete the request from your records.
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={confirmAction.type === 'withdraw' ? 'warning' : 'danger'} 
            onClick={handleConfirmAction}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              confirmAction.type === 'withdraw' ? 'Withdraw Request' : 'Delete Request'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header>
            <i className="fas fa-check-circle me-2 text-success"></i>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default LeaveRequest;