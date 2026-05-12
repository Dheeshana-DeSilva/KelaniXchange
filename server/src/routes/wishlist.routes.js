const express = require("express");
const {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
} = require("../controllers/wishlist.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getMyWishlist);
router.post("/:listingId", protect, addToWishlist);
router.delete("/:listingId", protect, removeFromWishlist);

module.exports = router;