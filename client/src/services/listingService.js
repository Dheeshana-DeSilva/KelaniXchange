import api from "./api";

export const getListings = async (params = {}) => {
    const response = await api.get("/listings", { params });
    return response.data;
};

export const getListingById = async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
};

export const createListing = async (formData) => {
    const response = await api.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateListing = async (id, formData) => {
    const response = await api.put(`/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteListing = async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
};
