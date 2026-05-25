const express = require("express");
const {
    getUserProfile,
    updateUserProfile,
    getSellerPaymentProfile,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("profileImage"), updateUserProfile);
router.get("/:id/payment-profile", protect, getSellerPaymentProfile);

module.exports = router;
