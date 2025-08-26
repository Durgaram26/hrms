const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const auth = require("../middleware/auth");
const { checkPermission } = require("../middleware/permissionMiddleware");

// Protect all admin routes with authentication and admin role check
router.use(auth.verifyToken);
router.use(auth.allowRoles("admin"));

// User management routes
router.get("/users", checkPermission("user.view"), ctrl.getAllUsers);
router.put("/users/:id/role", checkPermission("role.manage"), ctrl.updateUserRole);

// Permission management routes
router.get("/permissions", checkPermission("permission.manage"), ctrl.getAllPermissions);
router.get("/roles/:role/permissions", checkPermission("permission.manage"), ctrl.getRolePermissions);
router.put("/roles/:role/permissions", checkPermission("permission.manage"), ctrl.updateRolePermissions);
router.post("/permissions", checkPermission("permission.manage"), ctrl.createPermission);

// Audit log routes
router.get("/audit-logs", checkPermission("audit.view"), ctrl.getAuditLogs);
router.get("/attendance/recent", checkPermission("attendance.view"), ctrl.getRecentAttendanceLogs);

// Geo-fence management routes
router.post("/geofences", checkPermission("geofence.manage"), ctrl.createGeofence);
router.delete("/geofences/:id", checkPermission("geofence.manage"), ctrl.deleteGeofence);

// Branch routes
router.get("/branches", checkPermission("branch.view"), ctrl.getAllBranches); 
router.post("/branches", checkPermission("branch.manage"), ctrl.createBranch); 
router.put("/branches/:id", checkPermission("branch.manage"), ctrl.updateBranch); 
router.delete("/branches/:id", checkPermission("branch.manage"), ctrl.deleteBranch); 

// Company routes
router.get("/companies", checkPermission("company.view"), ctrl.getAllCompanies); 
router.post("/companies", checkPermission("company.manage"), ctrl.createCompany); 
router.put("/companies/:id", checkPermission("company.manage"), ctrl.updateCompany); 
router.delete("/companies/:id", checkPermission("company.manage"), ctrl.deleteCompany); 
router.get("/companies/:id", checkPermission("company.view"), ctrl.getCompanyById); 

// City routes (for branch management dropdown)
router.get("/cities", checkPermission("city.view"), ctrl.getAllCities); 
router.post("/cities", checkPermission("city.manage"), ctrl.createCity); // New: Create City
router.put("/cities/:id", checkPermission("city.manage"), ctrl.updateCity); // New: Update City
router.delete("/cities/:id", checkPermission("city.manage"), ctrl.deleteCity); // New: Delete City

// State routes (for city management dropdown)
router.get("/states", checkPermission("city.view"), ctrl.getAllStates); // New: Get All States
router.post("/states", checkPermission("state.manage"), ctrl.createState); // New: Create State
router.put("/states/:id", checkPermission("state.manage"), ctrl.updateState); // New: Update State
router.delete("/states/:id", checkPermission("state.manage"), ctrl.deleteState); // New: Delete State

// Country routes
router.get("/countries", checkPermission("country.view"), ctrl.getAllCountries); // New: Get All Countries
router.post("/countries", checkPermission("country.manage"), ctrl.createCountry); // New: Create Country
router.put("/countries/:id", checkPermission("country.manage"), ctrl.updateCountry); // New: Update Country
router.delete("/countries/:id", checkPermission("country.manage"), ctrl.deleteCountry); // New: Delete Country

module.exports = router;
