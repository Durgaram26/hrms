# HRMS Leave Management System

## Overview
This document describes the leave request connection between employees and HR in the HRMS system.

## Features Implemented

### Employee Features
- ✅ Submit leave requests with validation
- ✅ View personal leave request history
- ✅ Check leave balance by type
- ✅ Support for half-day leaves
- ✅ Real-time status updates
- ✅ **Withdraw pending leave requests**
- ✅ **Delete cancelled/rejected leave requests**

### HR Features
- ✅ View all employee leave requests
- ✅ Approve/reject requests with comments
- ✅ Filter requests by status, employee, date
- ✅ Dashboard statistics
- ✅ Audit trail for all actions

## API Endpoints

### Employee Endpoints
```
GET    /api/leaves/my-requests     - Get current employee's leave requests
GET    /api/leaves/my-balance      - Get current employee's leave balance
POST   /api/leaves                 - Submit a new leave request
PUT    /api/leaves/:id/withdraw    - Withdraw a pending leave request
DELETE /api/leaves/:id             - Delete a cancelled/rejected leave request
```

### HR/Admin Endpoints
```
GET    /api/leaves                 - Get all leave requests (with filters)
GET    /api/leaves/stats           - Get leave statistics for dashboard
PUT    /api/leaves/:id             - Approve/reject a leave request
```

### Dashboard Endpoints
```
GET    /api/employees/dashboard-stats    - Get employee dashboard statistics
GET    /api/employees/recent-activities  - Get recent employee activities
```

## Database Models

### Leave Model
- `id` - Primary key
- `employeeId` - Foreign key to Employee
- `leaveType` - Type of leave (annual, sick, personal, etc.)
- `startDate` - Leave start date
- `endDate` - Leave end date
- `totalDays` - Number of days requested
- `reason` - Reason for leave
- `status` - pending/approved/rejected/cancelled
- `appliedDate` - When the request was submitted
- `reviewedBy` - User ID who reviewed the request
- `reviewedDate` - When the request was reviewed
- `reviewComments` - HR comments on the request
- `isHalfDay` - Boolean for half-day leaves
- `halfDayPeriod` - morning/afternoon for half-day leaves
- `attachmentPath` - Optional file attachment

### LeaveBalance Model
- `id` - Primary key
- `employeeId` - Foreign key to Employee
- `year` - Year for the leave balance
- `leaveType` - Type of leave
- `totalAllowed` - Total days allowed for the year
- `used` - Days already used
- `remaining` - Days remaining
- `carryForward` - Days carried forward from previous year

## Frontend Components

### Employee Components
- `LeaveRequest.jsx` - Main leave request interface
  - Form to submit new requests
  - Table showing request history
  - Leave balance cards

### HR Components
- `HRLeaveManagement.jsx` - HR leave management interface
  - Table showing all employee requests
  - Approve/reject modal with comments
  - Filter and search functionality

## Navigation
- Employee: `/leave-request` - Access via sidebar "Leave Request"
- HR: `/hr/leave-management` - Access via sidebar "Leave Management"

## Workflow

### Employee Leave Request Process
1. Employee navigates to Leave Request page
2. Clicks "Request Leave" button
3. Fills out the form with:
   - Leave type
   - Start and end dates
   - Reason
   - Half-day option (if applicable)
4. System validates:
   - Required fields
   - Date logic
   - Leave balance availability
5. Request is submitted with "pending" status
6. Employee can view request status in their history
7. **Employee can withdraw pending requests** using the withdraw button
8. **Employee can delete cancelled/rejected requests** using the delete button

### HR Review Process
1. HR navigates to Leave Management page
2. Views all pending requests in a table
3. Clicks "Review" button for a specific request
4. Reviews employee details and request information
5. Selects "Approve" or "Reject"
6. Optionally adds comments
7. Submits decision
8. System updates:
   - Request status
   - Leave balance (if approved)
   - Audit log entry

## Testing

### Manual Testing
1. Start the backend server: `npm start` in `hrms-backend`
2. Start the frontend: `npm run dev` in `hrms-frontend`
3. Login as an employee
4. Navigate to Leave Request page
5. Submit a leave request
6. Login as HR user
7. Navigate to Leave Management page
8. Review and approve/reject the request

### API Testing
Run the test script:
```bash
cd hrms-backend
node test-leave-api.js
```

## Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```
JWT_SECRET=your_jwt_secret
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
```

### Database Setup
1. Ensure all models are synced
2. Run the leave balance seeder to initialize employee leave balances
3. The seeder runs automatically on server start

## Security Features
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Audit logging for all actions
- SQL injection protection via Sequelize ORM

## Future Enhancements
- Email notifications for leave requests
- Calendar integration
- Leave policy configuration
- Bulk approval functionality
- Leave reports and analytics
- Mobile app support

## Troubleshooting

### Common Issues
1. **"No employee profile associated with this user"**
   - Ensure the user's email matches an employee record
   - Check Employee model associations

2. **"Insufficient leave balance"**
   - Run the leave balance seeder
   - Check LeaveBalance records for the employee

3. **API 500 errors**
   - Check server logs for detailed error messages
   - Verify database connections
   - Ensure all required models are imported

### Debug Steps
1. Check browser console for frontend errors
2. Check server logs for backend errors
3. Verify JWT token is being sent with requests
4. Test API endpoints directly with Postman or curl
5. Check database for proper data relationships

## Support
For issues or questions about the leave management system, please check:
1. Server logs for error details
2. Browser console for frontend issues
3. Database records for data integrity
4. API responses for proper data structure