import { Routes, Route } from "react-router";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Marketplace from "../pages/Marketplace";
import About from "../pages/About";
import ListingDetails from "../pages/ListingDetails";
import CreateListing from "../pages/CreateListing";
import MyListings from "../pages/MyListings";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/MyOrders";
import MySales from "../pages/MySales";
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";
import MyExchanges from "../pages/MyExchanges";
import UserSearch from "../pages/UserSearch";
import PublicUserProfile from "../pages/PublicUserProfile";
import Notifications from "../pages/Notifications";
import ChatList from "../pages/ChatList";
import ChatConversation from "../pages/ChatConversation";

/* ── Admin ── */
import AdminRoute from "./AdminRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageProducts from "../pages/admin/ManageProducts";
import ManageOrders from "../pages/admin/ManageOrders";
import OrderDetails from "../pages/admin/OrderDetails";
import ManageReports from "../pages/admin/ManageReports";
import ManageLostFound from "../pages/admin/ManageLostFound";

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/my-listings" element={<MyListings />} />
            <Route path="/marketplace/create" element={<CreateListing />} />
            <Route path="/marketplace/:id" element={<ListingDetails />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/sales" element={<MySales />} />
            <Route path="/exchanges" element={<MyExchanges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/chats/:chatId" element={<ChatConversation />} />
            <Route path="/users" element={<UserSearch />} />
            <Route path="/users/:id" element={<PublicUserProfile />} />
            <Route path="/about" element={<About />} />

            {/* Admin — protected & nested under AdminLayout */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="listings" element={<ManageProducts />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="reports" element={<ManageReports />} />
                <Route path="lost-found" element={<ManageLostFound />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
