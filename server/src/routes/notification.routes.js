const express = require("express");
const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} = require("../controllers/notification.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markNotificationAsRead);
router.put("/read-all", protect, markAllNotificationsAsRead);

module.exports = router;