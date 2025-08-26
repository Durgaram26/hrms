import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div>
      <h2>Unauthorized</h2>
      <p>You do not have permission to view this page.</p>
      <Link to="/login">Back to Login</Link>
    </div>
  );
}
