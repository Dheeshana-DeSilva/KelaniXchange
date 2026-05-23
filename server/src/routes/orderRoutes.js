const express = require("express");
const {
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatusAdmin,
} = require("../controllers/orderController");

const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.get("/admin/:id", protect, adminOnly, getOrderByIdAdmin);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatusAdmin);

module.exports = router;
