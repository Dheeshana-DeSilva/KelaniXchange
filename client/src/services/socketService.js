import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
let socket;
let activeToken;

export const getSocket = () => {
    const token = localStorage.getItem("kx_token");

    if (!token) return null;

    if (!socket || activeToken !== token) {
        if (socket) socket.disconnect();
        activeToken = token;
        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 800,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection failed:", error.message);
        });
    } else if (socket.disconnected) {
        socket.auth = { token };
        socket.connect();
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        activeToken = null;
    }
};
