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

export const updateListing = async (id, data) => {
    const config = data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
    const response = await api.put(`/listings/${id}`, data, config);
    return response.data;
};

export const deleteListing = async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
};

export const getMyListings = async () => {
    const response = await api.get("/listings/my-listings");
    return response.data;
};
