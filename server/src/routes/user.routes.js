const express = require("express");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Profile fetched successfully",
        user: req.user,
    });
});

module.exports = router;