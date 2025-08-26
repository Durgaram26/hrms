import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Show success message and redirect to login
      navigate("/login", { 
        state: { message: "Account created successfully! Please login." }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create Account</h2>
      
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label className="mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Create a password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--primary-color)"
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="mb-1">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            className="form-control"
            placeholder="Confirm your password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Account Type</label>
          <select
            name="role"
            className="form-control"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="hr">HR Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        {error && (
          <div className="text-danger mb-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <hr className="mt-4 mb-4" />

      <p className="text-center">
        Already have an account? <Link to="/login" className="text-primary">Login here</Link>
      </p>
    </div>
  );
}
