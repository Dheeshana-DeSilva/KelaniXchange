const express = require("express");
const {
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatusAdmin,
    createOrders,
    getUserOrders,
    getUserSales,
    cancelUserOrder,
    deleteUserCancelledOrder,
    updateSellerOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// User routes
router.post("/", protect, createOrders);
router.get("/my-orders", protect, getUserOrders);
router.get("/my-sales", protect, getUserSales);
router.put("/:id/cancel", protect, cancelUserOrder);
router.delete("/:id", protect, deleteUserCancelledOrder);
router.put("/sales/:id/status", protect, updateSellerOrderStatus);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.get("/admin/:id", protect, adminOnly, getOrderByIdAdmin);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatusAdmin);

module.exports = router;
