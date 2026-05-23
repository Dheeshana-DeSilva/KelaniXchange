import api from "./api";

// Get all orders (Admin)
export const getAllOrdersAdmin = async () => {
    const res = await api.get("/orders/admin/all");
    return res.data;
};

// Get single order (Admin)
export const getOrderByIdAdmin = async (id) => {
    const res = await api.get(`/orders/admin/${id}`);
    return res.data;
};

// Update order status (Admin)
export const updateOrderStatusAdmin = async (id, data) => {
    const res = await api.put(`/orders/admin/${id}/status`, data);
    return res.data;
};
