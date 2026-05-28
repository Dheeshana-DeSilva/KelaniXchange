import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { 
    Bell, Heart, MessageCircle, ShoppingCart, ChevronDown,
    User, LogIn, LogOut, Package, PlusCircle, ReceiptText, Store, ArrowRightLeft, Search
} from "lucide-react";
import logo from "../../assets/X_logo.png";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../features/auth/authSlice";
import { getWishlist } from "../../services/wishlistService";
import { getNotifications } from "../../services/notificationService";
import { getUnreadMessageCount } from "../../services/chatService";
import { getSocket } from "../../services/socketService";

function MarketplaceNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    
    const location = useLocation();
    const dispatch = useDispatch();
    
    const { user, isAuthenticated } = useAuth();
    const cartItemsCount = useSelector(state => state.cart?.totalItems || 0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setProfileDropdownOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        let isMounted = true;
        const loadWishlistCount = async () => {
            if (!isAuthenticated) { setWishlistCount(0); return; }
            try {
                const data = await getWishlist();
                if (isMounted) setWishlistCount(data.count ?? data.wishlist?.length ?? 0);
            } catch (err) { console.error("Failed to load wishlist count:", err); }
        };
        loadWishlistCount();
        window.addEventListener("kx:wishlist-updated", loadWishlistCount);
        return () => { isMounted = false; window.removeEventListener("kx:wishlist-updated", loadWishlistCount); };
    }, [isAuthenticated, location.pathname]);

    useEffect(() => {
        let isMounted = true;
        const loadChatUnreadCount = async () => {
            if (!isAuthenticated) { setChatUnreadCount(0); return; }
            try {
                const data = await getUnreadMessageCount();
                if (isMounted) setChatUnreadCount(data.unreadCount || 0);
            } catch (err) { console.error("Failed to load chat unread count:", err); }
        };
        loadChatUnreadCount();
        const socket = getSocket();
        const handleUpdate = () => loadChatUnreadCount();
        socket?.on("chatUpdated", handleUpdate);
        socket?.on("messagesRead", handleUpdate);
        window.addEventListener("kx:chat-updated", loadChatUnreadCount);
        return () => {
            isMounted = false;
            socket?.off("chatUpdated", handleUpdate);
            socket?.off("messagesRead", handleUpdate);
            window.removeEventListener("kx:chat-updated", loadChatUnreadCount);
        };
    }, [isAuthenticated, location.pathname]);

    useEffect(() => {
        let isMounted = true;
        const loadNotificationCount = async () => {
            if (!isAuthenticated) { setNotificationCount(0); return; }
            try {
                const data = await getNotifications();
                if (isMounted) setNotificationCount(data.unreadCount || 0);
            } catch (err) { console.error("Failed to load notification count:", err); }
        };
        loadNotificationCount();
        const intervalId = window.setInterval(loadNotificationCount, 30000);
        const socket = getSocket();
        const handleSocketNotification = () => loadNotificationCount();
        socket?.on("notificationUpdated", handleSocketNotification);
        window.addEventListener("kx:notifications-updated", loadNotificationCount);
        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
            socket?.off("notificationUpdated", handleSocketNotification);
            window.removeEventListener("kx:notifications-updated", loadNotificationCount);
        };
    }, [isAuthenticated, location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileDropdownOpen && !e.target.closest('.profile-menu-container')) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [profileDropdownOpen]);

    const handleLogout = () => {
        dispatch(logout());
        setProfileDropdownOpen(false);
    };

    const navBg = scrolled
        ? "bg-[#0a192f]/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-white/10"
        : "bg-[#0a192f] border-b border-white/10 shadow-md";

    const desktopLinkClass = (to, exact = false) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
        return `inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
            isActive
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`;
    };

    const iconLinkClass = (to) => {
        const isActive = location.pathname.startsWith(to);
        return `relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            isActive
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`;
    };

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${navBg}`}
                aria-label="Marketplace navigation"
            >
                <div className="max-w-[1450px] mx-auto px-4 sm:px-8">
                    <div className="relative flex h-[72px] items-center justify-between gap-4">

                        {/* ── Left: Logo + Nav Links ── */}
                        <div className="z-10 flex items-center gap-8">
                            <Link to="/marketplace" className="flex items-center gap-3 group shrink-0">
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a192f]/40 to-[#0a192f]/20 border border-white/10 shadow-inner">
                                    <img
                                        src={logo}
                                        alt="KelaniXchange"
                                        className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <span className="text-xl font-black tracking-tight text-white hidden sm:block">
                                    Kelani<span className="text-[#48c96f]">Xchange</span>
                                </span>
                            </Link>
                            <div className="hidden lg:flex items-center gap-1.5">
                                <Link to="/marketplace" className={desktopLinkClass("/marketplace", true)}>
                                    Browse
                                </Link>
                                <Link to="/lost-found" className={desktopLinkClass("/lost-found")}>
                                    Lost &amp; Found
                                </Link>
                                {isAuthenticated && (
                                    <Link
                                        to="/marketplace/create"
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#48c96f] px-4 py-2 text-sm font-black text-[#0a192f] shadow-sm transition-colors hover:bg-[#62d986]"
                                    >
                                        <PlusCircle size={16} /> Sell
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* ── Right: Icons & Profile ── */}
                        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                            
                            {/* Wishlist Icon */}
                            <Link to="/wishlist" className={iconLinkClass("/wishlist")} title="Wishlist">
                                <Heart size={20} />
                                {wishlistCount > 0 && (
                                    <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-[#0a192f] bg-rose-500 px-1 text-[10px] font-bold text-white">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart Icon */}
                            <Link to="/cart" className={iconLinkClass("/cart")} title="Cart">
                                <ShoppingCart size={20} />
                                {cartItemsCount > 0 && (
                                    <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-[#0a192f] bg-[#48c96f] px-1 text-[10px] font-bold text-white">
                                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                    </span>
                                )}
                            </Link>

                            {isAuthenticated && (
                                <Link to="/chats" className={iconLinkClass("/chats")} title="Chats">
                                    <MessageCircle size={20} />
                                    {chatUnreadCount > 0 && (
                                        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-[#0a192f] bg-amber-500 px-1 text-[10px] font-bold text-white">
                                            {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {isAuthenticated && (
                                <Link to="/notifications" className={iconLinkClass("/notifications")} title="Notifications">
                                    <Bell size={20} />
                                    {notificationCount > 0 && (
                                        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-[#0a192f] bg-blue-500 px-1 text-[10px] font-bold text-white">
                                            {notificationCount > 99 ? "99+" : notificationCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Auth / Profile */}
                            <div className="mx-1 hidden h-6 w-px bg-white/15 sm:block" />

                            {isAuthenticated ? (
                                <div className="relative profile-menu-container">
                                    <button 
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 pl-2 pr-2 transition-colors hover:bg-white/10"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#48c96f] to-[#15945a] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage} alt={user?.username || "Profile"} className="h-full w-full object-cover" />
                                            ) : (
                                                user?.username?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200 hidden sm:block max-w-[100px] truncate">
                                            {user?.username}
                                        </span>
                                        <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-[#0a192f] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-2 border-b border-white/10 mb-2">
                                                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                            </div>
                                            
                                            <Link to="/marketplace" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <Store size={16} className="text-[#48c96f]" /> Browse Marketplace
                                            </Link>
                                            <Link to="/lost-found" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <Search size={16} className="text-[#48c96f]" /> Lost &amp; Found
                                            </Link>
                                            <Link to="/lost-found/my-posts" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <Search size={16} className="text-[#48c96f]" /> My L&amp;F Posts
                                            </Link>

                                            <div className="my-2 border-t border-white/10" />

                                            <Link to="/marketplace/create" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <PlusCircle size={16} className="text-[#48c96f]" /> Sell an Item
                                            </Link>
                                            <Link to="/marketplace/my-listings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <Package size={16} className="text-[#48c96f]" /> My Listings
                                            </Link>
                                            <Link to="/sales" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <ReceiptText size={16} className="text-[#48c96f]" /> My Sales
                                            </Link>

                                            <div className="my-2 border-t border-white/10" />

                                            <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <ShoppingCart size={16} className="text-[#48c96f]" /> My Orders
                                            </Link>
                                            <Link to="/exchanges" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <ArrowRightLeft size={16} className="text-[#48c96f]" /> My Exchanges
                                            </Link>
                                            <Link to="/chats" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <MessageCircle size={16} className="text-[#48c96f]" /> Chats
                                            </Link>
                                            
                                            <div className="my-2 border-t border-white/10" />

                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <User size={16} className="text-[#48c96f]" /> My Profile
                                            </Link>
                                            
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-white/5 hover:text-rose-300 transition-colors"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/40 hover:bg-white/8 hover:text-white"
                                    >
                                        <LogIn size={15} />
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center rounded-xl bg-[#48c96f] px-4 py-2 text-sm font-black text-[#0a192f] transition-colors hover:bg-[#62d986]"
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* ── Accent line ── */}
                {scrolled && (
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#48c96f]/40 to-transparent" />
                )}
            </nav>

        </>
    );
}

export default MarketplaceNavbar;
