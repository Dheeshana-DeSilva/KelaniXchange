import LostFound from "../models/LostFound.js";
import cloudinary from "../config/cloudinary.js";

/**
 * CREATE LOST / FOUND POST
 * POST /api/lost-found
 */
export const createLostFoundPost = async (req, res) => {
    try {
        const {
            postType,
            title,
            description,
            category,
            location,
            date,
        } = req.body;

        if (
            !postType ||
            !title ||
            !description ||
            !category ||
            !location ||
            !date
        ) {
            return res.status(400).json({
                message: "All required fields must be filled.",
            });
        }

        let imageUrl = "";

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "kelanixchange/lost-found",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                stream.end(req.file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        const post = await LostFound.create({
            postType,
            title,
            description,
            category,
            location,
            date,
            image: imageUrl,
            postedBy: req.user._id,
        });

        res.status(201).json({
            message: "Lost & Found post created successfully.",
            post,
        });
    } catch (error) {
        console.error("Create Lost & Found Error:", error);
        res.status(500).json({
            message: "Server error while creating post.",
        });
    }
};

/**
 * GET ALL POSTS
 * GET /api/lost-found
 */
export const getLostFoundPosts = async (req, res) => {
    try {
        const { type, category, search, status } = req.query;

        const filter = {};

        if (type && ["lost", "found"].includes(type)) {
            filter.postType = type;
        }

        if (category) {
            filter.category = category;
        }

        if (status && ["open", "resolved"].includes(status)) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        const posts = await LostFound.find(filter)
            .populate("postedBy", "username")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Get Lost & Found Posts Error:", error);
        res.status(500).json({
            message: "Server error while fetching posts.",
        });
    }
};

/**
 * GET SINGLE POST
 * GET /api/lost-found/:id
 */
export const getLostFoundPostById = async (req, res) => {
    try {
        const post = await LostFound.findById(req.params.id).populate(
            "postedBy",
            "username"
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Get Lost & Found Post Error:", error);
        res.status(500).json({
            message: "Server error while fetching post.",
        });
    }
};

/**
 * GET MY POSTS
 * GET /api/lost-found/my-posts
 */
export const getMyLostFoundPosts = async (req, res) => {
    try {
        const posts = await LostFound.find({
            postedBy: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Get My Lost & Found Posts Error:", error);
        res.status(500).json({
            message: "Server error while fetching your posts.",
        });
    }
};

/**
 * MARK POST AS RESOLVED
 * PATCH /api/lost-found/:id/resolve
 */
export const markLostFoundPostResolved = async (req, res) => {
    try {
        const post = await LostFound.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not allowed to update this post.",
            });
        }

        post.status = "resolved";
        await post.save();

        res.status(200).json({
            message: "Post marked as resolved.",
            post,
        });
    } catch (error) {
        console.error("Resolve Lost & Found Post Error:", error);
        res.status(500).json({
            message: "Server error while updating post.",
        });
    }
};

/**
 * DELETE POST
 * DELETE /api/lost-found/:id
 */
export const deleteLostFoundPost = async (req, res) => {
    try {
        const post = await LostFound.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not allowed to delete this post.",
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Lost & Found Post Error:", error);
        res.status(500).json({
            message: "Server error while deleting post.",
        });
    }
};