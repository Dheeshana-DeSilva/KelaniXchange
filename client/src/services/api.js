import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

/* ── Request interceptor: attach JWT token to every request ── */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("kx_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ── Response interceptor: handle 401 (expired/invalid token) ── */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear auth and redirect to login
            localStorage.removeItem("kx_token");
            localStorage.removeItem("kx_user");

            // Only redirect if not already on the login page
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;