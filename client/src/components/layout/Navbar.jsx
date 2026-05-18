import { Link, useLocation } from "react-router";
import logo from "../../assets/X_logo.png";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, LogIn, UserPlus, HelpCircle, Info } from "lucide-react";

const navLinks = [
    { label: "Marketplace",  to: "/marketplace",   icon: ShoppingBag },
    { label: "How It Works", href: "/#how-it-works", icon: HelpCircle  },
    { label: "About Us",     to: "/about",           icon: Info        },
];

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => setMobileOpen(false), [location.pathname]);

    const isHomePage = location.pathname === "/";

    const navBg = scrolled
        ? "bg-[#0a192f]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-white/10"
        : isHomePage
            ? "bg-transparent border-b border-white/5"
            : "bg-[#0a192f] border-b border-white/10 shadow-md";

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${navBg}`}
                aria-label="Main navigation"
            >
                <div className="max-w-[1450px] mx-auto px-6 sm:px-12">
                    <div className="flex h-[72px] items-center justify-between">

                        {/* ── Logo ── */}
                        <Link to="/" className="flex items-center gap-3 group shrink-0">
                            {/* Glowing badge */}
                            <div className="relative flex items-center justify-center">
                                <span className="absolute inset-0 rounded-xl bg-[#0a192f]/60 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a192f]/40 to-[#0a192f]/20 border border-[#0a192f]/40 shadow-inner">
                                    <img
                                        src={logo}
                                        alt="KelaniXchange"
                                        className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                            <span className="text-xl font-black tracking-tight text-white select-none">
                                Kelani<span className="text-[#48c96f]">Xchange</span>
                            </span>
                        </Link>

                        {/* ── Centre Nav Links (desktop) ── */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = link.to && location.pathname === link.to;
                                const baseClass =
                                    "relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ";
                                const activeClass = isActive
                                    ? "text-white bg-white/10 border border-white/15"
                                    : "text-slate-400 hover:text-white hover:bg-white/8";

                                return link.to ? (
                                    <Link
                                        key={link.label}
                                        to={link.to}
                                        className={baseClass + activeClass}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#48c96f]" />
                                        )}
                                    </Link>
                                ) : (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className={baseClass + "text-slate-400 hover:text-white hover:bg-white/8"}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>

                        {/* ── Auth Buttons (desktop) ── */}
                        <div className="hidden lg:flex items-center gap-3">
                            {/* Divider */}
                            <div className="h-5 w-px bg-white/15 mr-1" />

                            <Link
                                to="/login"
                                className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/40 hover:text-white hover:bg-white/8 backdrop-blur-sm"
                            >
                                <LogIn size={15} strokeWidth={2.5} />
                                Log In
                            </Link>

                            <Link
                                to="/register"
                                className="relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 group/btn shadow-[0_0_16px_rgba(72,201,111,0.25)] hover:shadow-[0_0_24px_rgba(72,201,111,0.45)]"
                            >
                                {/* Gradient bg */}
                                <span className="absolute inset-0 bg-gradient-to-r from-[#48c96f] to-[#15945a] transition-transform duration-300 group-hover/btn:scale-105" />
                                {/* Shimmer */}
                                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <UserPlus size={15} strokeWidth={2.5} className="relative" />
                                <span className="relative">Sign Up</span>
                            </Link>
                        </div>

                        {/* ── Mobile Hamburger ── */}
                        <button
                            aria-label="Toggle menu"
                            onClick={() => setMobileOpen((o) => !o)}
                            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* ── Thin accent line under scrolled nav ── */}
                {scrolled && (
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#48c96f]/40 to-transparent" />
                )}
            </nav>

            {/* ── Mobile Drawer ── */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-[#0a192f]/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Panel */}
                <div
                    className={`absolute top-[72px] left-0 right-0 bg-[#0a192f]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all duration-300 ${mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
                        }`}
                >
                    <div className="px-6 py-6 flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const cls = "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors";
                            return link.to ? (
                                <Link key={link.label} to={link.to} className={cls}>
                                    <Icon size={16} className="text-[#48c96f]" />
                                    {link.label}
                                </Link>
                            ) : (
                                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className={cls}>
                                    <Icon size={16} className="text-[#48c96f]" />
                                    {link.label}
                                </a>
                            );
                        })}

                        {/* Divider */}
                        <div className="my-3 h-px bg-white/10" />

                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
                        >
                            <LogIn size={16} />
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#48c96f] to-[#15945a] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-opacity hover:opacity-90"
                        >
                            <UserPlus size={16} />
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;