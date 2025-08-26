import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      alert(res.data.message);
      setLink(res.data.resetLink); // Show for dev/demo
    } catch (err) {
      alert(err.response?.data?.message || "Error sending reset link");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <button type="submit">Send Reset Link</button>
      </form>
      {link && (
        <div>
          <p>🔗 Reset Link (for demo):</p>
          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
        </div>
      )}
    </div>
  );
}
