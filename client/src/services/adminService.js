import api from "./api";

/* ── Dashboard ── */
export const getDashboardStats = async () => {
    const res = await api.get("/admin/dashboard");
    return res.data;
};

/* ── Users ── */
export const getAllUsers = async () => {
    const res = await api.get("/admin/users");
    return res.data;
};

export const addUser = async (data) => {
    const res = await api.post("/admin/users", data);
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
};

export const suspendUser = async (id) => {
    const res = await api.put(`/admin/users/${id}/suspend`);
    return res.data;
};

export const unsuspendUser = async (id) => {
    const res = await api.put(`/admin/users/${id}/unsuspend`);
    return res.data;
};

export const updateUserRole = async (id, role) => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
};

export const updateUserStatus = async (id, accountStatus) => {
    const res = await api.put(`/admin/users/${id}/status`, { accountStatus });
    return res.data;
};

/* ── Listings ── */
export const getAllListingsAdmin = async () => {
    const res = await api.get("/admin/listings");
    return res.data;
};

export const removeListingAdmin = async (id) => {
    const res = await api.put(`/admin/listings/${id}/remove`);
    return res.data;
};

export const updateListingAdmin = async (id, data) => {
    const res = await api.put(`/admin/listings/${id}`, data);
    return res.data;
};

export const deleteListingAdmin = async (id) => {
    const res = await api.delete(`/admin/listings/${id}`);
    return res.data;
};

/* ── Reports ── */
export const getAllReports = async () => {
    const res = await api.get("/admin/reports");
    return res.data;
};

export const updateReportStatus = async (id, status) => {
    const res = await api.put(`/admin/reports/${id}/status`, { status });
    return res.data;
};

/* ── Lost & Found ── */
export const getAllLostFoundAdmin = async () => {
    const res = await api.get("/admin/lost-found");
    return res.data;
};

export const updateLostFoundStatusAdmin = async (id, status) => {
    const res = await api.put(`/admin/lost-found/${id}/status`, { status });
    return res.data;
};

export const deleteLostFoundAdmin = async (id) => {
    const res = await api.delete(`/admin/lost-found/${id}`);
    return res.data;
};
