const User = require("../models/User");

// Get logged-in user's profile
const getUserProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: "Profile fetched successfully",
            user: req.user,
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
        const { fullName, username } = req.body;

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

        if (fullName) {
            user.fullName = fullName;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified,
                isSuspended: updatedUser.isSuspended,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
};