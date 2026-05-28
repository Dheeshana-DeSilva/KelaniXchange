const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const ExchangeRequest = require("../models/ExchangeRequest");

const getSellerRatingSummary = async (sellerId) => {
    if (!sellerId || (typeof sellerId === "string" && !mongoose.Types.ObjectId.isValid(sellerId))) {
        return { averageRating: 0, totalReviews: 0 };
    }

    const sellerObjectId = typeof sellerId === "string" ? new mongoose.Types.ObjectId(sellerId) : sellerId;
    const [summary] = await Review.aggregate([
        { $match: { seller: sellerObjectId } },
        {
            $group: {
                _id: "$seller",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    return {
        averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
        totalReviews: summary?.totalReviews || 0,
    };
};

const createReview = async (req, res) => {
    try {
        const { transactionType, transactionId, rating } = req.body;
        const comment = String(req.body.comment || "");
        const parsedRating = Number(rating);

        if (!["order", "exchange"].includes(transactionType)) {
            return res.status(400).json({ message: "Invalid transaction type" });
        }

        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return res.status(400).json({ message: "Invalid transaction ID" });
        }

        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
        }

        if (comment.length > 500) {
            return res.status(400).json({ message: "Review comment must be 500 characters or less" });
        }

        let seller;
        let listing;

        if (transactionType === "order") {
            const order = await Order.findById(transactionId);
            if (!order) return res.status(404).json({ message: "Order not found" });
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "You can only review your own completed orders" });
            }
            if (order.orderStatus !== "delivered") {
                return res.status(400).json({ message: "Only completed orders can be reviewed" });
            }
            seller = order.seller;
            listing = order.listing;
        } else {
            const exchange = await ExchangeRequest.findById(transactionId);
            if (!exchange) return res.status(404).json({ message: "Exchange request not found" });
            if (exchange.requester.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Only the requester can review this exchange seller" });
            }
            if (exchange.status !== "completed") {
                return res.status(400).json({ message: "Only completed exchanges can be reviewed" });
            }
            seller = exchange.receiver;
            listing = exchange.requestedListing;
        }

        if (seller.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot review yourself" });
        }

        const review = await Review.create({
            reviewer: req.user._id,
            seller,
            listing,
            transactionType,
            transaction: transactionId,
            rating: parsedRating,
            comment: comment.trim(),
        });

        const populatedReview = await Review.findById(review._id)
            .populate("reviewer", "username fullName profileImage")
            .populate("listing", "title");

        res.status(201).json({
            message: "Review submitted successfully",
            review: populatedReview,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this transaction" });
        }

        res.status(500).json({
            message: "Failed to submit review",
            error: error.message,
        });
    }
};

const getSellerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ seller: req.params.sellerId })
            .populate("reviewer", "username fullName profileImage")
            .populate("listing", "title")
            .sort({ createdAt: -1 })
            .limit(30);

        res.status(200).json({
            message: "Seller reviews fetched successfully",
            summary: await getSellerRatingSummary(req.params.sellerId),
            reviews,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch seller reviews",
            error: error.message,
        });
    }
};

const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("reviewer", "username email fullName")
            .populate("seller", "username email fullName")
            .populate("listing", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Reviews fetched successfully",
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
};

const deleteReviewAdmin = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        await review.deleteOne();

        res.status(200).json({
            message: "Review deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete review",
            error: error.message,
        });
    }
};

module.exports = {
    createReview,
    deleteReviewAdmin,
    getAllReviewsAdmin,
    getSellerRatingSummary,
    getSellerReviews,
};
