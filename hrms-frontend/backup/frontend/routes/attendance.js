const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Protect all attendance routes with authentication
router.use(auth.verifyToken);

// Employee routes
router.post('/clock-in', ctrl.clockIn);
router.post('/clock-out', ctrl.clockOut);
router.get('/status', ctrl.getMyAttendanceStatus);
router.get('/my-history', ctrl.getMyAttendanceHistory);
router.post('/regularization/request', ctrl.requestRegularization);

// HR/Admin routes
router.get('/all', auth.allowRoles('admin', 'hr'), checkPermission('attendance.view'), ctrl.getAllAttendance);
router.get('/regularization/pending', auth.allowRoles('admin', 'hr'), checkPermission('attendance.manage'), ctrl.getPendingRegularizations);
router.post('/regularization/process', auth.allowRoles('admin', 'hr'), checkPermission('attendance.manage'), ctrl.processRegularization);
router.get('/report', auth.allowRoles('admin', 'hr'), checkPermission('attendance.view'), ctrl.generateAttendanceReport);

// New route to get geofences for a branch
router.get('/geofences/:branchId', auth.allowRoles('admin', 'hr', 'employee'), ctrl.getBranchGeofences);

module.exports = router;