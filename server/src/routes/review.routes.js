const express = require("express");
const {
    createReview,
    getSellerReviews,
} = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/seller/:sellerId", getSellerReviews);

module.exports = router;
