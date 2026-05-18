import React from 'react';
import { 
    ShieldCheck, 
    RefreshCw, 
    MessageCircle, 
    ShoppingBag, 
    Heart, 
    Briefcase
} from 'lucide-react';

const features = [
    {
        title: "Buy, Sell & Exchange",
        description: "List your items, buy what you need, or propose an exchange using your own listings. Sellers can choose to accept direct purchases, item exchanges, or both.",
        icon: RefreshCw,
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        title: "Real-Time Chat",
        description: "Communicate directly with sellers and buyers through our built-in instant messaging system. Discuss details, negotiate prices, and arrange safe meetups.",
        icon: MessageCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-50"
    },
    {
        title: "Support Student Businesses",
        description: "Discover products from student-run small businesses. Student entrepreneurs can showcase their business name and products seamlessly in the same marketplace.",
        icon: Briefcase,
        color: "text-purple-500",
        bg: "bg-purple-50"
    },
    {
        title: "Wishlist & Notifications",
        description: "Save items for later and get real-time alerts for exchange requests, accepted offers, and new chat messages so you never miss a deal.",
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-50"
    },
    {
        title: "Flexible Profiles",
        description: "Use your real name or stay anonymous. Easily view and manage all your active listings, edit details, and track your wishlist items from one place.",
        icon: ShoppingBag,
        color: "text-amber-500",
        bg: "bg-amber-50"
    },
    {
        title: "Safe & Secure",
        description: "Enjoy peace of mind with encrypted data, strict authentication, and a dedicated admin team monitoring the platform to prevent fake or inappropriate listings.",
        icon: ShieldCheck,
        color: "text-indigo-500",
        bg: "bg-indigo-50"
    }
];

function About() {
    return (
        <main className="min-h-screen bg-slate-50 selection:bg-[#48c96f] selection:text-white pb-20 pt-28">
            {/* Hero Section */}
            <div className="mx-auto max-w-[1200px] px-6 sm:px-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#15945a] text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
                    About Our Platform
                </div>
                <h1 className="text-4xl font-black leading-tight text-[#0a192f] sm:text-5xl lg:text-6xl tracking-tight mb-6">
                    Empowering the <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15945a] to-[#48c96f]">Kelaniya Community</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-slate-500 leading-relaxed font-medium">
                    KelaniXchange is an exclusive student marketplace designed to make buying, selling, and exchanging items within the University of Kelaniya safer, easier, and more sustainable.
                </p>
            </div>

            {/* Platform Overview */}
            <div className="mx-auto max-w-[1200px] px-6 sm:px-12 mt-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] p-8 sm:p-12 shadow-xl shadow-slate-200/40 border border-slate-100">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-6">What is KelaniXchange?</h2>
                        <div className="space-y-6 text-slate-500 leading-relaxed">
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Our Purpose</h4>
                                <p>We believe in the power of a centralized, secure circular economy. KelaniXchange brings the entire university marketplace into one hub to make student life easier and more sustainable.</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">What You Can Do Here</h4>
                                <p>Whether you're looking to clear out your old textbooks, find a used laptop, or trade items you no longer need for things you want, you can seamlessly buy, sell, and exchange items.</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Why KelaniXchange?</h4>
                                <p>Every user on our platform is a member of the Kelaniya community, ensuring a much higher level of trust and convenience when arranging meetups and finalizing deals securely on campus.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#0a192f] to-[#13253f] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#48c96f]/20 rounded-full blur-[80px]"></div>
                        <div className="relative z-10">
                            <ShieldCheck className="w-12 h-12 text-[#48c96f] mb-6" />
                            <h3 className="text-2xl font-bold mb-6">Why Choose KelaniXchange</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#48c96f] shrink-0 mt-2"></div>
                                    <span className="text-slate-300 font-medium">Easy-to-use marketplace</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#48c96f] shrink-0 mt-2"></div>
                                    <span className="text-slate-300 font-medium">Buy, sell, or exchange options</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#48c96f] shrink-0 mt-2"></div>
                                    <span className="text-slate-300 font-medium">Support for small student businesses</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#48c96f] shrink-0 mt-2"></div>
                                    <span className="text-slate-300 font-medium">Use your real name or stay anonymous for privacy</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#48c96f] shrink-0 mt-2"></div>
                                    <span className="text-slate-300 font-medium">Direct communication between buyers and sellers</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Features Grid */}
            <div className="mx-auto max-w-[1200px] px-6 sm:px-12 mt-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900">Everything You Need</h2>
                    <p className="mt-4 text-slate-500 font-medium">A complete feature set to make student trading effortless.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                                    <Icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Small Business Highlight */}
            <div className="mx-auto max-w-[1200px] px-6 sm:px-12 mt-24">
                <div className="bg-gradient-to-br from-[#0a192f] via-[#0d2a42] to-[#0a192f] rounded-[3rem] p-8 sm:p-16 overflow-hidden relative shadow-2xl flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#15945a]/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                    <div className="relative z-10 md:w-2/3">
                        <h2 className="text-3xl font-black text-white mb-4">Are you a Student Entrepreneur?</h2>
                        <p className="text-slate-300 leading-relaxed text-lg max-w-xl font-medium">
                            KelaniXchange actively supports student-run small businesses. Create listings, add your business name and details to your profile, and showcase your products directly in our marketplace alongside standard listings to reach the entire campus.
                        </p>
                    </div>
                    <div className="relative z-10 md:w-1/3 flex justify-center md:justify-end">
                        <div className="w-32 h-32 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-center text-[#48c96f] transform rotate-3 transition-transform hover:rotate-6">
                            <Briefcase size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Closing Line */}
            <div className="mx-auto max-w-[1200px] px-6 sm:px-12 mt-28 text-center pb-8">
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                    "Connecting students, ideas, and opportunities <br className="hidden sm:block" />
                    through a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15945a] to-[#48c96f]">smarter marketplace.</span>"
                </p>
            </div>
        </main>
    );
}

export default About;
