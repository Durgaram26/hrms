import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: 0,
    newHires: 0,
    activeProjects: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch dashboard statistics
        const statsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/dashboard/stats`,
          { headers }
        );
        setStats(statsResponse.data);

        // Fetch recent activity
        const activityResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/dashboard/activity`,
          { headers }
        );
        setRecentActivity(activityResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container text-center mt-4">Loading...</div>
    );
  }

  return (
    <>
      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-title">Total Employees</span>
          <span className="stat-card-value">{stats.totalEmployees}</span>
          <span className="stat-card-change positive">
            +5% from last month
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card-title">Departments</span>
          <span className="stat-card-value">{stats.departments}</span>
        </div>

        <div className="stat-card">
          <span className="stat-card-title">New Hires</span>
          <span className="stat-card-value">{stats.newHires}</span>
          <span className="stat-card-change positive">
            +2 this month
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card-title">Active Projects</span>
          <span className="stat-card-value">{stats.activeProjects}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="mb-3">Quick Actions</h2>
      <div className="quick-actions">
        <Link to="/employees/add" className="action-card">
          <span className="action-icon">👤</span>
          <div>
            <h3>Add Employee</h3>
            <p>Create a new employee profile</p>
          </div>
        </Link>

        <Link to="/departments/manage" className="action-card">
          <span className="action-icon">🏢</span>
          <div>
            <h3>Manage Departments</h3>
            <p>Update department structure</p>
          </div>
        </Link>

        <Link to="/reports" className="action-card">
          <span className="action-icon">📊</span>
          <div>
            <h3>View Reports</h3>
            <p>Access HR analytics</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <h2 className="mb-3">Recent Activity</h2>
      <div className="activity-list">
        {recentActivity.map((activity, index) => (
          <div key={index} className="activity-item">
            <span className="activity-icon">
              {activity.type === "new_employee" ? "👤" : 
               activity.type === "department_update" ? "🏢" : 
               activity.type === "project_update" ? "📊" : "📝"}
            </span>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-time">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        {recentActivity.length === 0 && (
          <div className="activity-item">
            <div className="activity-content text-center">
              No recent activity
            </div>
          </div>
        )}
      </div>
    </>
  );
}
