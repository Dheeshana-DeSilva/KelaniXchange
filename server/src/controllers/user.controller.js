const User = require("../models/User");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const { getSellerRatingSummary } = require("./review.controller");
const cloudinary = require("../config/cloudinary");

const buildPublicPaymentProfile = (user) => ({
    sellerId: user._id,
    sellerName: user.fullName || user.username,
    username: user.username,
    profileImage: user.profileImage || "",
    payoutDetails: {
        bankAccountName: user.payoutDetails?.bankAccountName || "",
        bankName: user.payoutDetails?.bankName || "",
        bankBranch: user.payoutDetails?.bankBranch || "",
        bankAccountNumber: user.payoutDetails?.bankAccountNumber || "",
    },
});

const buildPrivateProfile = (user) => ({
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    profileImage: user.profileImage || "",
    isVerified: user.isVerified,
    isSuspended: user.isSuspended,
    payoutDetails: {
        bankAccountName: user.payoutDetails?.bankAccountName || "",
        bankName: user.payoutDetails?.bankName || "",
        bankBranch: user.payoutDetails?.bankBranch || "",
        bankAccountNumber: user.payoutDetails?.bankAccountNumber || "",
    },
});

const buildPublicUserProfile = (user) => ({
    id: user._id,
    username: user.username,
    profileImage: user.profileImage || "",
    isVerified: user.isVerified,
    createdAt: user.createdAt,
});

const buildSearchUserResult = (user) => ({
    id: user._id,
    username: user.username,
    profileImage: user.profileImage || "",
    isVerified: user.isVerified,
});

const uploadProfileImage = async (file) => {
    if (!file) return "";

    const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "kelanixchange/profile-images",
                resource_type: "image",
                transformation: [
                    { width: 400, height: 400, crop: "fill", gravity: "face" },
                    { quality: "auto", fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(file.buffer);
    });

    return uploadResult.secure_url;
};

// Get logged-in user's profile
const getUserProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: "Profile fetched successfully",
            user: buildPrivateProfile(req.user),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};

// Update logged-in user's profile
const updateUserProfile = async (req, res) => {
    try {
        const {
            fullName,
            username,
            phone,
            payoutDetails: rawPayoutDetails = {},
        } = req.body;
        const cleanPhone = typeof phone === "string" ? phone.replace(/\s+/g, "") : undefined;
        const isValidPhone = cleanPhone === undefined || /^(?:0\d{9}|\+94\d{9})$/.test(cleanPhone);
        const payoutDetails = typeof rawPayoutDetails === "string"
            ? JSON.parse(rawPayoutDetails)
            : rawPayoutDetails;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Check whether new username is already taken
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });

            if (existingUsername) {
                return res.status(400).json({
                    message: "Username already taken",
                });
            }

            user.username = username;
        }

        if (!isValidPhone) {
            return res.status(400).json({
                message: "Enter a valid phone number",
            });
        }

        if (cleanPhone !== undefined) {
            user.phone = cleanPhone;
        }

        if (fullName) {
            user.fullName = fullName;
        }

        if (req.file) {
            user.profileImage = await uploadProfileImage(req.file);
        }

        user.payoutDetails = {
            ...user.payoutDetails,
            bankAccountName: payoutDetails.bankAccountName ?? user.payoutDetails?.bankAccountName ?? "",
            bankName: payoutDetails.bankName ?? user.payoutDetails?.bankName ?? "",
            bankBranch: payoutDetails.bankBranch ?? user.payoutDetails?.bankBranch ?? "",
            bankAccountNumber: payoutDetails.bankAccountNumber ?? user.payoutDetails?.bankAccountNumber ?? "",
        };

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: buildPrivateProfile(updatedUser),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

const getSellerPaymentProfile = async (req, res) => {
    try {
        const seller = await User.findById(req.params.id).select("fullName username payoutDetails");

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.status(200).json({
            message: "Seller payment profile fetched successfully",
            seller: buildPublicPaymentProfile(seller),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch seller payment profile",
            error: error.message,
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const search = (req.query.search || "").trim();

        if (search.length < 2) {
            return res.status(200).json({
                message: "Users fetched successfully",
                users: [],
            });
        }

        const users = await User.find({
            role: { $in: ["USER", "SELLER"] },
            accountStatus: { $ne: "blocked" },
            username: { $regex: search, $options: "i" },
        })
            .select("username profileImage isVerified")
            .limit(20)
            .sort({ username: 1 });

        res.status(200).json({
            message: "Users fetched successfully",
            users: users.map(buildSearchUserResult),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to search users",
            error: error.message,
        });
    }
};

const getPublicUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("username profileImage isVerified createdAt role accountStatus");

        if (!user || !["USER", "SELLER"].includes(user.role) || user.accountStatus === "blocked") {
            return res.status(404).json({ message: "User not found" });
        }

        const listings = await Listing.find({
            seller: user._id,
            status: { $in: ["available", "active"] },
        }).sort({ createdAt: -1 });

        const reviews = await Review.find({ seller: user._id })
            .populate("reviewer", "username profileImage")
            .populate("listing", "title")
            .sort({ createdAt: -1 })
            .limit(12);

        res.status(200).json({
            message: "User profile fetched successfully",
            user: {
                ...buildPublicUserProfile(user),
                ratingSummary: await getSellerRatingSummary(user._id),
            },
            listings,
            reviews,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user profile",
            error: error.message,
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getSellerPaymentProfile,
    searchUsers,
    getPublicUserProfile,
};
