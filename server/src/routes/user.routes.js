const express = require("express");
const {
    getUserProfile,
    updateUserProfile,
    getSellerPaymentProfile,
    searchUsers,
    getPublicUserProfile,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("profileImage"), updateUserProfile);
router.get("/search", protect, searchUsers);
router.get("/:id/public", protect, getPublicUserProfile);
router.get("/:id/payment-profile", protect, getSellerPaymentProfile);

module.exports = router;
