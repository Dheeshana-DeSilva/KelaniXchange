import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
    Tag,
    ShieldCheck,
    Leaf,
    Users,
    FilePlus,
    MessageCircle,
    Handshake,
    ArrowRight,
    TrendingUp,
    Zap,
    BookOpen,
    Monitor
} from "lucide-react";

import catBooksStationery from "../assets/category_books_stationery.png";
import catElectronics from "../assets/category_electronics_v2.png";
import catFurniture from "../assets/category_furniture_v2.png";
import catFashionAccessories from "../assets/category_fashion_accessories.png";
import catOthers from "../assets/category_others_v2.png";
import catVehicles from "../assets/category_vehicles.png";
import catSportsOutdoor from "../assets/category_sports_outdoor.png";

import bgImage from "../assets/background.png";

const categories = [
    {
        name: "Books & Stationery",
        value: "books-and-stationery",
        image: catBooksStationery,
        bg: "bg-blue-50",
    },
    {
        name: "Electronics",
        value: "electronics",
        image: catElectronics,
        bg: "bg-red-50",
    },
    {
        name: "Furniture",
        value: "furniture",
        image: catFurniture,
        bg: "bg-indigo-50",
    },
    {
        name: "Fashion & Accessories",
        value: "fashion-and-accessories",
        image: catFashionAccessories,
        bg: "bg-purple-50",
    },
    {
        name: "Sports & Outdoor",
        value: "sports-and-outdoor",
        image: catSportsOutdoor,
        bg: "bg-emerald-50",
    },
    {
        name: "Vehicles",
        value: "vehicles",
        image: catVehicles,
        bg: "bg-yellow-50",
    },
    {
        name: "Others",
        value: "others",
        image: catOthers,
        bg: "bg-slate-100",
    },
];

const features = [
    {
        title: "Local & Trusted",
        description: "Buy and sell with real students in your community.",
        icon: Tag,
    },
    {
        title: "Safe & Secure",
        description: "Secure conversations and safer transactions.",
        icon: ShieldCheck,
    },
    {
        title: "Sustainable",
        description: "Give items a second life and reduce waste.",
        icon: Leaf,
    },
    {
        title: "Easy to Use",
        description: "Simple listings, smooth chats, quick deals.",
        icon: Users,
    },
];

const steps = [
    {
        number: "1",
        title: "List Your Item",
        description: "Post your item in minutes with photos, details, and price.",
        icon: FilePlus,
    },
    {
        number: "2",
        title: "Connect & Chat",
        description: "Buyers message you directly. Ask questions and negotiate easily.",
        icon: MessageCircle,
    },
    {
        number: "3",
        title: "Close the Deal",
        description: "Meet safely and complete the sale or exchange.",
        icon: Handshake,
    },
];

