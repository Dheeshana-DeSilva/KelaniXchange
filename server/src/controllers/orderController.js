const Order = require("../models/Order");
const Listing = require("../models/Listing");

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
            .populate("listing", "title price category images condition location");

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

        const previousOrderStatus = order.orderStatus;

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

        if (previousOrderStatus !== "cancelled" && order.orderStatus === "cancelled") {
            const listing = await Listing.findById(order.listing);
            if (listing) {
                listing.quantity += order.quantity;
                if (listing.quantity > 0) {
                    listing.status = "available";
                }
                await listing.save();
            }
        }

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

// Create new orders from cart checkout
const createOrders = async (req, res) => {
    try {
        const { items, paymentMethod, meetupLocation, phone, note } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items provided for checkout" });
        }

        const createdOrders = [];

        for (const item of items) {
            const listing = await Listing.findById(item.listingId);
            if (!listing) {
                return res.status(404).json({ message: `Listing not found for ID: ${item.listingId}` });
            }

            if (listing.status !== "available" && listing.status !== "active") {
                return res.status(400).json({ message: `Item "${listing.title}" is no longer available` });
            }

            const requestedQuantity = item.quantity || 1;
            if (requestedQuantity < 1 || requestedQuantity > listing.quantity) {
                return res.status(400).json({
                    message: `Invalid quantity for "${listing.title}". Available: ${listing.quantity}`
                });
            }

            if (listing.seller.toString() === req.user.id) {
                return res.status(400).json({ message: `You cannot buy your own item: "${listing.title}"` });
            }

            const order = await Order.create({
                user: req.user.id,
                listing: listing._id,
                seller: listing.seller,
                quantity: requestedQuantity,
                totalAmount: listing.price * requestedQuantity,
                paymentMethod: paymentMethod || "Cash",
                meetupLocation: meetupLocation || "University of Kelaniya - Main Campus",
                phone,
                note,
                paymentStatus: "pending",
                orderStatus: "pending",
            });

            // Deduct from listing quantity
            listing.quantity -= requestedQuantity;

            // Mark as sold if no more quantity available
            if (listing.quantity <= 0) {
                listing.status = "sold";
                listing.quantity = 0;
            } else {
                listing.status = "available";
            }

            await listing.save();

            createdOrders.push(order);
        }

        res.status(201).json({
            message: "Orders placed successfully",
            count: createdOrders.length,
            orders: createdOrders,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to place orders",
            error: error.message,
        });
    }
};

// Get current user's purchase history (buyer)
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("listing", "title price category images condition location")
            .populate("seller", "username email fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders fetched successfully",
            orders,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get current user's received sales (seller)
const getUserSales = async (req, res) => {
    try {
        const sales = await Order.find({ seller: req.user.id })
            .populate("listing", "title price category images condition location")
            .populate("user", "username email fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Sales fetched successfully",
            sales,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch sales",
            error: error.message,
        });
    }
};

// Cancel a pending order (buyer)
const cancelUserOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Only the buyer can cancel it
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to cancel this order" });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({ message: `Cannot cancel order with status: ${order.orderStatus}` });
        }

        order.orderStatus = "cancelled";
        order.paymentStatus = "cancelled";
        await order.save();

        // Release the listing quantity back
        const listing = await Listing.findById(order.listing);
        if (listing) {
            listing.quantity += order.quantity;
            if (listing.quantity > 0) {
                listing.status = "available";
            }
            await listing.save();
        }

        res.status(200).json({
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel order",
            error: error.message,
        });
    }
};

// Update a sale status by the seller who owns the order
const updateSellerOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this sale" });
        }

        const previousOrderStatus = order.orderStatus;

        if (order.orderStatus === "cancelled") {
            return res.status(400).json({ message: "Cancelled orders cannot be updated" });
        }

        if (orderStatus) {
            const validOrderStatuses = ["pending", "processing", "delivered", "cancelled"];
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

        if (previousOrderStatus !== "cancelled" && order.orderStatus === "cancelled") {
            const listing = await Listing.findById(order.listing);
            if (listing) {
                listing.quantity += order.quantity;
                if (listing.quantity > 0) {
                    listing.status = "available";
                }
                await listing.save();
            }
        }

        res.status(200).json({
            message: "Sale updated successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update sale",
            error: error.message,
        });
    }
};

module.exports = {
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatusAdmin,
    createOrders,
    getUserOrders,
    getUserSales,
    cancelUserOrder,
    updateSellerOrderStatus,
};
