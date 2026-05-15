import { Link } from "react-router";
import {
    BookOpen,
    Monitor,
    BedDouble,
    Pencil,
    ShoppingBag,
    Volleyball,
    MoreHorizontal,
    Tag,
    ShieldCheck,
    Leaf,
    Users,
    FilePlus,
    MessageCircle,
    Handshake,
    ArrowRight,
} from "lucide-react";

import bgImage from "../assets/background.png";

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
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section
                className="w-full overflow-hidden bg-[#061f3d] bg-cover bg-center bg-no-repeat shadow-xl"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="grid min-h-[560px] lg:grid-cols-2">
                    {/* Left Hero Content */}
                    <div className="flex flex-col justify-center bg-gradient-to-r from-[#061f3d] to-transparent px-8 pb-16 pt-8 sm:px-12">
                        <h1 className="text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl xl:text-6xl">
                            <span className="text-[#67db74]">Exchange</span> more.
                            <br />
                            <span className="text-[#67db74]">Spend</span> less.
                            <br />
                            Empower together.
                        </h1>

                        <p className="mt-7 max-w-lg text-base leading-7 text-slate-200">
                            The trusted marketplace for Kelaniya students to buy, sell,
                            and exchange with ease.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-5">
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

                    {/* Right Side Background Visual */}
                    <div className="relative hidden items-center justify-center lg:flex"></div>
                </div>

                <div className="h-2 bg-gradient-to-r from-[#061f3d] via-[#18804c] to-[#1aa65d]"></div>
            </section>

            {/* Features Strip */}
            <section className="mx-auto max-w-[1450px] px-6 pt-8 sm:px-8">
                <div className="grid gap-6 rounded-[28px] bg-[#f4faf6] px-6 py-8 shadow-sm sm:px-8 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={index}
                                className="flex items-start gap-4 lg:border-r lg:border-[#dceee3] lg:pr-6 last:border-r-0"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e4f4ea] text-[#15945a]">
                                    <Icon size={28} strokeWidth={2.2} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-extrabold text-[#13253f]">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Explore Categories */}
            <section className="mx-auto max-w-[1450px] px-6 py-10 sm:px-8">
                <div className="mb-7 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-[#13253f]">
                        Explore Categories
                    </h2>

                    <Link
                        to="/marketplace"
                        className="hidden items-center gap-2 text-sm font-bold text-[#15945a] transition hover:underline sm:flex"
                    >
                        View all categories
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    {categories.map((category, index) => {
                        const Icon = category.icon;

                        return (
                            <Link
                                key={index}
                                to={`/marketplace?category=${category.value}`}
                                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div
                                    className={`flex h-[145px] items-center justify-center ${category.color}`}
                                >
                                    <Icon
                                        size={54}
                                        strokeWidth={1.8}
                                        className="transition duration-300 group-hover:scale-110"
                                    />
                                </div>

                                <div className="px-3 py-4 text-center">
                                    <h3 className="text-sm font-extrabold text-[#13253f]">
                                        {category.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Browse items
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-6 sm:hidden">
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#15945a] transition hover:underline"
                    >
                        View all categories
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* How It Works */}
            <section
                id="how-it-works"
                className="border-t border-slate-100 bg-[#fcfdfc] px-6 py-16 sm:px-8"
            >
                <div className="mx-auto max-w-[1200px]">
                    <h2 className="mb-14 text-center text-2xl font-extrabold text-[#13253f]">
                        How <span className="text-[#15945a]">KelaniXchange</span>{" "}
                        Works
                    </h2>

                    <div className="grid gap-12 md:grid-cols-3">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div key={index} className="relative">
                                    <div className="absolute left-1/2 top-[-28px] z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-[#07563c] text-white shadow-lg">
                                        <Icon size={28} strokeWidth={2} />
                                    </div>

                                    <div className="rounded-3xl bg-white px-8 pb-8 pt-14 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md">
                                        <div className="mb-3 text-3xl font-black text-[#2fab63]">
                                            {step.number}
                                        </div>

                                        <h3 className="text-base font-extrabold text-[#13253f]">
                                            {step.title}
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-slate-600">
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
            <section className="bg-gradient-to-r from-[#06452f] via-[#075c3e] to-[#076545] px-6 py-12 text-white sm:px-8">
                <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-10 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold leading-tight">
                            Kelaniya is our community.
                            <br />
                            Let’s{" "}
                            <span className="text-[#7bf09a]">
                                grow it together.
                            </span>
                        </h2>

                        <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50">
                            Join KelaniXchange and be part of a smarter, greener,
                            and stronger student marketplace.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <Link
                                to="/register"
                                className="rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#075c3e] shadow-md transition hover:scale-[1.02]"
                            >
                                Create Your Account
                            </Link>

                            <Link
                                to="/marketplace"
                                className="inline-flex items-center gap-2 text-sm font-bold text-white transition hover:underline"
                            >
                                Learn More
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-7 text-center sm:grid-cols-3 sm:gap-10">
                        <div>
                            <h3 className="text-3xl font-black text-[#7bf09a]">
                                2,500+
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-emerald-50">
                                Active Members
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-black text-[#7bf09a]">
                                1,200+
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-emerald-50">
                                Items Listed
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-black text-[#7bf09a]">
                                98%
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-emerald-50">
                                Positive Feedback
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}

export default Home;