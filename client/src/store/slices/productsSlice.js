import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ── Async Thunks ── */

/** Fetch all listings with optional filters (search, category, minPrice, maxPrice, sort) */
export const fetchListings = createAsyncThunk(
    "products/fetchListings",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get("/listings", { params });
            return response.data; // expected: { listings: [], total, page, pages }
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message ?? "Failed to fetch listings."
            );
        }
    }
);

/** Fetch a single listing by id */
export const fetchListingById = createAsyncThunk(
    "products/fetchListingById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/listings/${id}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message ?? "Failed to fetch listing."
            );
        }
    }
);

/* ── Slice ── */
const productsSlice = createSlice({
    name: "products",
    initialState: {
        items: [],          // array of listing objects
        selectedItem: null, // detail view
        total: 0,
        page: 1,
        pages: 1,
        isLoading: false,
        isDetailLoading: false,
        error: null,
        filters: {
            search: "",
            category: "",
            minPrice: "",
            maxPrice: "",
            sort: "newest",
        },
    },
    reducers: {
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters(state) {
            state.filters = { search: "", category: "", minPrice: "", maxPrice: "", sort: "newest" };
        },
        clearSelectedItem(state) {
            state.selectedItem = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        /* fetchListings */
        builder
            .addCase(fetchListings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchListings.fulfilled, (state, action) => {
                state.isLoading = false;
                // Support both { listings, total, page, pages } and plain array responses
                const payload = action.payload;
                if (Array.isArray(payload)) {
                    state.items = payload;
                    state.total = payload.length;
                } else {
                    state.items = payload.listings ?? payload.data ?? [];
                    state.total = payload.total ?? state.items.length;
                    state.page = payload.page ?? 1;
                    state.pages = payload.pages ?? 1;
                }
            })
            .addCase(fetchListings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

        /* fetchListingById */
        builder
            .addCase(fetchListingById.pending, (state) => {
                state.isDetailLoading = true;
                state.error = null;
            })
            .addCase(fetchListingById.fulfilled, (state, action) => {
                state.isDetailLoading = false;
                state.selectedItem = action.payload;
            })
            .addCase(fetchListingById.rejected, (state, action) => {
                state.isDetailLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, clearFilters, clearSelectedItem, clearError } = productsSlice.actions;
export default productsSlice.reducer;
