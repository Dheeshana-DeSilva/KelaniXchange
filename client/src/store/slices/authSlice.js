import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../services/authService";

/* ── Seed initial state from localStorage ── */
const storedToken = localStorage.getItem("kx_token") || null;
const storedUser = (() => {
    try {
        const raw = localStorage.getItem("kx_user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
})();

const initialState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!(storedToken && storedUser),
    isLoading: false,
    error: null,
};

/* ── Async Thunks ── */
export const loginAsync = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await loginUser(credentials);
            return data; // { token, user }
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message ?? "Invalid email or password. Please try again."
            );
        }
    }
);

export const registerAsync = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const data = await registerUser(userData);
            return data; // { token, user }
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message ?? "Registration failed. Please try again."
            );
        }
    }
);

/* ── Slice ── */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("kx_token");
            localStorage.removeItem("kx_user");
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        /* ── Login ── */
        builder
            .addCase(loginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                const { token, user } = action.payload;
                state.isLoading = false;
                state.token = token;
                state.user = user;
                state.isAuthenticated = true;
                localStorage.setItem("kx_token", token);
                localStorage.setItem("kx_user", JSON.stringify(user));
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

        /* ── Register ── */
        builder
            .addCase(registerAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerAsync.fulfilled, (state, action) => {
                const { token, user } = action.payload;
                state.isLoading = false;
                state.token = token;
                state.user = user;
                state.isAuthenticated = true;
                localStorage.setItem("kx_token", token);
                localStorage.setItem("kx_user", JSON.stringify(user));
            })
            .addCase(registerAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
