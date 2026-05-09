const express = require("express");
const {
    createListing,
    getListings,
    getListingById,
} = require("../controllers/listing.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createListing);
router.get("/", getListings);
router.get("/:id", getListingById);

module.exports = router;