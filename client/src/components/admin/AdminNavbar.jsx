import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router";
import { 
    Menu, X, LogOut, Bell, LayoutDashboard, 
    Users, Package, ShoppingCart, AlertTriangle, ArrowLeft,
    HelpCircle, CreditCard
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import logo from "../../assets/X_logo.png";

const NAV_ITEMS = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/listings", icon: Package, label: "Listings" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/payments", icon: CreditCard, label: "Payments" },
    { to: "/admin/reports", icon: AlertTriangle, label: "Reports" },
    { to: "/admin/lost-found", icon: HelpCircle, label: "Lost & Found" },
];

const AdminNavbar = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close menu on route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const isActive = (path) => {
        if (path === "/admin") return location.pathname === "/admin";
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-2xl px-4 sm:px-8">
                <div className="max-w-[1450px] mx-auto flex h-[72px] items-center justify-between gap-4">
                    {/* Left — Logo and Brand */}
                    <Link to="/admin" className="flex items-center gap-3 group shrink-0">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a192f]/10 to-[#0a192f]/5 border border-slate-200 shadow-inner">
                            <img
                                src={logo}
                                alt="KelaniXchange"
                                className="h-5 w-5 object-contain"
                            />
                        </div>
                        <span className="text-md font-black tracking-tight text-slate-800">
                            Kelani<span className="text-[#48c96f]">Xchange</span>
                        </span>
                        <span className="hidden sm:inline-block rounded bg-[#48c96f]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#48c96f] uppercase tracking-wider">
                            Admin
                        </span>
                    </Link>

                    {/* Middle — Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                            const active = isActive(to);
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                                        active
                                            ? "bg-[#48c96f]/10 text-[#48c96f] border-[#48c96f]/20"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right — Actions & Hamburger (Mobile) */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Notifications (Desktop) */}
                        <button className="hidden sm:flex relative h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                            <Bell size={18} />
                        </button>

                        {/* Divider (Desktop) */}
                        <div className="hidden sm:block h-6 w-px bg-slate-200" />

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#48c96f] to-[#15945a] flex items-center justify-center text-white font-bold text-sm">
                                {user?.username?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                    {user?.username}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium">Administrator</p>
                            </div>
                        </div>

                        {/* Logout (Desktop) */}
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            title="Sign out"
                        >
                            <LogOut size={18} />
                        </button>

                        {/* Hamburger Menu Button (Mobile) */}
                        <button
                            aria-label="Toggle menu"
                            onClick={() => setMobileOpen((o) => !o)}
                            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 ml-1 shadow-sm"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer ── */}
            <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible"}`}>
                <div 
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} 
                    onClick={() => setMobileOpen(false)} 
                />
                
                <div className={`absolute top-[72px] left-0 right-0 bg-white border-b border-slate-200 shadow-2xl transition-all duration-300 ${mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
                    <div className="p-6 flex flex-col gap-2">
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                            <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Navigation Menu</span>
                            <button 
                                onClick={() => setMobileOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                            const active = isActive(to);
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                                        active
                                            ? "bg-[#48c96f]/10 text-[#48c96f] border border-[#48c96f]/20"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                                    }`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </Link>
                            );
                        })}
                        
                        <div className="my-2 border-t border-slate-100" />
                        
                        <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                            <ArrowLeft size={18} className="text-slate-400" /> Back to Site
                        </Link>
                        
                        <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-transparent text-left"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminNavbar;
