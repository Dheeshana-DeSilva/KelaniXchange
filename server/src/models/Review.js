const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
        },
        transactionType: {
            type: String,
            enum: ["order", "exchange"],
            required: true,
        },
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.index(
    { reviewer: 1, transactionType: 1, transaction: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
