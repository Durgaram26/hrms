const router = require("express").Router();
const ctrl = require("../controllers/positionController");
const { verifyToken, allowRoles } = require("../middleware/auth");

router.get("/", verifyToken, ctrl.getAllPositions);
router.get("/by-department/:departmentId", verifyToken, ctrl.getPositionsByDepartment);
router.get("/:id", verifyToken, ctrl.getPositionById);
router.post("/", verifyToken, allowRoles("admin"), ctrl.createPosition);
router.put("/:id", verifyToken, allowRoles("admin"), ctrl.updatePosition);
router.delete("/:id", verifyToken, allowRoles("admin"), ctrl.deletePosition);

module.exports = router; 