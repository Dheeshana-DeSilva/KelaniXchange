import api from "./api";

export const getUserProfile = async () => {
    const res = await api.get("/users/profile");
    return res.data;
};

export const updateUserProfile = async (profileData) => {
    const res = await api.put("/users/profile", profileData);
    return res.data;
};

export const getSellerPaymentProfile = async (sellerId) => {
    const res = await api.get(`/users/${sellerId}/payment-profile`);
    return res.data;
};

export const searchUsers = async (search) => {
    const res = await api.get("/users/search", { params: { search } });
    return res.data;
};

export const getPublicUserProfile = async (userId) => {
    const res = await api.get(`/users/${userId}/public`);
    return res.data;
};
