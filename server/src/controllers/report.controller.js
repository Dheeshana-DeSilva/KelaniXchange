const Report = require("../models/Report");
const Listing = require("../models/Listing");

// Create report for a listing
const createReport = async (req, res) => {
    try {
        const { listingId, reason, description } = req.body;

        if (!listingId || !reason) {
            return res.status(400).json({
                message: "Listing ID and reason are required",
            });
        }

        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found",
            });
        }

        // Prevent user from reporting own listing
        if (listing.seller.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot report your own listing",
            });
        }

        // Prevent duplicate pending report by same user for same listing
        const existingReport = await Report.findOne({
            reportedListing: listingId,
            reportedBy: req.user._id,
            status: "pending",
        });

        if (existingReport) {
            return res.status(400).json({
                message: "You already have a pending report for this listing",
            });
        }

        const report = await Report.create({
            reportedListing: listingId,
            reportedBy: req.user._id,
            reason,
            description,
        });

        const populatedReport = await Report.findById(report._id)
            .populate("reportedListing", "title category price")
            .populate("reportedBy", "username email");

        res.status(201).json({
            message: "Report submitted successfully",
            report: populatedReport,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to submit report",
            error: error.message,
        });
    }
};

// Get user's own submitted reports
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({
            reportedBy: req.user._id,
        })
            .populate("reportedListing", "title category price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Your reports fetched successfully",
            reports,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your reports",
            error: error.message,
        });
    }
};

module.exports = {
    createReport,
    getMyReports,
};