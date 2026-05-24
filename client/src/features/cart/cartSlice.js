import { createSlice } from "@reduxjs/toolkit";

/* ── Helpers ── */
const loadCart = () => {
    try {
        const raw = localStorage.getItem("kx_cart");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const calcTotals = (items) => ({
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
});

const clampQuantity = (quantity, availableQuantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    const maxQty = Number(availableQuantity);
    return Number.isFinite(maxQty) && maxQty > 0 ? Math.min(qty, maxQty) : qty;
};

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
         * addToCart — payload: { id, title, price, image, sellerId, quantity?, availableQuantity? }
         * If the item already exists, increments quantity.
         */
        addToCart(state, action) {
            const existing = state.items.find((i) => i.id === action.payload.id);
            const qty = action.payload.quantity || 1;
            if (existing) {
                existing.availableQuantity = action.payload.availableQuantity ?? existing.availableQuantity;
                existing.quantity = clampQuantity(existing.quantity + qty, existing.availableQuantity);
            } else {
                state.items.push({
                    ...action.payload,
                    quantity: clampQuantity(qty, action.payload.availableQuantity),
                });
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

        updateCartItemAvailability(state, action) {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (!item) return;

            const availableQuantity = Number(action.payload.availableQuantity);
            if (!Number.isFinite(availableQuantity)) return;
            if (
                item.availableQuantity === availableQuantity &&
                (availableQuantity === 0 || item.quantity <= availableQuantity)
            ) return;

            item.availableQuantity = availableQuantity;
            if (availableQuantity > 0 && item.quantity > availableQuantity) {
                item.quantity = availableQuantity;
            }
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

export const { addToCart, removeFromCart, deleteFromCart, updateCartItemAvailability, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
