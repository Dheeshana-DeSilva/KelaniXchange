const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "exchange_request",
                "exchange_accepted",
                "exchange_rejected",
                "chat_message",
                "order_placed",
                "order_received",
                "order_updated",
                "order_cancelled",
                "payment_updated",
                "system",
                "payment",
                "order",
                "listing",
                "report",
                "lost_found",
                "warning",
                "role_update",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        targetPath: {
            type: String,
            trim: true,
        },

        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        targetLabel: {
            type: String,
            trim: true,
            default: "",
        },

        adminBatchId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        isAdminCreated: {
            type: Boolean,
            default: false,
        },

        isImportant: {
            type: Boolean,
            default: false,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", notificationSchema);
