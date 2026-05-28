const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["PayPal", "PayHere", "Card", "Cash", "BankTransfer"],
            default: "Cash",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "cancelled", "refunded", "expired"],
            default: "pending",
        },
        meetupLocation: {
            type: String,
            trim: true,
            default: "University of Kelaniya - Main Campus",
        },
        phone: {
            type: String,
            trim: true,
        },
        note: {
            type: String,
            trim: true,
        },
        transactionId: {
            type: String,
        },
        paymentGroupId: {
            type: String,
            index: true,
        },
        gatewayResponse: {
            type: Object,
        },
        paymentReference: {
            type: String,
            trim: true,
        },
        paymentProofUrl: {
            type: String,
            trim: true,
        },
        paidAt: {
            type: Date,
        },
        paymentExpiresAt: {
            type: Date,
        },
        expiredAt: {
            type: Date,
        },
        orderStatus: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        hiddenFromBuyer: {
            type: Boolean,
            default: false,
        },
        hiddenFromSeller: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);
