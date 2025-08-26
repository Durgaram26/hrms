import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/theme.css";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState({
    id: null,
    name: "",
    code: "",
    description: ""
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      setError("Failed to fetch departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const apiUrl = isEditing 
      ? `${import.meta.env.VITE_API_URL}/departments/${currentDepartment.id}`
      : `${import.meta.env.VITE_API_URL}/departments`;
    const method = isEditing ? 'put' : 'post';

    try {
      const token = localStorage.getItem("token");
      await axios[method](apiUrl, currentDepartment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDepartments();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} department.`);
    }
  };

  const handleEditClick = (department) => {
    setIsEditing(true);
    setCurrentDepartment({
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description || ""
    });
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (departmentId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/departments/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department.");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentDepartment({ id: null, name: "", code: "", description: "" });
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card">
          <h2 className="mb-4">Department List</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id}>
                      <td>{dept.name}</td>
                      <td>{dept.code}</td>
                      <td>{dept.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => handleEditClick(dept)} className="btn btn-primary btn-sm">Edit</button>
                          <button onClick={() => handleDeleteClick(dept.id)} className="btn btn-danger btn-sm">Delete</button>
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
          <h2 className="mb-4">{isEditing ? "Edit Department" : "Add Department"}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="mb-1">Department Name</label>
              <input type="text" name="name" value={currentDepartment.name} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label className="mb-1">Department Code</label>
              <input type="text" name="code" value={currentDepartment.code} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label className="mb-1">Description</label>
              <textarea name="description" value={currentDepartment.description} onChange={handleInputChange} className="form-control" rows="3"></textarea>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-100">{isEditing ? "Update Department" : "Add Department"}</button>
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