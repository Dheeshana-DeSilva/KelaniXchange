const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reportedListing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reason: {
            type: String,
            required: true,
            enum: [
                "Fake item",
                "Wrong category",
                "Inappropriate content",
                "Spam",
                "Scam suspicion",
                "Other",
            ],
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Report", reportSchema);