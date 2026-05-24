import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    cancelOrder,
    deleteOrder,
    getMyOrders,
    getMySales,
    updateSaleStatus,
} from "../../services/orderService";

export const fetchMyOrders = createAsyncThunk(
    "orders/fetchMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getMyOrders();
            return data.orders || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to load your orders.");
        }
    }
);

export const fetchMySales = createAsyncThunk(
    "orders/fetchMySales",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getMySales();
            return data.sales || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to load your sales.");
        }
    }
);

export const cancelMyOrder = createAsyncThunk(
    "orders/cancelMyOrder",
    async (orderId, { rejectWithValue }) => {
        try {
            const data = await cancelOrder(orderId);
            return data.order;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to cancel order.");
        }
    }
);

export const deleteMyCancelledOrder = createAsyncThunk(
    "orders/deleteMyCancelledOrder",
    async (orderId, { rejectWithValue }) => {
        try {
            const data = await deleteOrder(orderId);
            return data.orderId || orderId;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to delete order.");
        }
    }
);

export const updateMySaleStatus = createAsyncThunk(
    "orders/updateMySaleStatus",
    async ({ orderId, orderStatus, paymentStatus }, { rejectWithValue }) => {
        try {
            const data = await updateSaleStatus(orderId, { orderStatus, paymentStatus });
            return data.order;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to update sale.");
        }
    }
);

const mergeOrderStatus = (existing, updated) => ({
    ...existing,
    orderStatus: updated.orderStatus,
    paymentStatus: updated.paymentStatus,
});

const ordersSlice = createSlice({
    name: "orders",
    initialState: {
        orders: [],
        sales: [],
        ordersLoading: false,
        salesLoading: false,
        ordersError: null,
        salesError: null,
        actionLoadingId: null,
        actionError: null,
    },
    reducers: {
        clearOrderErrors(state) {
            state.ordersError = null;
            state.salesError = null;
            state.actionError = null;
        },
        clearOrdersState(state) {
            state.orders = [];
            state.sales = [];
            state.ordersError = null;
            state.salesError = null;
            state.actionError = null;
            state.actionLoadingId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrders.pending, (state) => {
                state.ordersLoading = true;
                state.ordersError = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.ordersLoading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.ordersLoading = false;
                state.ordersError = action.payload;
            })
            .addCase(fetchMySales.pending, (state) => {
                state.salesLoading = true;
                state.salesError = null;
            })
            .addCase(fetchMySales.fulfilled, (state, action) => {
                state.salesLoading = false;
                state.sales = action.payload;
            })
            .addCase(fetchMySales.rejected, (state, action) => {
                state.salesLoading = false;
                state.salesError = action.payload;
            })
            .addCase(cancelMyOrder.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
                state.actionError = null;
            })
            .addCase(cancelMyOrder.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.orders = state.orders.map((order) =>
                    order._id === action.payload._id ? mergeOrderStatus(order, action.payload) : order
                );
            })
            .addCase(cancelMyOrder.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.actionError = action.payload;
            })
            .addCase(deleteMyCancelledOrder.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
                state.actionError = null;
            })
            .addCase(deleteMyCancelledOrder.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.orders = state.orders.filter((order) => order._id !== action.payload);
            })
            .addCase(deleteMyCancelledOrder.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.actionError = action.payload;
            })
            .addCase(updateMySaleStatus.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg.orderId;
                state.actionError = null;
            })
            .addCase(updateMySaleStatus.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.sales = state.sales.map((sale) =>
                    sale._id === action.payload._id ? mergeOrderStatus(sale, action.payload) : sale
                );
            })
            .addCase(updateMySaleStatus.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.actionError = action.payload;
            })
            .addMatcher((action) => action.type === "auth/logout", (state) => {
                state.orders = [];
                state.sales = [];
                state.ordersError = null;
                state.salesError = null;
                state.actionError = null;
                state.actionLoadingId = null;
            });
    },
});

export const { clearOrderErrors, clearOrdersState } = ordersSlice.actions;
export default ordersSlice.reducer;
