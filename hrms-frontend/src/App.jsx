import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout
import DashboardLayout from "./components/DashboardLayout";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";

// Dashboard Pages
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/admin/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

// Admin Management
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import PositionManagement from "./pages/admin/PositionManagement";
import UserRoleManagement from "./pages/admin/UserRoleManagement";
import LocationSettings from "./pages/admin/LocationSettings";
import CompanyManagement from "./pages/admin/CompanyManagement";
import CompanyDetail from "./pages/admin/CompanyDetail"; // Import CompanyDetail
import LeaveManagement from "./pages/admin/LeaveManagement";
import AttendanceManagement from "./pages/admin/AttendanceManagement";

// Employee Management (Admin + HR)
import EmployeeList from "./pages/EmployeeList";
import AddEmployee from "./pages/AddEmployee";
import EmployeeEdit from "./pages/EmployeeEdit";
import EmployeeView from "./pages/EmployeeView";

// Employee Self Profile
import EmployeeProfile from "./pages/EmployeeProfile";
import AttendancePage from "./pages/AttendancePage";

// Leave Management
import LeaveRequest from "./pages/LeaveRequest";
import HRLeaveManagement from "./pages/HRLeaveManagement";

// Auth Helpers
import { getToken, getUserRole } from "./utils/auth";

const ProtectedRoute = ({ children, pageTitle }) => {
  const token = getToken();
  const userRole = getUserRole();

  if (!token) return <Navigate to="/login" replace />;
  
  // This is a basic role check. You might want to expand on this.
  // For example, what if an employee tries to access an admin page?
  // The current logic in your server should handle this, but client-side checks are good too.

  return <DashboardLayout pageTitle={pageTitle}>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route path="/dashboard/admin" element={<ProtectedRoute pageTitle="Admin Dashboard"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/hr" element={<ProtectedRoute pageTitle="HR Dashboard"><HRDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/employee" element={<ProtectedRoute pageTitle="Employee Dashboard"><EmployeeDashboard /></ProtectedRoute>} />

        <Route path="/admin/departments" element={<ProtectedRoute pageTitle="Department Management"><DepartmentManagement /></ProtectedRoute>} />
        <Route path="/admin/positions" element={<ProtectedRoute pageTitle="Position Management"><PositionManagement /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute pageTitle="User Role Management"><UserRoleManagement /></ProtectedRoute>} />
        <Route path="/admin/locations" element={<ProtectedRoute pageTitle="Location Settings"><LocationSettings /></ProtectedRoute>} />
        <Route path="/admin/companies" element={<ProtectedRoute pageTitle="Company Management"><CompanyManagement /></ProtectedRoute>} />
        <Route path="/admin/companies/:companyId" element={<ProtectedRoute pageTitle="Company Details"><CompanyDetail /></ProtectedRoute>} /> {/* New Company Detail Route */}
        <Route path="/admin/leaves" element={<ProtectedRoute pageTitle="Leave Management"><LeaveManagement /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute pageTitle="Attendance Management"><AttendanceManagement /></ProtectedRoute>} />

        <Route path="/employees" element={<ProtectedRoute pageTitle="Employee List"><EmployeeList /></ProtectedRoute>} />
        <Route path="/employees/add" element={<ProtectedRoute pageTitle="Add Employee"><AddEmployee /></ProtectedRoute>} />
        <Route path="/employees/:id" element={<ProtectedRoute pageTitle="Employee Details"><EmployeeView /></ProtectedRoute>} />
        <Route path="/employees/edit/:id" element={<ProtectedRoute pageTitle="Edit Employee"><EmployeeEdit /></ProtectedRoute>} />

        <Route path="/my-profile" element={<ProtectedRoute pageTitle="My Profile"><EmployeeProfile /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute pageTitle="Mark Attendance"><AttendancePage /></ProtectedRoute>} />
        
        {/* Leave Management Routes */}
        <Route path="/leave-request" element={<ProtectedRoute pageTitle="Leave Request"><LeaveRequest /></ProtectedRoute>} />
        <Route path="/hr/leave-management" element={<ProtectedRoute pageTitle="HR Leave Management"><HRLeaveManagement /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
