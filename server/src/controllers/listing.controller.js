const Listing = require("../models/Listing");

// Create listing
const createListing = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            price,
            condition,
            isExchangeAvailable,
            location,
        } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, description, and category are required",
            });
        }

        const listing = await Listing.create({
            title,
            description,
            category,
            price,
            condition,
            isExchangeAvailable,
            location,
            seller: req.user._id,
        });

        res.status(201).json({
            message: "Listing created successfully",
            listing,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create listing",
            error: error.message,
        });
    }
};

// Get all listings
const getListings = async (req, res) => {
    try {
        const listings = await Listing.find({ status: "available" })
            .populate("seller", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(listings);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch listings",
            error: error.message,
        });
    }
};

// Get single listing
const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate(
            "seller",
            "username email"
        );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch listing",
            error: error.message,
        });
    }
};

module.exports = {
    createListing,
    getListings,
    getListingById,
};