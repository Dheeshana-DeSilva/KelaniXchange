const cloudinary = require("../config/cloudinary");
const Listing = require("../models/Listing");

// Create listing
const createListing = async (req, res) => {
    try {
        console.log("CONTENT TYPE:", req.headers["content-type"]);
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);
        const {
            title,
            description,
            category,
            price,
            condition,
            isExchangeAvailable,
            location,
        } = req.body || {};

        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, description, and category are required",
            });
        }

        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: "kelanixchange/listings",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.secure_url);
                            }
                        }
                    );

                    uploadStream.end(file.buffer);
                });
            });

            imageUrls = await Promise.all(uploadPromises);
        }

        const listing = await Listing.create({
            title,
            description,
            category,
            price,
            condition,
            isExchangeAvailable,
            location,
            images: imageUrls,
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

// Update own listing
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        // Check whether logged-in user owns this listing
        if (listing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this listing",
            });
        }

        const {
            title,
            description,
            category,
            price,
            condition,
            isExchangeAvailable,
            location,
            status,
        } = req.body;

        if (title !== undefined) listing.title = title;
        if (description !== undefined) listing.description = description;
        if (category !== undefined) listing.category = category;
        if (price !== undefined) listing.price = price;
        if (condition !== undefined) listing.condition = condition;
        if (isExchangeAvailable !== undefined) {
            listing.isExchangeAvailable = isExchangeAvailable;
        }
        if (location !== undefined) listing.location = location;
        if (status !== undefined) listing.status = status;

        const updatedListing = await listing.save();

        res.status(200).json({
            message: "Listing updated successfully",
            listing: updatedListing,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update listing",
            error: error.message,
        });
    }
};

// Delete own listing
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        // Only the owner can delete the listing
        if (listing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this listing",
            });
        }

        await listing.deleteOne();

        res.status(200).json({
            message: "Listing deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete listing",
            error: error.message,
        });
    }
};

module.exports = {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
};