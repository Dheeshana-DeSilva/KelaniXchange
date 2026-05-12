const express = require("express");
const {
    getDashboardStats,
    getAllUsers,
    suspendUser,
    unsuspendUser,
    getAllListingsAdmin,
    removeListingAdmin,
    getAllReports,
    updateReportStatus,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);

router.get("/listings", getAllListingsAdmin);
router.put("/listings/:id/remove", removeListingAdmin);

router.get("/reports", getAllReports);
router.put("/reports/:id/status", updateReportStatus);

module.exports = router;