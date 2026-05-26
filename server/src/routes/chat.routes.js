const express = require("express");
const {
    startChat,
    getMyChats,
    getUnreadMessageCount,
    getChatMessages,
    markChatAsRead,
    sendMessage,
    deleteChatForUser,
} = require("../controllers/chat.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/start", protect, startChat);
router.get("/", protect, getMyChats);
router.get("/unread-count", protect, getUnreadMessageCount);
router.get("/:chatId/messages", protect, getChatMessages);
router.put("/:chatId/read", protect, markChatAsRead);
router.post("/:chatId/messages", protect, sendMessage);
router.delete("/:chatId", protect, deleteChatForUser);

module.exports = router;
