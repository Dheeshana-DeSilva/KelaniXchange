import api from "./api";

export const startChat = async ({ recipientId, listingId }) => {
    const response = await api.post("/chats/start", { recipientId, listingId });
    return response.data;
};

export const getMyChats = async () => {
    const response = await api.get("/chats");
    return response.data;
};

export const getUnreadMessageCount = async () => {
    const response = await api.get("/chats/unread-count");
    return response.data;
};

export const getChatMessages = async (chatId) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
};

export const sendChatMessage = async (chatId, text) => {
    const response = await api.post(`/chats/${chatId}/messages`, { text });
    return response.data;
};

export const markChatAsRead = async (chatId) => {
    const response = await api.put(`/chats/${chatId}/read`);
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
};
