import api from "./api";

export const getWishlist = async () => {
    const res = await api.get("/wishlist");
    return res.data;
};

export const addToWishlist = async (listingId) => {
    const res = await api.post(`/wishlist/${listingId}`);
    return res.data;
};

export const removeFromWishlist = async (listingId) => {
    const res = await api.delete(`/wishlist/${listingId}`);
    return res.data;
};
