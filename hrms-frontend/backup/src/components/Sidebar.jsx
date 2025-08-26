import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Sidebar = ({ role }) => {
  return (
    <div style={{
      width: "200px", height: "100vh", background: "#f0f0f0", padding: "20px",
      position: "fixed", left: 0, top: 0
    }}>
      <h3>{role.toUpperCase()}</h3>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {(role === "admin" || role === "hr") && (
            <>
              <li><Link to="/employees">Employee List</Link></li>
              <li><Link to="/employees/add">Add Employee</Link></li>
            </>
          )}
          {role === "employee" && (
            <li><Link to="/my-profile">My Profile</Link></li>
          )}
        </ul>
      </nav>
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
