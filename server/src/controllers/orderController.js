const Order = require("../models/Order");

// Get all orders for admin
const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "username email")
            .populate("seller", "username email")
            .populate("listing", "title price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders fetched successfully",
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get single order for admin
const getOrderByIdAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "username email fullName")
            .populate("seller", "username email fullName")
            .populate("listing", "title price category images");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch order details",
            error: error.message,
        });
    }
};

// Update order status for admin
const updateOrderStatusAdmin = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (orderStatus) {
            const validOrderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
            if (!validOrderStatuses.includes(orderStatus)) {
                return res.status(400).json({ message: "Invalid order status" });
            }
            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            const validPaymentStatuses = ["pending", "paid", "failed", "cancelled", "refunded"];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return res.status(400).json({ message: "Invalid payment status" });
            }
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update order status",
            error: error.message,
        });
    }
};

module.exports = {
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatusAdmin,
};
