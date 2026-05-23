const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
    {
        postType: {
            type: String,
            enum: ["lost", "found"],
            required: [true, "Post type is required"],
        },

        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "id-card",
                "wallet",
                "electronics",
                "books",
                "stationery",
                "keys",
                "bags",
                "clothing",
                "other",
            ],
        },

        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },

        date: {
            type: Date,
            required: [true, "Date is required"],
        },

        image: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open",
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const LostFound = mongoose.model("LostFound", lostFoundSchema);

module.exports = LostFound;