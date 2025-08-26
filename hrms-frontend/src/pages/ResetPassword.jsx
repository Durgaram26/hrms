import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
        newPassword,
      });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <button type="submit" style={{ width: "100%" }}>
          Reset Password
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
