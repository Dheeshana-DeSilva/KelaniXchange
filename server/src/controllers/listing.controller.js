const cloudinary = require("../config/cloudinary");
const Listing = require("../models/Listing");
const { getSellerRatingSummary } = require("./review.controller");

const parseQuantity = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const quantity = Number(value);
    return Number.isFinite(quantity) ? quantity : NaN;
};

const parseBoolean = (value) => {
    if (value === undefined) return undefined;
    if (typeof value === "boolean") return value;
    return value === "true";
};

const uploadListingImages = async (files = []) => {
    if (!files.length) return [];

    const uploadPromises = files.map((file) => {
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

    return Promise.all(uploadPromises);
};

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
            quantity,
            condition,
            isExchangeAvailable,
            location,
        } = req.body || {};

        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, description, and category are required",
            });
        }

        const parsedQuantity = parseQuantity(quantity);
        if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        const imageUrls = await uploadListingImages(req.files || []);

        const listing = await Listing.create({
            title,
            description,
            category,
            price,
            quantity: parsedQuantity,
            condition,
            isExchangeAvailable: parseBoolean(isExchangeAvailable) || false,
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

// Get all listings with search and filters
const getListings = async (req, res) => {
    try {
        const {
            search,
            category,
            condition,
            minPrice,
            maxPrice,
            exchangeAvailable,
            page = 1,
            limit = 8,
            sort,
        } = req.query;

        const filter = {
            status: "available",
        };

        // Search by title or description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by category
        if (category) {
            filter.category = category;
        }

        // Filter by condition
        if (condition) {
            filter.condition = condition;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Filter exchange availability
        if (exchangeAvailable !== undefined) {
            filter.isExchangeAvailable = exchangeAvailable === "true";
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(48, Math.max(1, Number(limit) || 8));
        const skip = (currentPage - 1) * pageSize;
        const sortOption = {};

        if (sort === "price") {
            sortOption.price = 1;
        } else if (sort === "-price") {
            sortOption.price = -1;
        } else if (sort === "createdAt") {
            sortOption.createdAt = 1;
        } else {
            sortOption.createdAt = -1;
        }

        const total = await Listing.countDocuments(filter);
        const listings = await Listing.find(filter)
            .populate("seller", "username")
            .sort(sortOption)
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            message: "Listings fetched successfully",
            count: listings.length,
            total,
            page: currentPage,
            pages: Math.max(1, Math.ceil(total / pageSize)),
            listings,
        });
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
            "username"
        );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        const listingData = listing.toObject();
        if (listing.seller?._id) {
            listingData.seller = {
                ...listingData.seller,
                ratingSummary: await getSellerRatingSummary(listing.seller._id),
            };
        }

        res.status(200).json(listingData);
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
            quantity,
            condition,
            isExchangeAvailable,
            location,
            status,
            existingImages,
        } = req.body;

        const parsedQuantity = parseQuantity(quantity);
        if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        if (title !== undefined) listing.title = title;
        if (description !== undefined) listing.description = description;
        if (category !== undefined) listing.category = category;
        if (price !== undefined) listing.price = price;
        if (parsedQuantity !== undefined) listing.quantity = parsedQuantity;
        if (condition !== undefined) listing.condition = condition;
        if (isExchangeAvailable !== undefined) {
            listing.isExchangeAvailable = parseBoolean(isExchangeAvailable);
        }
        if (location !== undefined) listing.location = location;
        if (status !== undefined) listing.status = status;
        if (existingImages !== undefined || (req.files && req.files.length > 0)) {
            let keptImages = listing.images || [];

            if (existingImages !== undefined) {
                try {
                    const parsedImages = typeof existingImages === "string"
                        ? JSON.parse(existingImages)
                        : existingImages;

                    keptImages = Array.isArray(parsedImages)
                        ? parsedImages.filter((url) => typeof url === "string" && url.trim())
                        : [];
                } catch {
                    return res.status(400).json({
                        message: "Invalid existing images payload",
                    });
                }
            }

            const newImages = await uploadListingImages(req.files || []);
            const nextImages = [...keptImages, ...newImages];

            if (nextImages.length > 5) {
                return res.status(400).json({
                    message: "You can upload a maximum of 5 images.",
                });
            }

            listing.images = nextImages;
        }

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

// Get logged-in user's own listings
const getMyListings = async (req, res) => {
    try {
        const listings = await Listing.find({
            seller: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "My listings fetched successfully",
            listings,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your listings",
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
    getMyListings,
};
