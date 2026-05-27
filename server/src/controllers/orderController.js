const Order = require("../models/Order");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const { getIO } = require("../config/socket");

const createNotification = async ({ user, type, title, message, relatedId, targetPath }) => {
    if (!user) return;
    const notification = await Notification.create({ user, type, title, message, relatedId, targetPath });

    try {
        getIO().to(`user:${user.toString()}`).emit("notificationUpdated", notification);
    } catch (error) {
        // Socket.IO may not be initialized in scripts/tests.
    }
};

const PAYMENT_TIMEOUT_HOURS = Math.max(1, Number(process.env.PAYMENT_TIMEOUT_HOURS) || 48);

const getPaymentExpiryDate = () => {
    return new Date(Date.now() + PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000);
};

const restoreListingQuantity = async (order) => {
    const listingId = order.listing?._id || order.listing;
    const listing = await Listing.findById(listingId);
    if (!listing) return;

    listing.quantity += order.quantity;
    if (listing.quantity > 0) {
        listing.status = "available";
    }
    await listing.save();
};

const expireOrderIfTimedOut = async (order) => {
    if (
        order.paymentMethod !== "BankTransfer" ||
        order.paymentStatus !== "pending" ||
        order.orderStatus !== "pending" ||
        !order.paymentExpiresAt ||
        new Date(order.paymentExpiresAt).getTime() > Date.now()
    ) {
        return order;
    }

    order.paymentStatus = "expired";
    order.orderStatus = "cancelled";
    order.expiredAt = new Date();
    await order.save();
    await restoreListingQuantity(order);

    await createNotification({
        user: order.user,
        type: "order_cancelled",
        title: "Payment expired",
        message: "Your order was cancelled because payment verification timed out.",
        relatedId: order._id,
    });

    await createNotification({
        user: order.seller,
        type: "order_cancelled",
        title: "Order expired",
        message: "An order was cancelled because payment verification timed out.",
        relatedId: order._id,
    });

    return order;
};

const expireTimedOutOrders = async (orders) => {
    await Promise.all(orders.map((order) => expireOrderIfTimedOut(order)));
};

const uploadPaymentProof = async (file) => {
    if (!file) return "";

    const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "kelanixchange/payment-proofs",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(file.buffer);
    });

    return uploadResult.secure_url;
};

