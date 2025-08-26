import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const AppSidebar = ({ role, isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const navItems = {
    admin: [
      { path: "/dashboard/admin", icon: "bi-speedometer2", name: "Dashboard" },
      { path: "/admin/users", icon: "bi-people", name: "User Roles" },
      { path: "/admin/departments", icon: "bi-building", name: "Departments" },
      { path: "/admin/positions", icon: "bi-briefcase", name: "Positions" },
      { path: "/employees", icon: "bi-person-lines-fill", name: "Employees" },
      { path: "/admin/locations", icon: "bi-geo-alt", name: "Locations" },
      { path: "/admin/companies", icon: "bi-building-fill-gear", name: "Companies" },
      { path: "/admin/leaves", icon: "bi-calendar-check", name: "Leave Requests" },
      { path: "/admin/attendance", icon: "bi-person-check", name: "Attendance" },
    ],
    hr: [
      { path: "/dashboard/hr", icon: "bi-speedometer2", name: "Dashboard" },
      { path: "/admin/departments", icon: "bi-building", name: "Departments" },
      { path: "/admin/leaves", icon: "bi-calendar-check", name: "Leave Requests" },
      { path: "/hr/leave-management", icon: "bi-calendar-event", name: "Leave Management" },
      { path: "/admin/attendance", icon: "bi-person-check", name: "Attendance" },
      { path: "/employees", icon: "bi-person-lines-fill", name: "Employees" },
    ],
    employee: [
      { path: "/dashboard/employee", icon: "bi-speedometer2", name: "Dashboard" },
      { path: "/my-profile", icon: "bi-person-circle", name: "My Profile" },
      { path: "/leave-request", icon: "bi-calendar-plus", name: "Leave Request" },
      { path: "/attendance", icon: "bi-person-check", name: "Attendance" },
    ],
  };

  const getNavLinks = () => {
    return navItems[role] || [];
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <Link to={`/dashboard/${role}`} className="sidebar-brand">
          <i className="bi bi-shield-lock-fill me-2"></i>
          <span>HRMS</span>
        </Link>
        <button className="btn d-md-none" onClick={toggleSidebar}>
          <i className="bi bi-x"></i>
        </button>
      </div>
      <ul className="sidebar-nav">
        {getNavLinks().map((item) => (
          <li className="nav-item" key={item.path}>
            <Link to={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
              <i className={`bi ${item.icon} me-2`}></i>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <LogoutButton />
      </div>
    </div>
  );
};

export default AppSidebar; 