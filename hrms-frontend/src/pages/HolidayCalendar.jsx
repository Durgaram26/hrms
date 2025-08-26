import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/theme.css";

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    type: "National",
    description: "",
  });

  useEffect(() => {
    fetchHolidays();
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/role`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAdmin(response.data.role === "admin");
    } catch (err) {
      console.error("Failed to check role:", err);
    }
  };

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/holidays`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Sort holidays by date
      const sortedHolidays = response.data.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      // Group holidays by month
      const groupedHolidays = groupHolidaysByMonth(sortedHolidays);
      setHolidays(groupedHolidays);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch holidays");
      setLoading(false);
    }
  };

  const groupHolidaysByMonth = (holidays) => {
    const months = {};
    holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!months[monthYear]) {
        months[monthYear] = [];
      }
      months[monthYear].push(holiday);
    });
    return months;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/holidays`,
        newHoliday,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchHolidays();
      setNewHoliday({
        name: "",
        date: "",
        type: "National",
        description: "",
      });
      setError("");
    } catch (err) {
      setError("Failed to add holiday");
    }
  };

  const deleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/holidays/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchHolidays();
    } catch (err) {
      setError("Failed to delete holiday");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar role={isAdmin ? "admin" : "employee"} />
        <div className="container text-center mt-4">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar role={isAdmin ? "admin" : "employee"} />
      <div className="container mt-4">
        <div className="card">
          <h2 className="mb-4">Holiday Calendar {new Date().getFullYear()}</h2>

          {/* Add Holiday Form (Admin Only) */}
          {isAdmin && (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="form-group">
                <label className="mb-1">Holiday Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newHoliday.name}
                  onChange={(e) =>
                    setNewHoliday({ ...newHoliday, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="mb-1">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newHoliday.date}
                  onChange={(e) =>
                    setNewHoliday({ ...newHoliday, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="mb-1">Type</label>
                <select
                  className="form-control"
                  value={newHoliday.type}
                  onChange={(e) =>
                    setNewHoliday({ ...newHoliday, type: e.target.value })
                  }
                  required
                >
                  <option value="National">National Holiday</option>
                  <option value="Regional">Regional Holiday</option>
                  <option value="Optional">Optional Holiday</option>
                </select>
              </div>

              <div className="form-group">
                <label className="mb-1">Description</label>
                <textarea
                  className="form-control"
                  value={newHoliday.description}
                  onChange={(e) =>
                    setNewHoliday({ ...newHoliday, description: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary mt-3">
                Add Holiday
              </button>
            </form>
          )}

          {error && <div className="text-danger mb-3">{error}</div>}

          {/* Holiday List */}
          {Object.entries(holidays).map(([monthYear, monthHolidays]) => (
            <div key={monthYear} className="mb-4">
              <h3 className="mb-3">{monthYear}</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Holiday</th>
                      <th>Type</th>
                      <th>Description</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {monthHolidays.map((holiday) => (
                      <tr key={holiday.id}>
                        <td>
                          {new Date(holiday.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td>{holiday.name}</td>
                        <td>
                          <span
                            className={`badge ${
                              holiday.type === "National"
                                ? "bg-primary"
                                : holiday.type === "Regional"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {holiday.type}
                          </span>
                        </td>
                        <td>{holiday.description}</td>
                        {isAdmin && (
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteHoliday(holiday.id)}
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 