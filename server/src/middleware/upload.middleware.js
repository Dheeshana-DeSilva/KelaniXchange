const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /jpeg|jpg|png|webp/;

        const extName = allowedExtensions.test(
            path.extname(file.originalname).toLowerCase()
        );

        const mimeType = file.mimetype.startsWith("image/");

        if (extName || mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    },
});

module.exports = upload;