const ExchangeRequest = require("../models/ExchangeRequest");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");

// Send exchange request
const createExchangeRequest = async (req, res) => {
    try {
        const { requestedListingId, offeredListingId, message } = req.body;

        if (!requestedListingId || !offeredListingId) {
            return res.status(400).json({
                message: "Requested listing and offered listing are required",
            });
        }

        const requestedListing = await Listing.findById(requestedListingId);
        const offeredListing = await Listing.findById(offeredListingId);

        if (!requestedListing) {
            return res.status(404).json({
                message: "Requested listing not found",
            });
        }

        if (!offeredListing) {
            return res.status(404).json({
                message: "Offered listing not found",
            });
        }

        // Requested listing must allow exchange
        if (!requestedListing.isExchangeAvailable) {
            return res.status(400).json({
                message: "This listing does not accept exchange offers",
            });
        }

        // Buyer cannot exchange with their own item
        if (requestedListing.seller.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot request an exchange for your own listing",
            });
        }

        // Offered listing must belong to logged-in user
        if (offeredListing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only offer your own listing",
            });
        }

        // Both listings should be available
        const exchangeableStatuses = ["available", "active"];
        if (
            !exchangeableStatuses.includes(requestedListing.status) ||
            !exchangeableStatuses.includes(offeredListing.status)
        ) {
            return res.status(400).json({
                message: "Both listings must be available for exchange",
            });
        }

        // Prevent duplicate pending request
        const existingRequest = await ExchangeRequest.findOne({
            requestedListing: requestedListingId,
            offeredListing: offeredListingId,
            requester: req.user._id,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "A pending exchange request already exists",
            });
        }

        const exchangeRequest = await ExchangeRequest.create({
            requestedListing: requestedListingId,
            offeredListing: offeredListingId,
            requester: req.user._id,
            receiver: requestedListing.seller,
            message,
        });

        await Notification.create({
            user: requestedListing.seller,
            type: "exchange_request",
            title: "New exchange request",
            message: `${req.user.username} sent an exchange request for your listing.`,
            relatedId: exchangeRequest._id,
        });

        const populatedRequest = await ExchangeRequest.findById(
            exchangeRequest._id
        )
            .populate("requestedListing", "title price images")
            .populate("offeredListing", "title price images")
            .populate("requester", "username email")
            .populate("receiver", "username email");

        res.status(201).json({
            message: "Exchange request sent successfully",
            exchangeRequest: populatedRequest,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create exchange request",
            error: error.message,
        });
    }
};

// Get requests sent by logged-in user
const getSentExchangeRequests = async (req, res) => {
    try {
        const requests = await ExchangeRequest.find({
            requester: req.user._id,
        })
            .populate("requestedListing", "title price images")
            .populate("offeredListing", "title price images")
            .populate("receiver", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Sent exchange requests fetched successfully",
            requests,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch sent exchange requests",
            error: error.message,
        });
    }
};

// Get requests received by logged-in user
const getReceivedExchangeRequests = async (req, res) => {
    try {
        const requests = await ExchangeRequest.find({
            receiver: req.user._id,
        })
            .populate("requestedListing", "title price images")
            .populate("offeredListing", "title price images")
            .populate("requester", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Received exchange requests fetched successfully",
            requests,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch received exchange requests",
            error: error.message,
        });
    }
};

// Accept exchange request
const acceptExchangeRequest = async (req, res) => {
    try {
        const request = await ExchangeRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Exchange request not found",
            });
        }

        if (request.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to accept this request",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: "Only pending requests can be accepted",
            });
        }

        request.status = "accepted";
        await request.save();

        await Notification.create({
            user: request.requester,
            type: "exchange_accepted",
            title: "Exchange request accepted",
            message: "Your exchange request has been accepted.",
            relatedId: request._id,
        });

        // Mark both listings as reserved
        await Listing.findByIdAndUpdate(request.requestedListing, {
            status: "reserved",
        });

        await Listing.findByIdAndUpdate(request.offeredListing, {
            status: "reserved",
        });

        res.status(200).json({
            message: "Exchange request accepted successfully",
            request,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to accept exchange request",
            error: error.message,
        });
    }
};

// Reject exchange request
const rejectExchangeRequest = async (req, res) => {
    try {
        const request = await ExchangeRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Exchange request not found",
            });
        }

        if (request.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to reject this request",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: "Only pending requests can be rejected",
            });
        }

        request.status = "rejected";
        await request.save();

        await Notification.create({
            user: request.requester,
            type: "exchange_rejected",
            title: "Exchange request rejected",
            message: "Your exchange request has been rejected.",
            relatedId: request._id,
        });

        res.status(200).json({
            message: "Exchange request rejected successfully",
            request,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reject exchange request",
            error: error.message,
        });
    }
};

// Cancel own exchange request
const cancelExchangeRequest = async (req, res) => {
    try {
        const request = await ExchangeRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Exchange request not found",
            });
        }

        if (request.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to cancel this request",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: "Only pending requests can be cancelled",
            });
        }

        request.status = "cancelled";
        await request.save();

        res.status(200).json({
            message: "Exchange request cancelled successfully",
            request,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel exchange request",
            error: error.message,
        });
    }
};

module.exports = {
    createExchangeRequest,
    getSentExchangeRequests,
    getReceivedExchangeRequests,
    acceptExchangeRequest,
    rejectExchangeRequest,
    cancelExchangeRequest,
};
