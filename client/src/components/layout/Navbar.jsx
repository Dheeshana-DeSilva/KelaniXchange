import { Link } from "react-router";
import logo from "../../assets/X_logo.png";

function Navbar() {
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 w-full bg-[#061f3d]/80 backdrop-blur-md shadow-md border-b border-white/10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
                <img
                    src={logo}
                    alt="KelaniXchange Logo"
                    className="h-9 w-9 object-contain"
                />

                <h1 className="text-xl font-bold text-white">
                    Kelani<span className="text-[#47c978]">Xchange</span>
                </h1>
            </Link>

            {/* Center Navigation */}
            <div className="hidden items-center gap-12 lg:flex">
                <Link
                    to="/marketplace"
                    className="text-sm font-medium text-white transition hover:text-[#47c978]"
                >
                    Marketplace
                </Link>

                <a
                    href="#how-it-works"
                    className="text-sm font-medium text-white transition hover:text-[#47c978]"
                >
                    How It Works
                </a>

                <a
                    href="#about"
                    className="text-sm font-medium text-white transition hover:text-[#47c978]"
                >
                    About Us
                </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
                <Link
                    to="/login"
                    className="rounded-xl border border-[#47c978]/70 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#47c978]/10"
                >
                    Log In
                </Link>

                <Link
                    to="/register"
                    className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#06213d] transition hover:bg-slate-100"
                >
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;