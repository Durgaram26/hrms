import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import Navbar from "../components/Navbar"; // No longer needed
import "../styles/theme.css";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]); // FIX: Add state for branches
  const [companies, setCompanies] = useState([]); // Add state for companies
  const [formData, setFormData] = useState({
    // employeeCode: "", // REMOVED: Backend now auto-generates
    firstName: "",
    lastName: "",
    email: "", // Changed from companyEmail
    departmentId: "",
    positionId: "",
    dateOfJoining: "",
    branchId: "", // FIX: Add branchId to formData
    companyId: "", // Changed from hardcoded value to empty string
    dateOfBirth: "", // FIX: Initialize dateOfBirth
    gender: "",
    maritalStatus: "",
    bloodGroup: "",
    personalEmail: "",
    personalPhone: "",
    companyPhone: "",
    emergencyContact: "",
    emergencyContactName: "",
    permanentAddress: "",
    currentAddress: "",
    cityId: "",
    pinCode: "",
    dateOfConfirmation: "",
    probationPeriod: "",
    employmentType: "",
    reportingManagerId: "",
    terminationDate: "",
    terminationReason: "",
    profileImagePath: "",
    role: "employee",
  });

  useEffect(() => {
    fetchDepartments();
    fetchCompanies(); // Fetch companies first
  }, []);
  
  // When companies change and a default is set, fetch branches for that company
  useEffect(() => {
    if (formData.companyId) {
      fetchBranches(formData.companyId);
    }
  }, [formData.companyId]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/departments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchPositions = async (departmentId) => {
    if (!departmentId) {
      setPositions([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/positions/by-department/${departmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPositions(response.data);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  };

  // FIX: Add fetchBranches function
  const fetchBranches = async (companyIdParam) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/branches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        // If companyId is provided, filter branches by that company
        const allBranches = response.data.data;
        if (companyIdParam) {
          const filteredBranches = allBranches.filter(
            branch => branch.companyId === parseInt(companyIdParam)
          );
          setBranches(filteredBranches);
          // Reset branch selection if current selection doesn't belong to new company
          if (formData.branchId && !filteredBranches.some(b => b.id === parseInt(formData.branchId))) {
            setFormData(prev => ({ ...prev, branchId: '' }));
          }
        } else {
          setBranches(allBranches);
        }
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/companies`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanies(response.data.data);
      // If companies exist, set the first one as default
      if (response.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          companyId: response.data.data[0].id.toString()
        }));
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'departmentId') {
      fetchPositions(value);
      setFormData(prev => ({ ...prev, positionId: '' }));
    }
    
    if (name === 'companyId') {
      // When company changes, fetch branches for that company
      fetchBranches(value);
      // Reset branch selection
      setFormData(prev => ({ ...prev, branchId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous messages
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = { ...formData };
      
      // FIX: companyId is inferred from branchId on the backend, so we don't need to send it.
      delete payload.companyId;

      // Validate date of joining
      if (!payload.dateOfJoining) {
        setError("Date of Joining is required.");
        setLoading(false);
        return;
      }
      
      // REMOVED: Date reformatting is not needed as HTML input type="date" provides YYYY-MM-DD
      // const [day, month, year] = payload.dateOfJoining.split('-');
      // payload.dateOfJoining = `${year}-${month}-${day}`;

      // Validate date format (after reformatting)
      const dateOfJoiningObj = new Date(payload.dateOfJoining);
      if (isNaN(dateOfJoiningObj.getTime())) {
        setError("Invalid Date of Joining format after reformat.");
        setLoading(false);
        return;
      }
      
      // FIX: Reformat dateOfBirth to YYYY-MM-DD if it exists before sending
      if (payload.dateOfBirth) {
        const [dobDay, dobMonth, dobYear] = payload.dateOfBirth.split('-');
        payload.dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;
      }
      
      // Ensure IDs are parsed to integers before sending to backend
      payload.branchId = parseInt(payload.branchId); 
      payload.departmentId = parseInt(payload.departmentId);
      payload.positionId = parseInt(payload.positionId);
      
      // Validate required IDs
      if (isNaN(payload.branchId)) {
        setError("Invalid Branch selected.");
        setLoading(false);
        return;
      }
      
      // FIX: companyId is inferred from branchId on the backend, so we don't need to validate it.
      // if (isNaN(payload.companyId)) {
      //   setError("Invalid Company selected.");
      //   setLoading(false);
      //   return;
      // }
      
      if (isNaN(payload.departmentId)) {
        setError("Invalid Department selected.");
        setLoading(false);
        return;
      }
      
      if (isNaN(payload.positionId)) {
        setError("Invalid Position selected.");
        setLoading(false);
        return;
      }

      // Log the specific dateOfJoining value and the full payload
      console.log("Date of Joining being sent:", payload.dateOfJoining);
      console.log("Date object created:", dateOfJoiningObj.toISOString());
      console.log("Full payload being sent to /employees:", payload); 

      console.log("Sending request to create employee with payload:", payload);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/employees`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Response received:", response);
      console.log("Response data structure:", JSON.stringify(response.data, null, 2));
      console.log("Response data type:", typeof response.data);
      console.log("Response data.data type:", typeof response.data.data);
      
      // Check if the response data has the expected structure
      if (response.data && response.data.data) {
        console.log("Employee data fields:", Object.keys(response.data.data));
        if (!response.data.data.id) {
          console.warn("Warning: Employee data is missing the 'id' field. Backend returned EmployeeID as id.");
        }
      } else {
        console.warn("Warning: Response is missing the expected data structure");
      }
      
      // Check if the response is successful
      // More flexible success condition that doesn't rely on specific data structure
      if (response.status === 201 && response.data) {
        console.log("Employee created successfully:", response.data);
        // Show success message before redirecting
        setError(""); // Clear any previous errors
        
        // Use the employee data from the response
        const employeeData = response.data.data;
        // FIX: Use the success message directly from the server response
        // This avoids errors if the 'data' object has an unexpected structure
        const successMessage = response.data.message || 'Employee created successfully!';
        setSuccess(successMessage);
        
        // Scroll to top to show success message
        window.scrollTo(0, 0);
        
        // Store success in session storage to show on the employees list page
        sessionStorage.setItem('employeeCreationSuccess', 'true');
        sessionStorage.setItem('employeeCreationMessage', successMessage);
        
        // Set a timeout to redirect after showing the success message
        setTimeout(() => {
          navigate("/employees");
        }, 1500); // Redirect after 1.5 seconds - reduced time to prevent seeing error message
      } else {
        // This should not happen with axios (it throws for non-2xx responses)
        // but just in case there's an unexpected response format
        console.warn("Unexpected response format:", response);
        setError("Unexpected response from server. Please check if the employee was created.");
        setSuccess(""); // Clear any success message
        setLoading(false);
      }
    } catch (err) {
      console.error("Error adding employee:", err);
      
      // Check if the error is actually a successful creation but with response parsing issues
      // This is a common issue where the employee is created but the frontend has trouble processing the response
      if (err.response?.status === 201) {
        console.log("Employee was actually created successfully despite the error");
        setError(""); // Ensure no error is shown
        setSuccess("Employee created successfully! Redirecting to employee list...");
        
        // Store success in session storage to show on the employees list page
        sessionStorage.setItem('employeeCreationSuccess', 'true');
        sessionStorage.setItem('employeeCreationMessage', 'Employee created successfully!');
        
        // Redirect after showing the success message
        setTimeout(() => {
          navigate("/employees");
        }, 1500);
        return;
      }
      
      // Clear any success message for actual errors
      setSuccess("");
      
      // Log detailed error information for debugging
      console.log("Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status,
        request: err.request
      });
      
      // Enhanced error handling with specific messages
      if (err.response?.status === 400) {
        // Handle validation errors
        if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Invalid data provided. Please check all fields.");
        }
        
        // Check for foreign key constraint errors
        if (err.response.data?.error && typeof err.response.data.error === 'string' && err.response.data.error.includes("FOREIGN KEY constraint")) {
          if (err.response.data.error.includes("CompanyID")) {
            setError("Invalid Company selected. Please select a valid company.");
          } else if (err.response.data.error.includes("BranchID")) {
            setError("Invalid Branch selected. Please select a valid branch.");
          } else if (err.response.data.error.includes("DepartmentID")) {
            setError("Invalid Department selected. Please select a valid department.");
          } else if (err.response.data.error.includes("PositionID")) {
            setError("Invalid Position selected. Please select a valid position.");
          }
        }
      } else {
        // Fallback for other non-400 errors, or if specific error message is not found
        setError(err.response?.data?.message || "Failed to add employee");
      }
      
      // If the error contains validation details, display them
      // FIX: Stringify the entire err.response.data to see the full backend error payload
      if (err.response?.data) {
        console.error("Backend Error Response Data:", JSON.stringify(err.response.data, null, 2));
      }
      
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}
      
      {success && (
        <div className="alert alert-success mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <h3 className="h5 mb-3">Core Information</h3>
        <p className="text-muted mb-4">
          Enter the essential details for the new employee. They can complete the rest of their profile after signing up.
        </p>
        <div className="row mb-4">
          {/* REMOVED: Employee Code input field */}
          {/*
          <div className="col-md-4">
            <div className="form-group">
              <label className="mb-1">Employee Code (leave blank for auto)</label>
              <input type="text" className="form-control" name="employeeCode" value={formData.employeeCode} onChange={handleChange} />
            </div>
          </div>
          */}
          <div className="col-md-4">
            <div className="form-group">
              <label className="mb-1">First Name</label>
              <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="mb-1">Last Name</label>
              <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <h3 className="h5 mb-3">Employment Details</h3>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label className="mb-1">Employee Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="mb-1">Date of Joining</label>
              <input type="date" className="form-control" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} required />
            </div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label className="mb-1">Department</label>
              <select className="form-select" name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="mb-1">Position</label>
              <select className="form-select" name="positionId" value={formData.positionId} onChange={handleChange} required>
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Company and Branch Selection */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label className="mb-1">Company</label>
              <select className="form-select" name="companyId" value={formData.companyId} onChange={handleChange} required>
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.companyName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="mb-1">Branch</label>
              <select className="form-select" name="branchId" value={formData.branchId} onChange={handleChange} required>
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
