const express = require("express");
const {
    createListing,
    getListings,
    getListingById,
} = require("../controllers/listing.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/", protect, upload.array("images", 5), createListing);
router.get("/", getListings);
router.get("/:id", getListingById);

module.exports = router;