import { Link } from "react-router";
import bgImage from "../assets/background.png";
import imgCalc from "../assets/scientific_calculator_1778617648280.png";
import imgStand from "../assets/laptop_stand_1778617661773.png";
import imgBook from "../assets/engineering_math_book_1778617677356.png";
import imgBag from "../assets/black_backpack_1778617692980.png";
import imgEarbuds from "../assets/wireless_earbuds_1778617708014.png";

const categories = [
    { name: "Books", color: "text-blue-500", bg: "bg-blue-50", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> },
    { name: "Electronics", color: "text-green-500", bg: "bg-green-50", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg> },
    { name: "Furniture", color: "text-indigo-500", bg: "bg-indigo-50", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h1.5C8.328 3.75 9 4.422 9 5.25V18a2.25 2.25 0 0 1-2.25 2.25h-3A2.25 2.25 0 0 1 1.5 18V6ZM15 6a2.25 2.25 0 0 1 2.25-2.25h1.5A2.25 2.25 0 0 1 21 6v12a2.25 2.25 0 0 1-2.25 2.25h-3A2.25 2.25 0 0 1 13.5 18V6Z" /></svg> },
    { name: "Stationery", color: "text-orange-500", bg: "bg-orange-50", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg> },
    { name: "Clothing", color: "text-purple-500", bg: "bg-purple-50", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
    { name: "Sports", color: "text-red-500", bg: "bg-red-50", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0ZM12 2.25v19.5m-8.182-5.454 16.364-10.9m-16.364 0 16.364 10.9" /></svg> },
    { name: "Others", color: "text-gray-500", bg: "bg-gray-100", icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg> }
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
                        <a href="#" className="text-sm font-bold text-[#2fab63] hover:underline">View all</a>
                    </div>
                    
                    <div className="flex justify-between gap-4 overflow-x-auto pb-4">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 min-w-[100px]">
                                <div className={`w-[100px] h-[100px] rounded-3xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${cat.bg} ${cat.color}`}>
                                    {cat.icon}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured Listings */}
                <section>
                    <div className="flex flex-col mb-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#13253f]">Featured Listings</h2>
                            <a href="#" className="text-sm font-bold text-[#2fab63] hover:underline">View all</a>
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
