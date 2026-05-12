const User = require("../models/User");
const Listing = require("../models/Listing");
const Report = require("../models/Report");
const ExchangeRequest = require("../models/ExchangeRequest");

// Admin dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = await Listing.countDocuments();
        const availableListings = await Listing.countDocuments({
            status: "available",
        });
        const removedListings = await Listing.countDocuments({
            status: "removed",
        });
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({
            status: "pending",
        });
        const totalExchangeRequests = await ExchangeRequest.countDocuments();

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            stats: {
                totalUsers,
                totalListings,
                availableListings,
                removedListings,
                totalReports,
                pendingReports,
                totalExchangeRequests,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard statistics",
            error: error.message,
        });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Users fetched successfully",
            count: users.length,
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

// Suspend user
const suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.role === "ADMIN") {
            return res.status(400).json({
                message: "Admin accounts cannot be suspended",
            });
        }

        user.isSuspended = true;
        await user.save();

        res.status(200).json({
            message: "User suspended successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isSuspended: user.isSuspended,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to suspend user",
            error: error.message,
        });
    }
};

// Unsuspend user
const unsuspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isSuspended = false;
        await user.save();

        res.status(200).json({
            message: "User unsuspended successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isSuspended: user.isSuspended,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to unsuspend user",
            error: error.message,
        });
    }
};

// Get all listings for admin
const getAllListingsAdmin = async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate("seller", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All listings fetched successfully",
            count: listings.length,
            listings,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch listings",
            error: error.message,
        });
    }
};

// Remove listing by changing status
const removeListingAdmin = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        listing.status = "removed";
        await listing.save();

        res.status(200).json({
            message: "Listing removed successfully",
            listing,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove listing",
            error: error.message,
        });
    }
};

// Get all reports
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reportedListing", "title category price status")
            .populate("reportedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Reports fetched successfully",
            count: reports.length,
            reports,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reports",
            error: error.message,
        });
    }
};

// Update report status
const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "reviewed", "resolved"].includes(status)) {
            return res.status(400).json({
                message: "Invalid report status",
            });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        report.status = status;
        await report.save();

        res.status(200).json({
            message: "Report status updated successfully",
            report,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update report status",
            error: error.message,
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    suspendUser,
    unsuspendUser,
    getAllListingsAdmin,
    removeListingAdmin,
    getAllReports,
    updateReportStatus,
};