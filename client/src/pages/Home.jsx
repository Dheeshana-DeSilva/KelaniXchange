import { Link } from "react-router";
import {
    BookOpen,
    Monitor,
    BedDouble,
    Pencil,
    ShoppingBag,
    Volleyball,
    MoreHorizontal,
} from "lucide-react";
import bgImage from "../assets/background.png";
import imgCalc from "../assets/scientific_calculator_1778617648280.png";
import imgStand from "../assets/laptop_stand_1778617661773.png";
import imgBook from "../assets/engineering_math_book_1778617677356.png";
import imgBag from "../assets/black_backpack_1778617692980.png";
import imgEarbuds from "../assets/wireless_earbuds_1778617708014.png";


const categories = [
    {
        name: "Books",
        value: "books",
        icon: BookOpen,
        color: "bg-blue-50 text-blue-500",
    },
    {
        name: "Electronics",
        value: "electronics",
        icon: Monitor,
        color: "bg-green-50 text-green-600",
    },
    {
        name: "Furniture",
        value: "furniture",
        icon: BedDouble,
        color: "bg-indigo-50 text-indigo-500",
    },
    {
        name: "Stationery",
        value: "stationery",
        icon: Pencil,
        color: "bg-orange-50 text-orange-500",
    },
    {
        name: "Clothing",
        value: "clothing",
        icon: ShoppingBag,
        color: "bg-purple-50 text-purple-500",
    },
    {
        name: "Sports",
        value: "sports",
        icon: Volleyball,
        color: "bg-red-50 text-red-500",
    },
    {
        name: "Others",
        value: "others",
        icon: MoreHorizontal,
        color: "bg-slate-100 text-slate-600",
    },
];

const featuredListings = [
    { title: "Scientific Calculator", desc: "Casio fx-991ES", price: "Rs. 2,000", tag: "Good", img: imgCalc },
    { title: "Laptop Stand", desc: "Adjustable Aluminium", price: "Rs. 1,500", tag: "Like New", img: imgStand },
    { title: "Engineering Mathematics", desc: "Textbook", price: "Rs. 800", tag: "Good", img: imgBook },
    { title: "Backpack", desc: "Waterproof - Black", price: "Rs. 1,800", tag: "Like New", img: imgBag },
    { title: "Wireless Earbuds", desc: "Noise Cancelling", price: "Rs. 2,200", tag: "New", img: imgEarbuds },
];

function Home() {
    return (
        <main className="min-h-screen bg-white pb-20">
            {/* Landing Hero Card */}
            <section
                className="w-full overflow-hidden bg-[#061f3d] shadow-xl bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="grid min-h-[560px] lg:grid-cols-2">
                    {/* Left Hero Content */}
                    <div className="flex flex-col justify-center px-12 pb-16 pt-8 bg-gradient-to-r from-[#061f3d] to-transparent">
                        <h1 className="text-5xl font-extrabold leading-[1.15] text-white xl:text-6xl">
                            <span className="text-[#67db74]">Exchange</span> more.
                            <br />
                            <span className="text-[#67db74]">Spend</span> less.
                            <br />
                            Empower together.
                        </h1>

                        <p className="mt-7 max-w-lg text-base leading-7 text-slate-200">
                            The trusted marketplace for Kelaniya students to buy, sell, and
                            exchange with ease.
                        </p>

                        <div className="mt-9 flex items-center gap-5">
                            <Link
                                to="/marketplace"
                                className="rounded-xl bg-gradient-to-r from-[#48c96f] to-[#25a95b] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:scale-[1.02]"
                            >
                                Explore Marketplace
                            </Link>

                            <a
                                href="#how-it-works"
                                className="rounded-xl border border-[#48c96f] px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                How It Works
                            </a>
                        </div>
                    </div>

                    {/* Right Hero Visual */}
                    <div className="relative hidden items-center justify-center lg:flex">
                        {/* Empty right side to let the background image show, white box removed as requested */}
                    </div>
                </div>

                {/* Bottom soft green line like the design */}
                <div className="h-2 bg-gradient-to-r from-[#061f3d] via-[#18804c] to-[#1aa65d]"></div>
            </section>

            <div className="mx-auto max-w-[1400px] px-8 mt-4">
                {/* Shop by Category */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-[#13253f]">Shop by Category</h2>
                        <Link
                            to="/marketplace"
                            className="text-sm font-bold text-[#2fab63] hover:underline"
                        >
                            View all

                        </Link>
                    </div>

                    <div className="flex justify-between gap-4 overflow-x-auto pb-4">
                        {categories.map((cat, idx) => {
                            const Icon = cat.icon;

                            return (
                                <Link
                                    key={idx}
                                    to={`/marketplace?category=${cat.value}`}
                                    className="flex min-w-[100px] flex-col items-center gap-3"
                                >
                                    <div
                                        className={`flex h-[100px] w-[100px] cursor-pointer items-center justify-center rounded-3xl transition-transform hover:scale-105 ${cat.color}`}
                                    >
                                        <Icon size={32} strokeWidth={2} />
                                    </div>

                                    <span className="text-sm font-semibold text-slate-700">
                                        {cat.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                </section>

                {/* Featured Listings */}
                <section>
                    <div className="flex flex-col mb-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#13253f]">Featured Listings</h2>
                            <Link
                                to="/marketplace"
                                className="text-sm font-bold text-[#2fab63] hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <p className="text-slate-500 mt-1 text-sm">Handpicked deals from your campus</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {featuredListings.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                {/* Image Container */}
                                <div className="relative h-[220px] bg-[#f4f6f8] p-4 flex items-center justify-center">
                                    <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                        </svg>
                                    </button>
                                    <img src={item.img} alt={item.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                </div>
                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-[#13253f] text-[15px] truncate">{item.title}</h3>
                                    <p className="text-slate-500 text-xs mt-1 truncate">{item.desc}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-bold text-[#2fab63] text-base">{item.price}</span>
                                        <span className="px-3 py-1 bg-[#eaf6ef] text-[#2fab63] text-[10px] font-bold rounded-full">{item.tag}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Home;
