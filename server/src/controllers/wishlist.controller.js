const User = require("../models/User");
const Listing = require("../models/Listing");

// Add listing to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;

        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        const user = await User.findById(req.user._id);

        const alreadySaved = user.wishlist.some(
            (itemId) => itemId.toString() === listingId
        );

        if (alreadySaved) {
            return res.status(400).json({
                message: "Listing is already in your wishlist",
            });
        }

        user.wishlist.push(listingId);
        await user.save();

        res.status(200).json({
            message: "Listing added to wishlist successfully",
            wishlist: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add listing to wishlist",
            error: error.message,
        });
    }
};

// Get logged-in user's wishlist
const getMyWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: "wishlist",
            populate: {
                path: "seller",
                select: "username",
            },
        });

        const wishlist = user.wishlist.filter(Boolean);

        res.status(200).json({
            message: "Wishlist fetched successfully",
            count: wishlist.length,
            wishlist,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch wishlist",
            error: error.message,
        });
    }
};

// Remove listing from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;

        const user = await User.findById(req.user._id);

        const isSaved = user.wishlist.some(
            (itemId) => itemId.toString() === listingId
        );

        if (!isSaved) {
            return res.status(404).json({
                message: "Listing is not in your wishlist",
            });
        }

        user.wishlist = user.wishlist.filter(
            (itemId) => itemId.toString() !== listingId
        );

        await user.save();

        res.status(200).json({
            message: "Listing removed from wishlist successfully",
            wishlist: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove listing from wishlist",
            error: error.message,
        });
    }
};

module.exports = {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
};
