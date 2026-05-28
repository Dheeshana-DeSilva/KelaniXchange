import api from "./api";

export const checkoutCart = async (orderData) => {
    const res = await api.post("/orders", orderData);
    return res.data;
};

export const getMyOrders = async () => {
    const res = await api.get("/orders/my-orders");
    return res.data;
};

export const getMySales = async () => {
    const res = await api.get("/orders/my-sales");
    return res.data;
};

export const cancelOrder = async (orderId) => {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
};

export const retryOrderPayment = async (orderId, paymentData) => {
    const res = await api.put(`/orders/${orderId}/retry-payment`, paymentData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const deleteOrder = async (orderId) => {
    const res = await api.delete(`/orders/${orderId}`);
    return res.data;
};

export const deleteSale = async (orderId) => {
    const res = await api.delete(`/orders/sales/${orderId}`);
    return res.data;
};

export const updateSaleStatus = async (orderId, statusData) => {
    const res = await api.put(`/orders/sales/${orderId}/status`, statusData);
    return res.data;
};

// Admin order APIs
export const getAllOrdersAdmin = async () => {
    const res = await api.get("/orders/admin/all");
    return res.data;
};

export const getOrderByIdAdmin = async (orderId) => {
    const res = await api.get(`/orders/admin/${orderId}`);
    return res.data;
};

export const updateOrderStatusAdmin = async (orderId, statusData) => {
    const res = await api.put(`/orders/admin/${orderId}/status`, statusData);
    return res.data;
};
