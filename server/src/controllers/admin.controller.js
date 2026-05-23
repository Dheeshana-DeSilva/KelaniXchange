const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Report = require("../models/Report");
const ExchangeRequest = require("../models/ExchangeRequest");
const LostFound = require("../models/LostFound");

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

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["USER", "ADMIN"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be USER or ADMIN." });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent self-role demotion if needed (optional safety)
        if (user._id.toString() === req.user._id.toString() && role !== "ADMIN") {
            return res.status(400).json({ message: "You cannot change your own admin role" });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: "User role updated successfully",
            user: { id: user._id, username: user.username, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user role", error: error.message });
    }
};

// Update user account status (active / blocked / deactivated)
const updateUserStatus = async (req, res) => {
    try {
        const { accountStatus } = req.body;

        if (!["active", "blocked", "deactivated"].includes(accountStatus)) {
            return res.status(400).json({ message: "Invalid account status" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "ADMIN") {
            return res.status(400).json({ message: "Admin accounts cannot be modified this way" });
        }

        user.accountStatus = accountStatus;
        // Keep isSuspended in sync for blocked accounts
        user.isSuspended = accountStatus !== "active";
        await user.save();

        res.status(200).json({
            message: `User ${accountStatus} successfully`,
            user: { id: user._id, username: user.username, accountStatus: user.accountStatus },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user status", error: error.message });
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

// Add User
const addUser = async (req, res) => {
    try {
        const { fullName, username, email, password, role } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            role: role || "USER",
        });

        res.status(201).json({
            message: "User added successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to add user", error: error.message });
    }
};

// Delete User completely
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "ADMIN") {
            return res.status(400).json({ message: "Admin accounts cannot be deleted" });
        }

        // Delete user
        await User.findByIdAndDelete(req.params.id);
        
        // Optional: remove their listings
        await Listing.deleteMany({ seller: req.params.id });

        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};

// Update listing details (Moderation/Edit)
const updateListingAdmin = async (req, res) => {
    try {
        const { title, description, category, price, condition, location, status, isFeatured, isExchangeAvailable } = req.body;
        
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (title !== undefined) listing.title = title;
        if (description !== undefined) listing.description = description;
        if (category !== undefined) listing.category = category;
        if (price !== undefined) listing.price = price;
        if (condition !== undefined) listing.condition = condition;
        if (location !== undefined) listing.location = location;
        if (status !== undefined) listing.status = status;
        if (isFeatured !== undefined) listing.isFeatured = isFeatured;
        if (isExchangeAvailable !== undefined) listing.isExchangeAvailable = isExchangeAvailable;

        await listing.save();

        res.status(200).json({
            message: "Listing updated successfully",
            listing,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update listing",
            error: error.message,
        });
    }
};

// Delete listing completely
const deleteListingAdmin = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        await Listing.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Listing deleted completely",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete listing",
            error: error.message,
        });
    }
};

// Get all lost and found posts for admin
const getAllLostFoundAdmin = async (req, res) => {
    try {
        const posts = await LostFound.find()
            .populate("postedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All Lost & Found posts fetched successfully",
            count: posts.length,
            posts,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch Lost & Found posts",
            error: error.message,
        });
    }
};

// Update Lost & Found post status (open / resolved)
const updateLostFoundStatusAdmin = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["open", "resolved"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'open' or 'resolved'."
            });
        }

        const post = await LostFound.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "Lost & Found post not found"
            });
        }

        post.status = status;
        await post.save();

        res.status(200).json({
            message: `Lost & Found post marked as ${status} successfully`,
            post,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update post status",
            error: error.message,
        });
    }
};

// Delete Lost & Found post completely
const deleteLostFoundAdmin = async (req, res) => {
    try {
        const post = await LostFound.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "Lost & Found post not found"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Lost & Found post deleted successfully by admin"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete post",
            error: error.message,
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    suspendUser,
    unsuspendUser,
    updateUserRole,
    updateUserStatus,
    getAllListingsAdmin,
    removeListingAdmin,
    updateListingAdmin,
    deleteListingAdmin,
    getAllReports,
    updateReportStatus,
    addUser,
    deleteUser,
    getAllLostFoundAdmin,
    updateLostFoundStatusAdmin,
    deleteLostFoundAdmin,
};