// Get all orders for admin
const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "username email")
            .populate("seller", "username email")
            .populate("listing", "title price")
            .sort({ createdAt: -1 });
        await expireTimedOutOrders(orders);

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
        
        const order = await Order.findById(req.params.id).populate("listing", "title");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const previousOrderStatus = order.orderStatus;
        const previousPaymentStatus = order.paymentStatus;

        if (orderStatus) {
            const validOrderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
            if (!validOrderStatuses.includes(orderStatus)) {
                return res.status(400).json({ message: "Invalid order status" });
            }
            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            const validPaymentStatuses = ["pending", "paid", "failed", "cancelled", "refunded", "expired"];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return res.status(400).json({ message: "Invalid payment status" });
            }
            order.paymentStatus = paymentStatus;
            if (paymentStatus === "paid" && !order.paidAt) {
                order.paidAt = new Date();
            }
            if (paymentStatus === "paid" && order.orderStatus === "pending") {
                order.orderStatus = "processing";
            }
            if (paymentStatus === "failed" && order.orderStatus !== "cancelled") {
                order.orderStatus = "pending";
            }
            if (paymentStatus === "expired") {
                order.orderStatus = "cancelled";
                order.expiredAt = new Date();
            }
            if (paymentStatus === "pending" && order.paymentMethod === "BankTransfer") {
                order.paymentExpiresAt = getPaymentExpiryDate();
            }
        }

        await order.save();

        if (previousOrderStatus !== "cancelled" && order.orderStatus === "cancelled") {
            await restoreListingQuantity(order);
        }

        if (orderStatus && previousOrderStatus !== order.orderStatus) {
            await createNotification({
                user: order.user,
                type: order.orderStatus === "cancelled" ? "order_cancelled" : "order_updated",
                title: "Order status updated",
                message: `Your order status changed to ${order.orderStatus}.`,
                relatedId: order._id,
            });
        }

        if (paymentStatus && previousPaymentStatus !== order.paymentStatus) {
            await createNotification({
                user: order.user,
                type: "payment_updated",
                title: "Payment status updated",
                message: `Your payment status changed to ${order.paymentStatus}.`,
                relatedId: order._id,
            });
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
        const { paymentMethod, meetupLocation, phone, note, paymentReference } = req.body;
        const items = typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items;
        const selectedPaymentMethod = paymentMethod || "Cash";
        const validCheckoutPaymentMethods = ["Cash", "BankTransfer"];

        if (!validCheckoutPaymentMethods.includes(selectedPaymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items provided for checkout" });
        }

        if (selectedPaymentMethod === "BankTransfer" && !paymentReference && !req.file) {
            return res.status(400).json({ message: "Add a payment reference or upload a receipt screenshot" });
        }

        const paymentProofUrl = await uploadPaymentProof(req.file);
        const createdOrders = [];
        const paymentGroupId = selectedPaymentMethod !== "Cash"
            ? `KX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
            : undefined;

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
                paymentMethod: selectedPaymentMethod,
                paymentGroupId,
                meetupLocation: meetupLocation || "University of Kelaniya - Main Campus",
                phone,
                note,
                paymentReference,
                paymentProofUrl,
                paymentStatus: "pending",
                orderStatus: "pending",
                paymentExpiresAt: selectedPaymentMethod === "BankTransfer" ? getPaymentExpiryDate() : undefined,
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

            await createNotification({
                user: listing.seller,
                type: "order_received",
                title: "New order received",
                message: `${req.user.username} placed an order for "${listing.title}".`,
                relatedId: order._id,
            });

            await createNotification({
                user: req.user.id,
                type: "order_placed",
                title: "Order placed",
                message: `Your order for "${listing.title}" was placed successfully.`,
                relatedId: order._id,
            });
        }

        const responsePayload = {
            message: "Orders placed successfully",
            count: createdOrders.length,
            orders: createdOrders,
        };

        res.status(201).json({
            ...responsePayload,
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
        await expireTimedOutOrders(orders);

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
        await expireTimedOutOrders(sales);

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
        const order = await Order.findById(req.params.id).populate("listing", "title");

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
        await restoreListingQuantity(order);

        await createNotification({
            user: order.seller,
            type: "order_cancelled",
            title: "Order cancelled",
            message: `A buyer cancelled an order for "${order.listing?.title || "one of your listings"}".`,
            relatedId: order._id,
        });

        await createNotification({
            user: order.user,
            type: "order_cancelled",
            title: "Order cancelled",
            message: `Your order for "${order.listing?.title || "this listing"}" was cancelled successfully.`,
            relatedId: order._id,
        });

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

// Delete a cancelled order from the buyer's order history
const deleteUserCancelledOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this order" });
        }

        if (order.orderStatus !== "cancelled") {
            return res.status(400).json({ message: "Only cancelled orders can be deleted" });
        }

        await order.deleteOne();

        res.status(200).json({
            message: "Cancelled order deleted successfully",
            orderId: req.params.id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete order",
            error: error.message,
        });
    }
};

// Retry failed bank transfer payment
const retryOrderPayment = async (req, res) => {
    try {
        const { paymentReference } = req.body;
        const order = await Order.findById(req.params.id).populate("listing", "title");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await expireOrderIfTimedOut(order);

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to retry this payment" });
        }

        if (order.paymentMethod !== "BankTransfer") {
            return res.status(400).json({ message: "Only bank transfer payments can be retried" });
        }

        if (order.orderStatus !== "pending" || order.paymentStatus !== "failed") {
            return res.status(400).json({ message: "Only failed pending payments can be retried" });
        }

        if (!paymentReference && !req.file) {
            return res.status(400).json({ message: "Add a payment reference or upload a receipt screenshot" });
        }

        const paymentProofUrl = await uploadPaymentProof(req.file);

        order.paymentStatus = "pending";
        order.paymentReference = paymentReference || order.paymentReference;
        if (paymentProofUrl) {
            order.paymentProofUrl = paymentProofUrl;
        }
        order.paymentExpiresAt = getPaymentExpiryDate();
        order.expiredAt = undefined;
        await order.save();

        await createNotification({
            user: order.seller,
            type: "payment_updated",
            title: "Payment retry submitted",
            message: `A buyer resubmitted payment details for "${order.listing?.title || "your listing"}".`,
            relatedId: order._id,
            targetPath: "/sales",
        });

        await createNotification({
            user: order.user,
            type: "payment_updated",
            title: "Payment retry submitted",
            message: `Your payment retry for "${order.listing?.title || "this listing"}" is pending verification.`,
            relatedId: order._id,
            targetPath: "/orders",
        });

        res.status(200).json({
            message: "Payment retry submitted successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retry payment",
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
        const previousPaymentStatus = order.paymentStatus;

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
            const validPaymentStatuses = ["pending", "paid", "failed", "cancelled", "refunded", "expired"];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return res.status(400).json({ message: "Invalid payment status" });
            }
            order.paymentStatus = paymentStatus;
            if (paymentStatus === "paid" && !order.paidAt) {
                order.paidAt = new Date();
            }
            if (paymentStatus === "paid" && order.orderStatus === "pending") {
                order.orderStatus = "processing";
            }
            if (paymentStatus === "failed" && order.orderStatus !== "cancelled") {
                order.orderStatus = "pending";
            }
            if (paymentStatus === "expired") {
                order.orderStatus = "cancelled";
                order.expiredAt = new Date();
            }
            if (paymentStatus === "pending" && order.paymentMethod === "BankTransfer") {
                order.paymentExpiresAt = getPaymentExpiryDate();
            }
        }

        await order.save();

        if (previousOrderStatus !== "cancelled" && order.orderStatus === "cancelled") {
            await restoreListingQuantity(order);
        }

        if (orderStatus && previousOrderStatus !== order.orderStatus) {
            await createNotification({
                user: order.user,
                type: order.orderStatus === "cancelled" ? "order_cancelled" : "order_updated",
                title: "Order status updated",
                message: `Your order status changed to ${order.orderStatus}.`,
                relatedId: order._id,
            });
        }

        if (paymentStatus && previousPaymentStatus !== order.paymentStatus) {
            await createNotification({
                user: order.user,
                type: "payment_updated",
                title: "Payment status updated",
                message: `Your payment status changed to ${order.paymentStatus}.`,
                relatedId: order._id,
            });
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
    deleteUserCancelledOrder,
    retryOrderPayment,
    updateSellerOrderStatus,
};
