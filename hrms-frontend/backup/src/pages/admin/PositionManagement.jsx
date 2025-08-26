import { useState, useEffect } from "react";
import axios from "axios";
// import Navbar from "../../components/Navbar"; // No longer needed
import "../../styles/theme.css";

export default function PositionManagement() {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({
    id: null,
    name: "",
    code: "",
    description: "",
    departmentId: ""
  });

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/positions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPositions(response.data);
    } catch (err) {
      setError("Failed to fetch positions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      setError("Failed to fetch departments.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPosition(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const apiUrl = isEditing
      ? `${import.meta.env.VITE_API_URL}/positions/${currentPosition.id}`
      : `${import.meta.env.VITE_API_URL}/positions`;
    const method = isEditing ? 'put' : 'post';

    try {
      const token = localStorage.getItem("token");
      await axios[method](apiUrl, currentPosition, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPositions();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} position.`);
    }
  };

  const handleEditClick = (position) => {
    setIsEditing(true);
    setCurrentPosition({
      id: position.id,
      name: position.name,
      code: position.code,
      description: position.description || "",
      departmentId: position.departmentId
    });
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (positionId) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/positions/${positionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPositions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete position.");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentPosition({ id: null, name: "", code: "", description: "", departmentId: "" });
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card">
          <h2 className="mb-4">Position List</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                ) : (
                  positions.map((pos) => (
                    <tr key={pos.id}>
                      <td>{pos.name}</td>
                      <td>{pos.code}</td>
                      <td>{departments.find(d => d.id === pos.departmentId)?.name}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => handleEditClick(pos)} className="btn btn-primary btn-sm">Edit</button>
                          <button onClick={() => handleDeleteClick(pos.id)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card">
          <h2 className="mb-4">{isEditing ? "Edit Position" : "Add Position"}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="mb-1">Position Name</label>
              <input type="text" name="name" value={currentPosition.name} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label className="mb-1">Position Code</label>
              <input type="text" name="code" value={currentPosition.code} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label className="mb-1">Department</label>
              <select name="departmentId" value={currentPosition.departmentId} onChange={handleInputChange} className="form-control" required>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="mb-1">Description</label>
              <textarea name="description" value={currentPosition.description} onChange={handleInputChange} className="form-control" rows="3"></textarea>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-100">{isEditing ? "Update Position" : "Add Position"}</button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn btn-secondary w-100 mt-2">Cancel Edit</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 