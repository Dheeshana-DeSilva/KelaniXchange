import { Link } from "react-router";
import {
    ArrowRight,
    Bell,
    BookOpen,
    CheckCircle2,
    Handshake,
    Heart,
    HelpCircle,
    MessageCircle,
    PackageCheck,
    RefreshCw,
    Search,
    ShieldCheck,
    ShoppingBag,
    Star,
    Store,
    Tag,
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
    { name: "Books & Stationery", value: "books-and-stationery", image: catBooksStationery, bg: "bg-sky-50" },
    { name: "Electronics", value: "electronics", image: catElectronics, bg: "bg-rose-50" },
    { name: "Furniture", value: "furniture", image: catFurniture, bg: "bg-indigo-50" },
    { name: "Fashion & Accessories", value: "fashion-and-accessories", image: catFashionAccessories, bg: "bg-fuchsia-50" },
    { name: "Sports & Outdoor", value: "sports-and-outdoor", image: catSportsOutdoor, bg: "bg-emerald-50" },
    { name: "Vehicles", value: "vehicles", image: catVehicles, bg: "bg-amber-50" },
    { name: "Others", value: "others", image: catOthers, bg: "bg-slate-100" },
];

const highlights = [
    {
        title: "Buy What You Need",
        description: "Find textbooks, electronics, furniture, accessories, and everyday campus essentials from other Kelaniya students.",
        icon: ShoppingBag,
    },
    {
        title: "Sell With Order Tracking",
        description: "Create listings, receive buyer orders, update handover status, and manage sales from one dashboard.",
        icon: Store,
    },
    {
        title: "Exchange Instead Of Paying",
        description: "Offer one of your own listings for an exchange when a seller enables exchange requests.",
        icon: RefreshCw,
    },
    {
        title: "Recover Lost Items",
        description: "Use Lost & Found posts to report found items or search for belongings around campus.",
        icon: HelpCircle,
    },
];

const workflow = [
    {
        title: "Browse or create a listing",
        description: "Search by category, price, condition, and location, or post your own item with photos and quantity.",
        icon: Search,
    },
    {
        title: "Talk before the handover",
        description: "Use chat, wishlist, notifications, and seller profiles to confirm details before meeting.",
        icon: MessageCircle,
    },
    {
        title: "Complete and review",
        description: "After a completed order or exchange, buyers can rate the seller and leave useful feedback.",
        icon: Star,
    },
];

const trustPoints = [
    "Seller ratings appear on profiles and listing details.",
    "Feedback is allowed only after completed orders or exchanges.",
    "One review is allowed per completed transaction.",
];

const userPaths = [
    {
        title: "For Buyers",
        icon: PackageCheck,
        items: ["Use cart or buy now", "Track My Orders", "Retry failed bank transfer payment", "Review sellers after completion"],
    },
    {
        title: "For Sellers",
        icon: Tag,
        items: ["Create listings with photos", "Manage My Sales", "Update payment and handover status", "Show rating on your profile"],
    },
    {
        title: "For Exchanges",
        icon: Handshake,
        items: ["Send item-for-item offers", "Accept or reject requests", "Mark accepted exchanges completed", "Track sent and received offers"],
    },
];

function Home() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#48c96f] selection:text-white">
            <section
                className="relative min-h-[calc(100vh-24px)] overflow-hidden bg-[#0a192f] bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-[#0a192f]/82" />

                <div className="relative mx-auto grid max-w-[1450px] gap-10 px-6 pb-16 pt-32 sm:px-12 lg:min-h-[calc(100vh-24px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-50">
                            <ShieldCheck size={14} />
                            Built for the University of Kelaniya community
                        </div>

                        <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                            Buy, sell, exchange, and recover campus items in one place.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-200 sm:text-lg">
                            KelaniXchange helps students trade textbooks, electronics, furniture, accessories, and everyday items with chat, order tracking, exchange requests, seller feedback, and lost-and-found support.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                to="/marketplace"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#48c96f] px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#3db65e]"
                            >
                                Browse Marketplace
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/marketplace/create"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-white/15"
                            >
                                Sell an Item
                            </Link>
                            <Link
                                to="/lost-found"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-white/15"
                            >
                                Lost & Found
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md lg:p-5">
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#15945a]">
                                    <BookOpen size={22} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Textbook listing</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">Condition, quantity, seller rating, and chat are available before purchase.</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <RefreshCw size={22} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Exchange request</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">Offer your own item, then mark the exchange completed after handover.</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Star size={22} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Seller feedback</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">Completed buyers can leave 1-5 star ratings and short comments.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1450px] px-6 py-14 sm:px-12">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {highlights.map(({ title, description, icon: Icon }) => (
                        <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#15945a]">
                                <Icon size={24} />
                            </div>
                            <h2 className="mt-4 text-base font-black text-slate-900">{title}</h2>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-[1450px] px-6 py-10 sm:px-12">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Shop By Category</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">Start with the items students usually need around campus.</p>
                    </div>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-black text-[#15945a]">
                        View all listings
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                    {categories.map((category) => (
                        <Link
                            key={category.value}
                            to={`/marketplace?category=${category.value}`}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className={`h-28 ${category.bg}`}>
                                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div className="p-3 text-center">
                                <p className="text-xs font-black text-slate-800">{category.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section id="how-it-works" className="mx-auto max-w-[1200px] px-6 py-16 sm:px-12">
                <div className="text-center">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">How KelaniXchange Works</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                        The flow is simple enough for quick student deals, but structured enough to track what happened.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {workflow.map(({ title, description, icon: Icon }, index) => (
                        <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                                    <Icon size={22} />
                                </div>
                                <span className="text-xs font-black text-slate-300">0{index + 1}</span>
                            </div>
                            <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid max-w-[1200px] gap-8 px-6 sm:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#15945a]">
                            <ShieldCheck size={14} />
                            Trust and safety
                        </div>
                        <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Built-in feedback and safer campus trading.
                        </h2>
                        <p className="mt-4 text-sm font-medium leading-7 text-slate-500">
                            KelaniXchange keeps trading transparent by connecting completed transactions to seller ratings and clear order or exchange status.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/safety" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white">
                                Safety Tips
                                <ArrowRight size={15} />
                            </Link>
                            <Link to="/help" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-700">
                                Help Center
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        {trustPoints.map((point) => (
                            <div key={point} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <CheckCircle2 className="h-5 w-5 text-[#15945a]" />
                                <p className="text-sm font-semibold leading-6 text-slate-600">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Made For Real Student Workflows</h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">Each area connects to an actual part of the app.</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {userPaths.map(({ title, icon: Icon, items }) => (
                        <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#15945a]">
                                    <Icon size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">{title}</h3>
                            </div>
                            <ul className="mt-5 space-y-3">
                                {items.map((item) => (
                                    <li key={item} className="flex gap-2 text-sm font-semibold text-slate-600">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15945a]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            <section className="px-6 pb-20 sm:px-12">
                <div className="mx-auto max-w-[1200px] rounded-2xl bg-[#0a192f] p-6 text-white sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Ready to use KelaniXchange?</h2>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                                Browse listings, create your first post, check notifications, or save items to your wishlist.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#0a192f]">
                                Create Account
                            </Link>
                            <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white">
                                Explore Now
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                            <Bell className="text-[#48c96f]" size={19} />
                            Real-time notifications
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                            <Heart className="text-[#48c96f]" size={19} />
                            Wishlist support
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                            <MessageCircle className="text-[#48c96f]" size={19} />
                            Built-in chat
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;
