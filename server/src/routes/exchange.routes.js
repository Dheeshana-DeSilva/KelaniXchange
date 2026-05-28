const express = require("express");
const {
    createExchangeRequest,
    getSentExchangeRequests,
    getReceivedExchangeRequests,
    acceptExchangeRequest,
    completeExchangeRequest,
    rejectExchangeRequest,
    cancelExchangeRequest,
    deleteCompletedExchangeRequest,
} = require("../controllers/exchange.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createExchangeRequest);
router.get("/sent", protect, getSentExchangeRequests);
router.get("/received", protect, getReceivedExchangeRequests);
router.put("/:id/accept", protect, acceptExchangeRequest);
router.put("/:id/complete", protect, completeExchangeRequest);
router.put("/:id/reject", protect, rejectExchangeRequest);
router.put("/:id/cancel", protect, cancelExchangeRequest);
router.delete("/:id", protect, deleteCompletedExchangeRequest);

module.exports = router;
