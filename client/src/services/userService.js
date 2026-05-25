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
