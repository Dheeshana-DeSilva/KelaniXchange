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
        } else if (chat.deletedFor?.some((userId) => userId.toString() === req.user._id.toString())) {
            chat.deletedFor = chat.deletedFor.filter((userId) => userId.toString() !== req.user._id.toString());
            await chat.save();
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
            deletedFor: { $ne: req.user._id },
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

        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const chatObject = chat.toObject();
                chatObject.unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: req.user._id },
                    isRead: false,
                });
                return chatObject;
            })
        );

        const unreadCount = await Message.countDocuments({
            chat: { $in: chats.map((chat) => chat._id) },
            sender: { $ne: req.user._id },
            isRead: false,
        });

        res.status(200).json({
            message: "Chats fetched successfully",
            count: chatsWithUnread.length,
            unreadCount,
            chats: chatsWithUnread,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch chats",
            error: error.message,
        });
    }
};

// Get unread message count for logged-in user
const getUnreadMessageCount = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id }).select("_id deletedFor");
        const visibleChatIds = chats
            .filter((chat) => !chat.deletedFor?.some((userId) => userId.toString() === req.user._id.toString()))
            .map((chat) => chat._id);
        const unreadCount = await Message.countDocuments({
            chat: { $in: visibleChatIds },
            sender: { $ne: req.user._id },
            isRead: false,
        });

        res.status(200).json({
            message: "Unread message count fetched successfully",
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch unread message count",
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

        const isDeletedForUser = chat.deletedFor?.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isParticipant || isDeletedForUser) {
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

// Mark incoming messages in one chat as read
const markChatAsRead = async (req, res) => {
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

        const isDeletedForUser = chat.deletedFor?.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isParticipant || isDeletedForUser) {
            return res.status(403).json({
                message: "You are not authorized to update this chat",
            });
        }

        await Message.updateMany(
            {
                chat: chat._id,
                sender: { $ne: req.user._id },
                isRead: false,
            },
            { isRead: true }
        );

        const io = getIO();
        io.to(`user:${req.user._id}`).emit("messagesRead", { chatId: chat._id });

        res.status(200).json({
            message: "Chat marked as read",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to mark chat as read",
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

        const isDeletedForUser = chat.deletedFor?.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isParticipant || isDeletedForUser) {
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

        chat.deletedFor = chat.deletedFor.filter(
            (userId) => userId.toString() !== receiverId.toString()
        );
        await chat.save();

        await Notification.create({
            user: receiverId,
            type: "chat_message",
            title: "New chat message",
            message: `${req.user.username} sent you a message.`,
            relatedId: chat._id,
        });

        io.to(`user:${receiverId}`).emit("chatUpdated", {
            chatId: chat._id,
            message: populatedMessage,
        });
        io.to(`user:${req.user._id}`).emit("chatUpdated", {
            chatId: chat._id,
            message: populatedMessage,
        });
        io.to(`user:${receiverId}`).emit("notificationUpdated");

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

// Hide a chat from the logged-in user's chat list
const deleteChatForUser = async (req, res) => {
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
                message: "You are not authorized to delete this chat",
            });
        }

        if (!chat.deletedFor.some((userId) => userId.toString() === req.user._id.toString())) {
            chat.deletedFor.push(req.user._id);
            await chat.save();
        }

        await Message.updateMany(
            {
                chat: chat._id,
                sender: { $ne: req.user._id },
                isRead: false,
            },
            { isRead: true }
        );

        await Notification.deleteMany({
            user: req.user._id,
            type: "chat_message",
            relatedId: chat._id,
        });

        const io = getIO();
        io.to(`user:${req.user._id}`).emit("chatUpdated", { chatId: chat._id, deleted: true });
        io.to(`user:${req.user._id}`).emit("notificationUpdated");

        res.status(200).json({
            message: "Chat deleted successfully",
            chatId: chat._id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete chat",
            error: error.message,
        });
    }
};

module.exports = {
    startChat,
    getMyChats,
    getUnreadMessageCount,
    getChatMessages,
    markChatAsRead,
    sendMessage,
    deleteChatForUser,
};
