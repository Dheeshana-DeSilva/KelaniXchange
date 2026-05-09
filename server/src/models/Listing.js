const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Books",
                "Calculators",
                "Electronics",
                "Notes",
                "Lab Equipment",
                "Stationery",
                "Other",
            ],
        },

        price: {
            type: Number,
            default: 0,
        },

        condition: {
            type: String,
            enum: ["New", "Like New", "Good", "Used"],
            default: "Good",
        },

        images: [
            {
                type: String,
            },
        ],

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isExchangeAvailable: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["available", "sold", "reserved", "removed"],
            default: "available",
        },

        location: {
            type: String,
            default: "University of Kelaniya",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Listing", listingSchema);