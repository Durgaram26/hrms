require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const departmentRoutes = require("./routes/department");
const positionRoutes = require("./routes/position");
const adminRoutes = require("./routes/admin");
const attendanceRoutes = require("./routes/attendance");

const { initializeDefaultPermissions } = require("./controllers/adminController");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);

// Test Route
app.get("/", (req, res) => res.send("HRMS Backend Running"));

sequelize.authenticate()
  .then(() => {
    console.log("✅ DB connected");
    return sequelize.sync();
  })
  .then(() => {
    // Initialize default permissions after database sync
    return initializeDefaultPermissions();
  })
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ DB connection error:", err));
