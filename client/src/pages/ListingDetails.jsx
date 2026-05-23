import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
    ArrowLeft, Calendar, MapPin, Tag, ShieldCheck, 
    Mail, User, Star, ArrowUpDown, Loader2, AlertCircle 
} from "lucide-react";
import { getListingById } from "../services/listingService";

import catBooksStationery from "../assets/category_books_stationery.png";
import catElectronics from "../assets/category_electronics_v2.png";
import catFurniture from "../assets/category_furniture_v2.png";
import catFashionAccessories from "../assets/category_fashion_accessories.png";
import catOthers from "../assets/category_others_v2.png";
import catVehicles from "../assets/category_vehicles.png";
import catSportsOutdoor from "../assets/category_sports_outdoor.png";

const CATEGORY_IMAGES = {
    "books-and-stationery": catBooksStationery,
    "electronics": catElectronics,
    "furniture": catFurniture,
    "fashion-and-accessories": catFashionAccessories,
    "sports-and-outdoor": catSportsOutdoor,
    "vehicles": catVehicles,
    "others": catOthers,
};

const CATEGORIES = [
    { label: "Books & Stationery", value: "books-and-stationery" },
    { label: "Electronics", value: "electronics" },
    { label: "Furniture", value: "furniture" },
    { label: "Fashion & Accessories", value: "fashion-and-accessories" },
    { label: "Sports & Outdoor", value: "sports-and-outdoor" },
    { label: "Vehicles", value: "vehicles" },
    { label: "Others", value: "others" },
];

export default function ListingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getListingById(id);
                setListing(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching listing details:", err);
                setError(err.response?.data?.message || "Failed to load listing details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[#48c96f] mx-auto" size={40} />
                    <p className="text-slate-500 font-medium text-sm">Loading listing details...</p>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-800">Error Occurred</h3>
                        <p className="text-sm text-slate-500">{error || "The listing you are looking for does not exist."}</p>
                    </div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 text-white font-bold py-3 hover:bg-slate-900 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const catName = CATEGORIES.find(c => c.value === listing.category)?.label || listing.category?.replace(/-/g, " ");
    const images = listing.images && listing.images.length > 0 ? listing.images : [CATEGORY_IMAGES[listing.category] || catOthers];
    const mainImage = images[activeImageIndex] || catOthers;

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Back button */}
                <div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-all text-sm font-semibold hover:border-slate-300"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>

                {/* Main Card Grid */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* Left Column: Image/Gallery */}
                    <div className="lg:col-span-7 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between space-y-6">
                        {/* Main Image container */}
                        <div className="flex-1 min-h-[300px] max-h-[460px] rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-6 overflow-hidden relative shadow-inner">
                            {listing.isFeatured && (
                                <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-sm">
                                    <Star size={12} className="fill-amber-600 text-amber-600 animate-pulse" /> FEATURED
                                </span>
                            )}
                            <img 
                                src={mainImage} 
                                alt={listing.title} 
                                className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 hover:scale-105" 
                            />
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin">
                                {images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`h-16 w-16 rounded-xl border-2 bg-white flex items-center justify-center p-1.5 shrink-0 transition-all ${
                                            activeImageIndex === idx ? "border-[#48c96f] shadow-md scale-95" : "border-slate-200 hover:border-slate-400"
                                        }`}
                                    >
                                        <img src={img} alt="" className="max-h-full max-w-full object-contain rounded-md" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Listing Details */}
                    <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-8 bg-white">
                        <div className="space-y-6">
                            
                            {/* Tags / Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
                                    <Tag size={12} /> {catName}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                                    listing.condition === "New" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    listing.condition === "Like New" ? "bg-sky-50 text-sky-700 border-sky-200" :
                                    listing.condition === "Good" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    "bg-slate-50 text-slate-700 border-slate-200"
                                }`}>
                                    {listing.condition}
                                </span>
                                {listing.isExchangeAvailable && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#15945a] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                                        <ArrowUpDown size={12} /> Exchange Available
                                    </span>
                                )}
                            </div>

                            {/* Title & Price */}
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                                    {listing.title}
                                </h1>
                                <p className="text-3xl font-black text-[#15945a]">
                                    Rs. {Number(listing.price).toLocaleString()}
                                </p>
                            </div>

                            {/* Details Table */}
                            <div className="border-y border-slate-100 py-4 space-y-3.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={15} /> Location</span>
                                    <span className="text-slate-700 font-bold">{listing.location || "Kelaniya Campus"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5"><Calendar size={15} /> Added on</span>
                                    <span className="text-slate-700 font-bold">{new Date(listing.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5"><ShieldCheck size={15} /> Status</span>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                        listing.status === "available" || listing.status === "active"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                        {listing.status}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Description</h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {listing.description}
                                </p>
                            </div>
                        </div>

                        {/* Seller Box / Actions */}
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300 shadow-sm shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Listed by</p>
                                        <p className="text-sm font-black text-slate-700">@{listing.seller?.username || "student_seller"}</p>
                                    </div>
                                </div>
                                
                                {listing.seller?.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium border-t border-slate-200/50 pt-2.5">
                                        <Mail size={13} />
                                        <span>{listing.seller.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Contact CTA */}
                            {listing.seller?.email && (
                                <a 
                                    href={`mailto:${listing.seller.email}?subject=Inquiry about ${listing.title} on KelaniXchange`}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] hover:bg-[#3db65e] text-white font-bold py-3.5 shadow-md shadow-emerald-100 hover:shadow-lg transition-all text-sm"
                                >
                                    <Mail size={16} /> Contact Seller via Email
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Safety Guidelines */}
                <div className="bg-amber-50/50 rounded-2xl border border-amber-200/60 p-6 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800 shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-amber-900">KelaniXchange Safety Tip</h4>
                        <p className="text-xs text-amber-700/90 leading-relaxed">
                            For physical handovers and exchanges, we highly recommend meeting in public spaces inside the University of Kelaniya campus (e.g., near the library, student center, or canteen) during daylight hours. Inspect the item thoroughly before making any payments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
