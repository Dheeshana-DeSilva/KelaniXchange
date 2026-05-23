const express = require("express");
const {
    createLostFoundPost,
    getLostFoundPosts,
    getLostFoundPostById,
    getMyLostFoundPosts,
    markLostFoundPostResolved,
    deleteLostFoundPost
} = require("../controllers/lostFoundController");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Routes
router.post("/", protect, upload.single("image"), createLostFoundPost);
router.get("/", getLostFoundPosts);

// Support both /my-posts and /user/my-posts for frontend compatibility
router.get("/my-posts", protect, getMyLostFoundPosts);
router.get("/user/my-posts", protect, getMyLostFoundPosts);

router.get("/:id", getLostFoundPostById);
router.patch("/:id/resolve", protect, markLostFoundPostResolved);
router.delete("/:id", protect, deleteLostFoundPost);

module.exports = router;