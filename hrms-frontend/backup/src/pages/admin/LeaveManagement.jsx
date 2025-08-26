import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/leaves`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveRequests(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch leave requests");
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/leaves/${id}`,
        { status: "Approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeaveRequests();
    } catch (err) {
      setError("Failed to approve leave request");
    }
  };

  const handleDeny = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/leaves/${id}`,
        { status: "Denied" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeaveRequests();
    } catch (err) {
      setError("Failed to deny leave request");
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Leave Management</h2>
      <div className="card">
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Leave Type</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employeeName}</td>
                  <td>{request.leaveType}</td>
                  <td>{request.startDate}</td>
                  <td>{request.endDate}</td>
                  <td>
                    <span className={`badge bg-${request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'danger'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.status === 'Pending' && (
                      <>
                        <button onClick={() => handleApprove(request.id)} className="btn btn-sm btn-success me-2">Approve</button>
                        <button onClick={() => handleDeny(request.id)} className="btn btn-sm btn-danger">Deny</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement; 