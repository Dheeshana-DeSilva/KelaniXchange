import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { 
    Menu, X, Bell, Heart, ShoppingCart, 
    User, LogIn, LogOut, Package, PlusCircle, ReceiptText, Store
} from "lucide-react";
import logo from "../../assets/X_logo.png";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../features/auth/authSlice";

function MarketplaceNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    
    const location = useLocation();
    const dispatch = useDispatch();
    
    // Selectors
    const { user, isAuthenticated } = useAuth();
    const cartItemsCount = useSelector(state => state.cart?.totalItems || 0);
    // Mock counts for wishlist and notifications for now
    const wishlistCount = 0; 
    const notificationCount = 2;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileOpen(false);
        setProfileDropdownOpen(false);
    }, [location.pathname]);

    // Close profile dropdown when clicking outside
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
        return `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
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

                        {/* ── Left: Logo ── */}
                        <div className="z-10 flex items-center gap-6">
                            <Link to="/" className="flex items-center gap-3 group shrink-0">
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
                            <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1">
                                <Link to="/" className={desktopLinkClass("/", true)}>
                                    Home
                                </Link>
                                <Link to="/marketplace" className={desktopLinkClass("/marketplace", true)}>
                                    Browse Categories
                                </Link>
                                {isAuthenticated && (
                                    <>
                                        <Link to="/marketplace/create" className={desktopLinkClass("/marketplace/create", true)}>
                                            <PlusCircle size={15} /> Sell Item
                                        </Link>
                                        <Link to="/marketplace/my-listings" className={desktopLinkClass("/marketplace/my-listings", true)}>
                                            <Package size={15} /> My Listings
                                        </Link>
                                        <Link to="/orders" className={desktopLinkClass("/orders", true)}>
                                            <ReceiptText size={15} /> My Orders
                                        </Link>
                                        <Link to="/sales" className={desktopLinkClass("/sales", true)}>
                                            <Store size={15} /> My Sales
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── Right: Icons & Profile ── */}
                        <div className="relative z-10 flex items-center gap-2 sm:gap-4">
                            
                            {/* Wishlist Icon */}
                            <Link to="/wishlist" className="relative p-2 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                                <Heart size={20} />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border border-[#0a192f]">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart Icon */}
                            <Link to="/cart" className="relative p-2 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                                <ShoppingCart size={20} />
                                {cartItemsCount > 0 && (
                                    <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#48c96f] text-white text-[10px] font-bold flex items-center justify-center border border-[#0a192f]">
                                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications Icon */}
                            {isAuthenticated && (
                                <button className="relative p-2 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                                    <Bell size={20} />
                                    {notificationCount > 0 && (
                                        <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center border border-[#0a192f]">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Auth / Profile */}
                            <div className="h-6 w-px bg-white/15 mx-1 hidden sm:block" />

                            {isAuthenticated ? (
                                <div className="relative profile-menu-container">
                                    <button 
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2 p-1 pl-2 pr-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#48c96f] to-[#15945a] flex items-center justify-center text-white font-bold text-xs">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200 hidden sm:block max-w-[100px] truncate">
                                            {user?.username}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-48 bg-[#0a192f] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-2 border-b border-white/10 mb-2">
                                                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                            </div>
                                            
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <User size={16} className="text-[#48c96f]" /> My Profile
                                            </Link>
                                            <Link to="/marketplace/my-listings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <Package size={16} className="text-[#48c96f]" /> My Listings
                                            </Link>
                                            <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <ReceiptText size={16} className="text-[#48c96f]" /> My Orders
                                            </Link>
                                            <Link to="/sales" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <Store size={16} className="text-[#48c96f]" /> My Sales
                                            </Link>
                                            
                                            <div className="my-2 border-t border-white/10" />
                                            
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
                                <Link
                                    to="/login"
                                    className="hidden sm:flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/40 hover:text-white hover:bg-white/8 backdrop-blur-sm"
                                >
                                    <LogIn size={15} />
                                    Log In
                                </Link>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                aria-label="Toggle menu"
                                onClick={() => setMobileOpen((o) => !o)}
                                className="xl:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 ml-1"
                            >
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Accent line ── */}
                {scrolled && (
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#48c96f]/40 to-transparent" />
                )}
            </nav>

            {/* ── Mobile Drawer ── */}
            <div className={`fixed inset-0 z-40 xl:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible"}`}>
                <div 
                    className={`absolute inset-0 bg-[#0a192f]/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} 
                    onClick={() => setMobileOpen(false)} 
                />
                
                <div className={`absolute top-[72px] left-0 right-0 bg-[#0a192f]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-y-0" : "-translate-y-4 opacity-0"}`}>
                    <div className="p-6 flex flex-col gap-2">
                        <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8">
                            Home
                        </Link>
                        <Link to="/marketplace" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8">
                            Browse Categories
                        </Link>
                        
                        <div className="my-2 border-t border-white/10" />

                        {isAuthenticated ? (
                            <>
                                <Link to="/marketplace/create" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#48c96f] hover:bg-white/8">
                                    <PlusCircle size={18} /> Sell an Item
                                </Link>
                                <Link to="/marketplace/my-listings" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8">
                                    <Package size={18} className="text-slate-400" /> My Listings
                                </Link>
                                <Link to="/orders" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8">
                                    <ReceiptText size={18} className="text-slate-400" /> My Orders
                                </Link>
                                <Link to="/sales" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8">
                                    <Store size={18} className="text-slate-400" /> My Sales
                                </Link>
                                <Link to="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8">
                                    <User size={18} className="text-slate-400" /> My Profile
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-white/8 text-left">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 mt-2">
                                <Link to="/login" className="flex justify-center items-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300">
                                    <LogIn size={16} /> Log In
                                </Link>
                                <Link to="/register" className="flex justify-center items-center gap-2 rounded-2xl bg-[#48c96f] px-4 py-3 text-sm font-bold text-[#0a192f]">
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default MarketplaceNavbar;
