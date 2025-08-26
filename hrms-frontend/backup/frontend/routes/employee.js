const router = require("express").Router();
const ctrl = require("../controllers/employeeController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/profile", verifyToken, ctrl.getEmployeeProfile);
router.get("/dashboard-stats", verifyToken, ctrl.getEmployeeDashboardStats);
router.get("/recent-activities", verifyToken, ctrl.getRecentEmployeeActivities);
router.get("/", verifyToken, allowRoles("admin", "hr"), ctrl.getAllEmployees);
router.get("/:id", verifyToken, allowRoles("admin", "hr"), ctrl.getEmployeeById);
router.post("/", verifyToken, allowRoles("admin", "hr"), ctrl.createEmployee);
router.put("/:id", verifyToken, allowRoles("admin", "hr"), ctrl.updateEmployee);
router.delete("/:id", verifyToken, allowRoles("admin", "hr"), ctrl.deleteEmployee);

module.exports = router;