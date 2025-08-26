const router = require("express").Router();
const ctrl = require("../controllers/authController");

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password/:token", ctrl.resetPassword);

module.exports = router;
