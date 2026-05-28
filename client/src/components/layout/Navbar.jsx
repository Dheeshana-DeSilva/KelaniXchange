import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
    ArrowRight,
    HelpCircle,
    LogIn,
    Menu,
    Search,
    ShieldCheck,
    ShoppingBag,
    User,
    UserPlus,
    X,
} from "lucide-react";
import logo from "../../assets/X_logo.png";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
    { label: "Marketplace", to: "/marketplace", icon: ShoppingBag },
    { label: "Lost & Found", to: "/lost-found", icon: Search },
    { label: "How It Works", href: "/#how-it-works", icon: HelpCircle },
    { label: "Safety", to: "/safety", icon: ShieldCheck },
];

function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => setMobileOpen(false), [location.pathname, location.hash]);

    const navShell = "bg-[#0a192f] border-b border-white/10 shadow-md";
    const linkBase = "text-slate-300 hover:bg-white/5 hover:text-white";
    const activeLink = "bg-white/10 text-white";
    const subtleButton = "border-white/20 text-slate-300 hover:border-white/40 hover:bg-white/8 hover:text-white";

    const renderNavLink = (link, mobile = false) => {
        const Icon = link.icon;
        const isActive = link.to && location.pathname === link.to;
        const className = mobile
            ? "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100"
            : `inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-black transition-colors ${isActive ? activeLink : linkBase}`;

        if (link.to) {
            return (
                <Link key={link.label} to={link.to} className={className}>
                    {mobile && <Icon size={16} className="text-[#15945a]" />}
                    {link.label}
                </Link>
            );
        }

        return (
            <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className={className}>
                {mobile && <Icon size={16} className="text-[#15945a]" />}
                {link.label}
            </a>
        );
    };

    return (
        <>
            <nav className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${navShell}`} aria-label="Landing navigation">
                <div className="mx-auto max-w-[1450px] px-4 sm:px-8">
                    <div className="flex h-[72px] items-center justify-between gap-4">
                        <Link to="/" className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0a192f]/40 shadow-inner">
                                <img src={logo} alt="KelaniXchange" className="h-6 w-6 object-contain" />
                            </span>
                            <span className="truncate text-lg font-black tracking-tight text-white sm:text-xl">
                                Kelani<span className="text-[#15945a]">Xchange</span>
                            </span>
                        </Link>

                        <div className="hidden items-center gap-1 lg:flex">
                            {navLinks.map((link) => renderNavLink(link))}
                        </div>

                        <div className="hidden items-center gap-2 lg:flex">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className={`inline-flex max-w-[180px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition-colors ${subtleButton}`}
                                    >
                                        <User size={16} />
                                        <span className="truncate">{user?.username || "Profile"}</span>
                                    </Link>
                                    <Link
                                        to="/marketplace"
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#48c96f] px-4 py-2 text-sm font-black text-[#0a192f] transition-colors hover:bg-[#62d986]"
                                    >
                                        Open Marketplace
                                        <ArrowRight size={16} />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition-colors ${subtleButton}`}
                                    >
                                        <LogIn size={16} />
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#48c96f] px-4 py-2 text-sm font-black text-[#0a192f] transition-colors hover:bg-[#62d986]"
                                    >
                                        <UserPlus size={16} />
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            aria-label="Toggle menu"
                            onClick={() => setMobileOpen((open) => !open)}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors lg:hidden ${subtleButton}`}
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="absolute inset-0 h-full w-full bg-slate-950/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-3 right-3 top-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:left-6 sm:right-6">
                        <div className="grid gap-1">
                            {navLinks.map((link) => renderNavLink(link, true))}
                        </div>

                        <div className="my-3 h-px bg-slate-100" />

                        {isAuthenticated ? (
                            <div className="grid gap-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
                                >
                                    <User size={16} />
                                    {user?.username || "Profile"}
                                </Link>
                                <Link
                                    to="/marketplace"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-4 py-3 text-sm font-black text-[#0a192f]"
                                >
                                    Open Marketplace
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
                                >
                                    <LogIn size={16} />
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-4 py-3 text-sm font-black text-[#0a192f]"
                                >
                                    <UserPlus size={16} />
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;
