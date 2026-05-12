const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

// Start or get existing chat
const startChat = async (req, res) => {
    try {
        const { recipientId, listingId } = req.body;

        if (!recipientId) {
            return res.status(400).json({
                message: "Recipient ID is required",
            });
        }

        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot start a chat with yourself",
            });
        }

        const recipient = await User.findById(recipientId);

        if (!recipient) {
            return res.status(404).json({
                message: "Recipient user not found",
            });
        }

        if (listingId) {
            const listing = await Listing.findById(listingId);

            if (!listing) {
                return res.status(404).json({
                    message: "Listing not found",
                });
            }
        }

        let chat = await Chat.findOne({
            participants: {
                $all: [req.user._id, recipientId],
                $size: 2,
            },
            listing: listingId || null,
        })
            .populate("participants", "username email")
            .populate("listing", "title price images");

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user._id, recipientId],
                listing: listingId || null,
            });

            chat = await Chat.findById(chat._id)
                .populate("participants", "username email")
                .populate("listing", "title price images");
        }

        res.status(200).json({
            message: "Chat ready",
            chat,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to start chat",
            error: error.message,
        });
    }
};

// Get logged-in user's chats
const getMyChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
        })
            .populate("participants", "username email")
            .populate("listing", "title price images")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "username",
                },
            })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            message: "Chats fetched successfully",
            count: chats.length,
            chats,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch chats",
            error: error.message,
        });
    }
};

// Get messages of one chat
const getChatMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            });
        }

        const isParticipant = chat.participants.some(
            (participantId) =>
                participantId.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not authorized to view this chat",
            });
        }

        const messages = await Message.find({
            chat: req.params.chatId,
        })
            .populate("sender", "username email")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Messages fetched successfully",
            messages,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message,
        });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Message text is required",
            });
        }

        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            });
        }

        const isParticipant = chat.participants.some(
            (participantId) =>
                participantId.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not authorized to send messages in this chat",
            });
        }

        const message = await Message.create({
            chat: chat._id,
            sender: req.user._id,
            text,
        });

        chat.lastMessage = message._id;
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username email");

        // Send real-time message to chat room
        const io = getIO();
        io.to(`chat:${chat._id}`).emit("newMessage", populatedMessage);

        // Create notification for the other participant
        const receiverId = chat.participants.find(
            (participantId) =>
                participantId.toString() !== req.user._id.toString()
        );

        await Notification.create({
            user: receiverId,
            type: "chat_message",
            title: "New chat message",
            message: `${req.user.username} sent you a message.`,
            relatedId: chat._id,
        });

        res.status(201).json({
            message: "Message sent successfully",
            chatMessage: populatedMessage,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message,
        });
    }
};

module.exports = {
    startChat,
    getMyChats,
    getChatMessages,
    sendMessage,
};