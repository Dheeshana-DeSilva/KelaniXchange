const Notification = require("../models/Notification");

// Get logged-in user's notifications
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false,
        });

        res.status(200).json({
            message: "Notifications fetched successfully",
            unreadCount,
            notifications,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }
};

// Mark one notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this notification",
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to mark notification as read",
            error: error.message,
        });
    }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                user: req.user._id,
                isRead: false,
            },
            {
                isRead: true,
            }
        );

        res.status(200).json({
            message: "All notifications marked as read",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to mark notifications as read",
            error: error.message,
        });
    }
};

// Delete one notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this notification",
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            message: "Notification deleted successfully",
            notificationId: req.params.id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete notification",
            error: error.message,
        });
    }
};

// Delete all notifications for logged-in user
const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({
            user: req.user._id,
        });

        res.status(200).json({
            message: "Notifications deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete notifications",
            error: error.message,
        });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
};
