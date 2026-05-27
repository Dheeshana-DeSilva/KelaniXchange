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
