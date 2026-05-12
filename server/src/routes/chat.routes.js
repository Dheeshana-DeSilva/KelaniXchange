const express = require("express");
const {
    startChat,
    getMyChats,
    getChatMessages,
    sendMessage,
} = require("../controllers/chat.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/start", protect, startChat);
router.get("/", protect, getMyChats);
router.get("/:chatId/messages", protect, getChatMessages);
router.post("/:chatId/messages", protect, sendMessage);

module.exports = router;