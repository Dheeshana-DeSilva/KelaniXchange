import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import ordersReducer from "../features/orders/orderSlice";
import productsReducer from "../features/products/productsSlice";

/* ── Cart persistence middleware ─────────────────────────────────────────────
   Listens for any cart/* action and writes the updated cart items to
   localStorage so the cart survives a page refresh.
──────────────────────────────────────────────────────────────────────────── */
const cartPersistMiddleware = (storeAPI) => (next) => (action) => {
    const result = next(action);
    if (typeof action.type === "string" && action.type.startsWith("cart/")) {
        const { items } = storeAPI.getState().cart;
        try {
            localStorage.setItem("kx_cart", JSON.stringify(items));
        } catch {
            // localStorage may be unavailable
        }
    }
    return result;
};

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        orders: ordersReducer,
        products: productsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cartPersistMiddleware),
});

export default store;
