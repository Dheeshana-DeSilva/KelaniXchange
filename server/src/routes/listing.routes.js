const express = require("express");
const {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
} = require("../controllers/listing.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/", protect, upload.array("images", 5), createListing);
router.get("/", getListings);
router.get("/:id", getListingById);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

module.exports = router;