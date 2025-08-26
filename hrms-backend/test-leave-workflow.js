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
  startDate: '2025-08-20',
  endDate: '2025-08-22',
  reason: 'Test leave for workflow testing',
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

// Test the complete workflow
const testCompleteWorkflow = async () => {
  console.log('🚀 Starting Complete Leave Workflow Test...\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await makeRequest('POST', '/auth/login', testUser);
    authToken = loginResponse.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Apply for leave
    console.log('2️⃣ Applying for leave...');
    const applyResponse = await makeRequest('POST', '/leaves', testLeaveRequest);
    const leaveId = applyResponse.data.id;
    console.log(`✅ Leave application submitted with ID: ${leaveId}\n`);
    
    // Step 3: Get leave requests to verify
    console.log('3️⃣ Fetching leave requests...');
    const requestsResponse = await makeRequest('GET', '/leaves/my-requests');
    const createdRequest = requestsResponse.data.find(req => req.id === leaveId);
    console.log(`✅ Found request with status: ${createdRequest.status}\n`);
    
    // Step 4: Withdraw the leave request
    console.log('4️⃣ Withdrawing leave request...');
    const withdrawResponse = await makeRequest('PUT', `/leaves/${leaveId}/withdraw`);
    console.log(`✅ Leave request withdrawn: ${withdrawResponse.message}\n`);
    
    // Step 5: Verify status changed to cancelled
    console.log('5️⃣ Verifying status change...');
    const updatedRequestsResponse = await makeRequest('GET', '/leaves/my-requests');
    const withdrawnRequest = updatedRequestsResponse.data.find(req => req.id === leaveId);
    console.log(`✅ Request status is now: ${withdrawnRequest.status}\n`);
    
    // Step 6: Delete the cancelled request
    console.log('6️⃣ Deleting cancelled request...');
    const deleteResponse = await makeRequest('DELETE', `/leaves/${leaveId}`);
    console.log(`✅ Leave request deleted: ${deleteResponse.message}\n`);
    
    // Step 7: Verify request is gone
    console.log('7️⃣ Verifying deletion...');
    const finalRequestsResponse = await makeRequest('GET', '/leaves/my-requests');
    const deletedRequest = finalRequestsResponse.data.find(req => req.id === leaveId);
    if (!deletedRequest) {
      console.log('✅ Request successfully deleted from records\n');
    } else {
      console.log('❌ Request still exists in records\n');
    }
    
    console.log('🎉 Complete workflow test passed!');
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
};

// Run the test
if (require.main === module) {
  testCompleteWorkflow().catch(console.error);
}

module.exports = { testCompleteWorkflow };