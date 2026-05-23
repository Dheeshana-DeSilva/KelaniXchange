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
                "books-and-stationery",
                "electronics",
                "furniture",
                "fashion-and-accessories",
                "sports-and-outdoor",
                "vehicles",
                "others",
                "Books",
                "Calculators",
                "Electronics",
                "Notes",
                "Lab Equipment",
                "Stationery",
                "Other",
                "clothing",
                "sports",
                "books",
                "stationery"
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
            enum: ["available", "sold", "reserved", "removed", "pending", "active", "rejected", "hidden"],
            default: "available",
        },

        isFeatured: {
            type: Boolean,
            default: false,
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