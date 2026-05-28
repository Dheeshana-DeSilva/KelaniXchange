const express = require("express");
const {
    getDashboardStats,
    getAllUsers,
    suspendUser,
    unsuspendUser,
    updateUserRole,
    updateUserStatus,
    getAllListingsAdmin,
    removeListingAdmin,
    updateListingAdmin,
    deleteListingAdmin,
    getAllReports,
    updateReportStatus,
    addUser,
    deleteUser,
    getAllLostFoundAdmin,
    updateLostFoundStatusAdmin,
    deleteLostFoundAdmin,
    createAdminNotification,
    getAdminNotifications,
    deleteAdminNotification,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.post("/users", addUser);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/listings", getAllListingsAdmin);
router.put("/listings/:id/remove", removeListingAdmin);
router.put("/listings/:id", updateListingAdmin);
router.delete("/listings/:id", deleteListingAdmin);

router.get("/reports", getAllReports);
router.put("/reports/:id/status", updateReportStatus);

router.get("/lost-found", getAllLostFoundAdmin);
router.put("/lost-found/:id/status", updateLostFoundStatusAdmin);
router.delete("/lost-found/:id", deleteLostFoundAdmin);

router.get("/notifications", getAdminNotifications);
router.post("/notifications", createAdminNotification);
router.delete("/notifications/:id", deleteAdminNotification);

module.exports = router;
