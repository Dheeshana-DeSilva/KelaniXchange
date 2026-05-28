import api from "./api";

export const createReview = async (reviewData) => {
    const res = await api.post("/reviews", reviewData);
    return res.data;
};

export const getSellerReviews = async (sellerId) => {
    const res = await api.get(`/reviews/seller/${sellerId}`);
    return res.data;
};

export const deleteReviewAdmin = async (reviewId) => {
    const res = await api.delete(`/admin/reviews/${reviewId}`);
    return res.data;
};

export const getAllReviewsAdmin = async () => {
    const res = await api.get("/admin/reviews");
    return res.data;
};
