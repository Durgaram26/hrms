import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Load remembered login
  useEffect(() => {
    console.log("Login component mounted");
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedPassword = localStorage.getItem("rememberPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, role } = res.data;
      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberPassword", password);
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.removeItem("rememberPassword");
      }

      navigate(`/dashboard/${role}`);
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login to HRMS</h2>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--primary-color)",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="mb-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{" "}
            Remember Me
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Login
        </button>
      </form>

      {loginError && (
        <div className="mt-3 text-danger">
          <p>{loginError}</p>
          <Link to="/forgot-password" className="text-primary">Forgot Password?</Link>
        </div>
      )}

      <hr className="mt-4 mb-4" />

      <p className="text-center">
        Don't have an account? <Link to="/signup" className="text-primary">Sign up here</Link>
      </p>
    </div>
  );
}
