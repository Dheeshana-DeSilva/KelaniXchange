import api from "./api";

export const getLostFoundPosts = async (params = {}) => {
    const response = await api.get("/lost-found", { params });
    return response.data;
};

export const getLostFoundPostById = async (id) => {
    const response = await api.get(`/lost-found/${id}`);
    return response.data;
};

export const createLostFoundPost = async (formData) => {
    const response = await api.post("/lost-found", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const getMyLostFoundPosts = async () => {
    const response = await api.get("/lost-found/user/my-posts");
    return response.data;
};

export const markLostFoundResolved = async (id) => {
    const response = await api.patch(`/lost-found/${id}/resolve`);
    return response.data;
};

export const deleteLostFoundPost = async (id) => {
    const response = await api.delete(`/lost-found/${id}`);
    return response.data;
};