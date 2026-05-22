import { createSlice } from "@reduxjs/toolkit";

/* ── Helpers ── */
const loadCart = () => {
    try {
        const raw = localStorage.getItem("kx_cart");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const calcTotals = (items) => ({
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
});

const initialItems = loadCart();

const initialState = {
    items: initialItems,
    ...calcTotals(initialItems),
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        /**
         * addToCart — payload: { id, title, price, image, sellerId }
         * If the item already exists, increments quantity.
         */
        addToCart(state, action) {
            const existing = state.items.find((i) => i.id === action.payload.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
            Object.assign(state, calcTotals(state.items));
        },

        /**
         * removeFromCart — payload: id
         * Decrements quantity; removes item when quantity reaches 0.
         */
        removeFromCart(state, action) {
            const idx = state.items.findIndex((i) => i.id === action.payload);
            if (idx === -1) return;
            if (state.items[idx].quantity > 1) {
                state.items[idx].quantity -= 1;
            } else {
                state.items.splice(idx, 1);
            }
            Object.assign(state, calcTotals(state.items));
        },

        /**
         * deleteFromCart — payload: id
         * Removes the item entirely regardless of quantity.
         */
        deleteFromCart(state, action) {
            state.items = state.items.filter((i) => i.id !== action.payload);
            Object.assign(state, calcTotals(state.items));
        },

        /** clearCart — empties the cart (e.g. after checkout). */
        clearCart(state) {
            state.items = [];
            state.totalItems = 0;
            state.totalPrice = 0;
        },
    },
});

export const { addToCart, removeFromCart, deleteFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
