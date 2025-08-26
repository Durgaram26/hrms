import { useState, useEffect } from "react";
import axios from "axios";
// import Navbar from "../../components/Navbar"; // No longer needed
import "../../styles/theme.css";

export default function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if the response has the expected structure
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Received unexpected data format from server.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the user's role in the local state to reflect the change immediately
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role.");
    }
  };

  return (
    <div className="card">
      <h2 className="mb-4">User Role Management</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="text-center">Loading...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'hr' ? 'warning' : 'secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="form-control" 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 