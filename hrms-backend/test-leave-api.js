const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

const testLeaveRequest = {
  leaveType: 'annual',
  startDate: '2025-08-15',
  endDate: '2025-08-17',
  reason: 'Family vacation',
  isHalfDay: false
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testLogin = async () => {
  console.log('🔐 Testing login...');
  try {
    const response = await makeRequest('POST', '/auth/login', testUser);
    authToken = response.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.log('❌ Login failed');
    return false;
  }
};

const testGetLeaveBalance = async () => {
  console.log('📊 Testing get leave balance...');
  try {
    const response = await makeRequest('GET', '/leaves/my-balance');
    console.log('✅ Leave balance retrieved:', response.data.length, 'leave types');
    return true;
  } catch (error) {
    console.log('❌ Get leave balance failed');
    return false;
  }
};

const testApplyForLeave = async () => {
  console.log('📝 Testing apply for leave...');
  try {
    const response = await makeRequest('POST', '/leaves', testLeaveRequest);
    console.log('✅ Leave application submitted successfully');
    return response.data.id;
  } catch (error) {
    console.log('❌ Apply for leave failed');
    return null;
  }
};

const testGetMyLeaveRequests = async () => {
  console.log('📋 Testing get my leave requests...');
  try {
    const response = await makeRequest('GET', '/leaves/my-requests');
    console.log('✅ Leave requests retrieved:', response.data.length, 'requests');
    return true;
  } catch (error) {
    console.log('❌ Get my leave requests failed');
    return false;
  }
};

const testGetEmployeeDashboardStats = async () => {
  console.log('📈 Testing employee dashboard stats...');
  try {
    const response = await makeRequest('GET', '/employees/dashboard-stats');
    console.log('✅ Dashboard stats retrieved:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Get dashboard stats failed');
    return false;
  }
};

const testGetRecentActivities = async () => {
  console.log('🕒 Testing recent activities...');
  try {
    const response = await makeRequest('GET', '/employees/recent-activities');
    console.log('✅ Recent activities retrieved:', response.data.length, 'activities');
    return true;
  } catch (error) {
    console.log('❌ Get recent activities failed');
    return false;
  }
};

const testWithdrawLeaveRequest = async (leaveId) => {
  console.log('🔄 Testing withdraw leave request...');
  try {
    const response = await makeRequest('PUT', `/leaves/${leaveId}/withdraw`);
    console.log('✅ Leave request withdrawn successfully');
    return true;
  } catch (error) {
    console.log('❌ Withdraw leave request failed');
    return false;
  }
};

const testDeleteLeaveRequest = async (leaveId) => {
  console.log('🗑️ Testing delete leave request...');
  try {
    const response = await makeRequest('DELETE', `/leaves/${leaveId}`);
    console.log('✅ Leave request deleted successfully');
    return true;
  } catch (error) {
    console.log('❌ Delete leave request failed');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Leave API Tests...\n');
  
  // Test login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('');
  
  // Run all tests
  const tests = [
    testGetLeaveBalance,
    testGetMyLeaveRequests,
    testGetEmployeeDashboardStats,
    testGetRecentActivities
  ];
  
  // Test applying for leave and then withdrawing it
  console.log('📝 Testing complete leave workflow...');
  const leaveId = await testApplyForLeave();
  if (leaveId) {
    console.log('🔄 Testing withdraw functionality...');
    await testWithdrawLeaveRequest(leaveId);
    
    console.log('🗑️ Testing delete functionality...');
    await testDeleteLeaveRequest(leaveId);
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result !== false) passed++;
      else failed++;
    } catch (error) {
      failed++;
    }
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };