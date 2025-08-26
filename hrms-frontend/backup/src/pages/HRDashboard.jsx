import Sidebar from "../components/Sidebar";

export default function HRDashboard() {
  return (
    <div style={{ marginLeft: "220px", padding: "20px" }}>
      <Sidebar role="hr" />
      <h2>👥 HR Dashboard</h2>
      <p>Welcome HR! You can view and manage employee records.</p>
    </div>
  );
}