function Home() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location]);

    return (
        <main className="min-h-screen bg-slate-50 selection:bg-[#48c96f] selection:text-white pb-10">
            {/* Hero Section */}
            <section
                className="relative w-full overflow-hidden bg-[#0a192f] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/95 via-[#0a192f]/80 to-[#0a192f]/95"></div>

                {/* Animated glowing orbs */}
                <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-[#48c96f]/20 blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 right-10 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[150px] mix-blend-screen"></div>

                <div className="relative z-10 grid min-h-[100vh] lg:grid-cols-2 max-w-[1450px] mx-auto px-6 sm:px-12 pt-28 pb-20">
                    {/* Left Hero Content */}
                    <div className="flex flex-col justify-center">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit mb-8 shadow-xl">

                            <span className="text-xs font-bold tracking-wide text-emerald-50 uppercase">Online Marketplace for Kelaniya Students</span>
                        </div>

                        <h1 className="text-5xl font-black leading-[1.1] text-white sm:text-6xl lg:text-7xl tracking-tight">
                            The Smart Way to <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48c96f] to-[#12814e]">Exchange</span> & Connect
                        </h1>

                        <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300 font-medium">
                            Join the premier marketplace built exclusively for the Kelaniya university community. Buy, sell, and discover items with your peers safely and seamlessly.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-5">
                            <Link
                                to="/marketplace"
                                className="group relative rounded-full px-8 py-4 font-bold text-white transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#48c96f] to-[#15945a] transition-transform group-hover:scale-105"></div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    Explore Marketplace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>

                            <a
                                href="#how-it-works"
                                className="rounded-full px-8 py-4 font-bold text-white transition-all border border-white/20 hover:bg-white/10 backdrop-blur-sm"
                            >
                                How It Works
                            </a>
                        </div>

                        {/* Quick Stats in Hero */}
                        <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
                            <div>
                                <h4 className="text-2xl font-black text-white">1.2k+</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Active Listings</p>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div>
                                <h4 className="text-2xl font-black text-white">24h</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Avg. Sale Time</p>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div>
                                <h4 className="text-2xl font-black text-white">100%</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Secure</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Background Visual - Floating elements */}
                    <div className="relative hidden items-center justify-center lg:flex">
                        <div className="relative w-[500px] h-[500px]">
                            {/* Decorative UI Cards floating */}
                            <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl animate-[bounce_6s_infinite] transform rotate-3 z-20">
                                <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                        <BookOpen className="text-blue-400 w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">Engineering Books</p>
                                        <p className="text-[#48c96f] font-bold text-sm">Rs. 1,500</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-20 left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl animate-[bounce_7s_infinite] transform -rotate-3 z-20" style={{ animationDelay: '1s' }}>
                                <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                        <Monitor className="text-red-400 w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">Gaming Monitor</p>
                                        <p className="text-[#48c96f] font-bold text-sm">Rs. 35,000</p>
                                    </div>
                                </div>
                            </div>

                            {/* Central glowing element */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                <div className="w-32 h-32 bg-gradient-to-tr from-[#48c96f] to-[#12814e] rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                <div className="absolute inset-0 w-32 h-32 bg-white/5 border border-white/20 rounded-full backdrop-blur-2xl flex items-center justify-center shadow-[0_0_50px_rgba(72,201,111,0.3)]">
                                    <TrendingUp className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="relative mx-auto max-w-[1450px] px-6 sm:px-12 -mt-10 z-20">
                <div className="grid gap-6 rounded-3xl bg-white/80 backdrop-blur-xl px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white sm:px-12 md:grid-cols-2 lg:grid-cols-4 ring-1 ring-slate-100">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={index}
                                className="group flex items-start gap-5 lg:border-r lg:border-slate-100 lg:pr-8 last:border-r-0"
                            >
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-[#15945a] shadow-inner transition-transform duration-300 group-hover:scale-110">
                                    <Icon size={28} strokeWidth={2} />
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#15945a] transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Explore Categories */}
            <section className="mx-auto max-w-[1450px] px-6 py-24 sm:px-12">
                <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            Explore Categories
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">Find exactly what you're looking for</p>
                    </div>

                    <Link
                        to="/marketplace"
                        className="hidden items-center gap-2 text-sm font-bold text-[#15945a] transition-all hover:gap-3 sm:flex group bg-emerald-50 px-5 py-2.5 rounded-full hover:bg-emerald-100"
                    >
                        View all
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            to={`/marketplace?category=${category.value}`}
                            className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50"
                        >
                            {/* Image area */}
                            <div className={`relative h-32 w-full overflow-hidden ${category.bg}`}>
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Label */}
                            <div className="px-4 py-5 text-center bg-white border-t border-slate-50">
                                <h3 className="text-sm font-bold text-slate-900">
                                    {category.name}
                                </h3>
                                <div className="mt-2 w-8 h-1 bg-slate-100 rounded-full mx-auto transition-all duration-300 group-hover:w-16 group-hover:bg-[#15945a]"></div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 flex justify-center sm:hidden">
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#15945a] bg-emerald-50 px-6 py-3 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                        View all categories
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* How It Works */}
            <section
                id="how-it-works"
                className="px-6 py-12 sm:px-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-60"></div>

                <div className="mx-auto max-w-[1200px] relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15945a] to-[#48c96f]">KelaniXchange</span> Works
                        </h2>
                        <p className="text-slate-500 mt-3 text-sm font-medium max-w-xl mx-auto">Three simple steps to start turning your unused items into cash or finding great deals from fellow students.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 z-0"></div>

                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div key={index} className="relative z-10 group">
                                    <div className="flex flex-col items-center">
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 mb-5 transition-transform duration-500 group-hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Icon size={28} strokeWidth={1.5} className="text-[#15945a] relative z-10" />
                                            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#15945a] text-white font-bold text-xs shadow-sm">
                                                {step.number}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                                            {step.title}
                                        </h3>

                                        <p className="text-center text-sm text-slate-500 leading-relaxed max-w-[240px]">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Community CTA Section */}
            <section className="px-6 py-12 sm:px-12 bg-slate-50">
                <div className="mx-auto max-w-[1450px] rounded-[2.5rem] bg-gradient-to-br from-[#0a192f] via-[#0d2a42] to-[#0a192f] overflow-hidden relative shadow-2xl">
                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#15945a]/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-center px-8 py-12 sm:px-16">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-black leading-[1.1] text-white sm:text-4xl tracking-tight">
                                Kelaniya is our community.<br />
                                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48c96f] to-[#7bf09a]">grow it together.</span>
                            </h2>

                            <p className="mt-4 text-base leading-relaxed text-slate-300 font-medium">
                                Join KelaniXchange and be part of a smarter, greener, and stronger student marketplace. Start trading today.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link
                                    to="/register"
                                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0a192f] shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Create Account
                                </Link>

                                <Link
                                    to="/marketplace"
                                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-colors hover:text-[#48c96f]"
                                >
                                    Learn More
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 lg:grid-cols-2 lg:gap-6 w-full lg:w-auto">
                            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1 hover:bg-white/10">
                                <Users className="w-6 h-6 text-[#48c96f] mx-auto mb-3" />
                                <h3 className="text-3xl font-black text-white">5,000+</h3>
                                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Active Members
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1 hover:bg-white/10">
                                <Zap className="w-6 h-6 text-[#48c96f] mx-auto mb-3" />
                                <h3 className="text-3xl font-black text-white">1,200+</h3>
                                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Items Listed
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-md border border-white/10 transition-transform hover:-translate-y-1 hover:bg-white/10 sm:col-span-2 lg:col-span-2">
                                <ShieldCheck className="w-6 h-6 text-[#48c96f] mx-auto mb-3" />
                                <h3 className="text-3xl font-black text-white">98%</h3>
                                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Positive Feedback
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}

export default Home;