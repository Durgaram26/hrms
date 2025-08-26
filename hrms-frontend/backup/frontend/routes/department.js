const router = require("express").Router();
const ctrl = require("../controllers/departmentController");
const { verifyToken, allowRoles } = require("../middleware/auth");

// GET /api/departments - Get all departments
router.get("/", verifyToken, ctrl.getAllDepartments);

// GET /api/departments/:id - Get a single department by ID
router.get("/:id", verifyToken, ctrl.getDepartmentById);

// POST /api/departments - Create a new department (admin only)
router.post("/", verifyToken, allowRoles("admin"), ctrl.createDepartment);

// PUT /api/departments/:id - Update a department (admin only)
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updateDepartment);

// DELETE /api/departments/:id - Delete a department (admin only)
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deleteDepartment);

module.exports = router; 