const jwt = require("jsonwebtoken");
const User = require("../models/User");

const initializeChatSocket = (io) => {
    // Authenticate socket connections using JWT
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Socket authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.user.username}`);
        socket.join(`user:${socket.user._id}`);

        // Join a specific chat room
        socket.on("joinChat", (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`${socket.user.username} joined chat:${chatId}`);
        });

        // Leave a chat room
        socket.on("leaveChat", (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`${socket.user.username} left chat:${chatId}`);
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.user.username}`);
        });
    });
};

module.exports = initializeChatSocket;
