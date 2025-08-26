import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

const LeaveRequestDebug = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testWithdraw = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/leaves/1/withdraw', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(`Withdraw Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`Withdraw Error: ${error.response?.data?.message || error.message}\nFull Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete('/api/leaves/1', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(`Delete Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`Delete Error: ${error.response?.data?.message || error.message}\nFull Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(`Get Requests Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`Get Requests Error: ${error.response?.data?.message || error.message}\nFull Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3>Leave Request Debug</h3>
      <div className="mb-3">
        <Button variant="primary" onClick={testGetRequests} disabled={loading} className="me-2">
          Test Get Requests
        </Button>
        <Button variant="warning" onClick={testWithdraw} disabled={loading} className="me-2">
          Test Withdraw (ID: 1)
        </Button>
        <Button variant="danger" onClick={testDelete} disabled={loading}>
          Test Delete (ID: 1)
        </Button>
      </div>
      {result && (
        <Alert variant="info">
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{result}</pre>
        </Alert>
      )}
    </div>
  );
};

export default LeaveRequestDebug;