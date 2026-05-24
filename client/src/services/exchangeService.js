import api from "./api";

export const createExchangeRequest = async (data) => {
    const res = await api.post("/exchanges", data);
    return res.data;
};

export const getSentExchangeRequests = async () => {
    const res = await api.get("/exchanges/sent");
    return res.data;
};

export const getReceivedExchangeRequests = async () => {
    const res = await api.get("/exchanges/received");
    return res.data;
};

export const acceptExchangeRequest = async (id) => {
    const res = await api.put(`/exchanges/${id}/accept`);
    return res.data;
};

export const rejectExchangeRequest = async (id) => {
    const res = await api.put(`/exchanges/${id}/reject`);
    return res.data;
};

export const cancelExchangeRequest = async (id) => {
    const res = await api.put(`/exchanges/${id}/cancel`);
    return res.data;
};
