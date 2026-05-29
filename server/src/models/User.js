const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["USER", "SELLER", "ADMIN"],
            default: "USER",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isSuspended: {
            type: Boolean,
            default: false,
        },

        accountStatus: {
            type: String,
            enum: ["active", "blocked", "deactivated"],
            default: "active",
        },

        profileImage: {
            type: String,
            default: "",
        },
        payoutDetails: {
            bankAccountName: {
                type: String,
                trim: true,
                default: "",
            },
            bankName: {
                type: String,
                trim: true,
                default: "",
            },
            bankBranch: {
                type: String,
                trim: true,
                default: "",
            },
            bankAccountNumber: {
                type: String,
                trim: true,
                default: "",
            },
        },

        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Listing",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
