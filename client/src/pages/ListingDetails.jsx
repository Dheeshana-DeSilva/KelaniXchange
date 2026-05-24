import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
    ArrowLeft, Calendar, MapPin, Tag, ShieldCheck, 
    Mail, User, Star, ArrowUpDown, Loader2, AlertCircle, Heart, X
} from "lucide-react";
import { getListingById, getMyListings, deleteListing, updateListing } from "../services/listingService";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService";
import { createExchangeRequest } from "../services/exchangeService";
import { createReport } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

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
    const { user } = useAuth();
    
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Wishlist State
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Exchange Modal State
    const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
    const [myListings, setMyListings] = useState([]);
    const [selectedOfferId, setSelectedOfferId] = useState("");
    const [exchangeMessage, setExchangeMessage] = useState("");
    const [exchangeLoading, setExchangeLoading] = useState(false);

    // Report Modal State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("Scam suspicion");
    const [reportDescription, setReportDescription] = useState("");
    const [reportLoading, setReportLoading] = useState(false);

    // Edit Modal State (Owner)
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        category: "",
        price: 0,
        condition: "",
        location: "",
        status: "",
        isExchangeAvailable: false,
    });

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

    useEffect(() => {
        const checkWishlist = async () => {
            if (user && listing) {
                try {
                    const data = await getWishlist();
                    const list = data.wishlist || [];
                    const inWishlist = list.some(item => 
                        (typeof item === 'string' && item === id) || 
                        (item && item._id === id)
                    );
                    setIsWishlisted(inWishlist);
                } catch (err) {
                    console.error("Error checking wishlist status:", err);
                }
            }
        };
        checkWishlist();
    }, [id, listing, user]);

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

    const isOwner = user && (listing.seller?._id === user._id || listing.seller === user._id);
    const catName = CATEGORIES.find(c => c.value === listing.category)?.label || listing.category?.replace(/-/g, " ");
    const images = listing.images && listing.images.length > 0 ? listing.images : [CATEGORY_IMAGES[listing.category] || catOthers];
    const mainImage = images[activeImageIndex] || catOthers;

    const handleWishlistToggle = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setWishlistLoading(true);
        try {
            if (isWishlisted) {
                await removeFromWishlist(id);
                setIsWishlisted(false);
            } else {
                await addToWishlist(id);
                setIsWishlisted(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update wishlist.");
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleOpenExchangeModal = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setExchangeLoading(true);
        try {
            const data = await getMyListings();
            const availableListings = (data.listings || []).filter(l => 
                l.status === "available" || l.status === "active"
            );
            setMyListings(availableListings);
            if (availableListings.length > 0) {
                setSelectedOfferId(availableListings[0]._id);
            }
            setExchangeModalOpen(true);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to fetch your listings for exchange");
        } finally {
            setExchangeLoading(false);
        }
    };

    const handleSendExchangeRequest = async (e) => {
        e.preventDefault();
        if (!selectedOfferId) {
            alert("Please select one of your listings to offer in exchange.");
            return;
        }
        setExchangeLoading(true);
        try {
            await createExchangeRequest({
                requestedListingId: id,
                offeredListingId: selectedOfferId,
                message: exchangeMessage,
            });
            alert("Exchange request sent successfully!");
            setExchangeModalOpen(false);
            setExchangeMessage("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send exchange request.");
        } finally {
            setExchangeLoading(false);
        }
    };

    const handleOpenReportModal = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setReportModalOpen(true);
    };

    const handleSendReport = async (e) => {
        e.preventDefault();
        setReportLoading(true);
        try {
            await createReport({
                listingId: id,
                reason: reportReason,
                description: reportDescription,
            });
            alert("Report submitted successfully! Administrators will moderate this post.");
            setReportModalOpen(false);
            setReportDescription("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit report.");
        } finally {
            setReportLoading(false);
        }
    };

    const handleOpenEditModal = () => {
        setEditForm({
            title: listing.title || "",
            description: listing.description || "",
            category: listing.category || "others",
            price: listing.price || 0,
            condition: listing.condition || "Good",
            location: listing.location || "",
            status: listing.status || "available",
            isExchangeAvailable: listing.isExchangeAvailable || false,
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const data = await updateListing(id, editForm);
            setListing(data.listing || data);
            setEditModalOpen(false);
            alert("Listing updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update listing.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteListing = async () => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this listing? This action cannot be undone.")) {
            return;
        }
        try {
            await deleteListing(id);
            alert("Listing deleted successfully.");
            navigate("/marketplace");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete listing.");
        }
    };

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
                                <div className="flex items-start justify-between gap-4">
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                                        {listing.title}
                                    </h1>
                                    {!isOwner && (
                                        <button 
                                            onClick={handleWishlistToggle}
                                            disabled={wishlistLoading}
                                            className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all shrink-0 shadow-sm ${
                                                isWishlisted 
                                                    ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100" 
                                                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                                            }`}
                                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                        >
                                            <Heart size={20} className={isWishlisted ? "fill-rose-500" : ""} />
                                        </button>
                                    )}
                                </div>
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

                            {/* Contact CTA or Owner Actions */}
                            {isOwner ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleOpenEditModal}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold py-3.5 hover:bg-blue-100 transition-all text-sm cursor-pointer"
                                    >
                                        Edit Details
                                    </button>
                                    <button 
                                        onClick={handleDeleteListing}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold py-3.5 hover:bg-rose-100 transition-all text-sm cursor-pointer"
                                    >
                                        Delete Post
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {listing.seller?.email && (
                                        <a 
                                            href={`mailto:${listing.seller.email}?subject=Inquiry about ${listing.title} on KelaniXchange`}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] hover:bg-[#3db65e] text-white font-bold py-3.5 shadow-md shadow-emerald-100 hover:shadow-lg transition-all text-sm"
                                        >
                                            <Mail size={16} /> Contact Seller via Email
                                        </a>
                                    )}
                                    
                                    {listing.isExchangeAvailable && (
                                        <button 
                                            onClick={handleOpenExchangeModal}
                                            disabled={exchangeLoading}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#48c96f]/30 bg-emerald-50/50 hover:bg-emerald-50 text-[#15945a] font-bold py-3.5 shadow-sm transition-all text-sm cursor-pointer disabled:opacity-50"
                                        >
                                            {exchangeLoading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <ArrowUpDown size={16} />
                                            )}
                                            Request Exchange Offer
                                        </button>
                                    )}

                                    <button
                                        onClick={handleOpenReportModal}
                                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-rose-500 py-1 transition-colors block cursor-pointer"
                                    >
                                        Flag / Report this listing
                                    </button>
                                </div>
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

            {/* Exchange Offer Modal */}
            {exchangeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setExchangeModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Request Exchange</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Offer one of your items for {listing.title}</p>
                            </div>
                            <button onClick={() => setExchangeModalOpen(false)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {myListings.length === 0 ? (
                            <div className="text-center py-6 space-y-3">
                                <AlertCircle className="text-amber-500 mx-auto" size={32} />
                                <p className="text-sm font-semibold text-slate-700">No available listings to offer</p>
                                <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                                    You need to post at least one available listing on the marketplace to offer it in exchange.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendExchangeRequest} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Your Offered Item</label>
                                    <select
                                        value={selectedOfferId}
                                        onChange={(e) => setSelectedOfferId(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                    >
                                        {myListings.map((l) => (
                                            <option key={l._id} value={l._id}>
                                                {l.title} (Rs. {l.price?.toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Offer Message (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Write a friendly message to the seller about the exchange proposal..."
                                        value={exchangeMessage}
                                        onChange={(e) => setExchangeMessage(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setExchangeModalOpen(false)}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={exchangeLoading}
                                        className="rounded-xl bg-[#48c96f] hover:bg-[#3db65e] px-5 py-2.5 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                    >
                                        {exchangeLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                                        Submit Offer
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Report Listing Modal */}
            {reportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Report Listing</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Help us keep KelaniXchange safe for students</p>
                            </div>
                            <button onClick={() => setReportModalOpen(false)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSendReport} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Report</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                >
                                    <option value="Scam suspicion">Scam / Fraudulent activity</option>
                                    <option value="Spam">Spam / Duplicate listing</option>
                                    <option value="Inappropriate content">Inappropriate content or language</option>
                                    <option value="Wrong category">Incorrect Category / Misplaced listing</option>
                                    <option value="Fake item">Fake item / Misrepresented item</option>
                                    <option value="Other">Other / General policy violation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Description</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Explain why this listing is being flagged..."
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setReportModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={reportLoading}
                                    className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    {reportLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Listing Modal (Owner) */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit Your Listing</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Modify fields and save changes instantly</p>
                            </div>
                            <button onClick={() => setEditModalOpen(false)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Listing Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={editForm.title} 
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                        <textarea 
                                            rows={3}
                                            required
                                            value={editForm.description} 
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                                        <select 
                                            value={editForm.category} 
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        >
                                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (Rs.)</label>
                                        <input 
                                            type="number" 
                                            required
                                            min={0}
                                            value={editForm.price} 
                                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label>
                                        <select 
                                            value={editForm.condition} 
                                            onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        >
                                            <option value="New">New</option>
                                            <option value="Like New">Like New</option>
                                            <option value="Good">Good</option>
                                            <option value="Used">Used</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={editForm.location} 
                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                                        <select 
                                            value={editForm.status} 
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        >
                                            <option value="available">Available</option>
                                            <option value="sold">Sold</option>
                                            <option value="reserved">Reserved</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 h-full pt-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={editForm.isExchangeAvailable}
                                                onChange={(e) => setEditForm({ ...editForm, isExchangeAvailable: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#48c96f]" />
                                        </label>
                                        <div>
                                            <span className="text-sm font-bold text-slate-700">Exchange Available</span>
                                            <p className="text-[11px] text-slate-400">Accept trade offers for this item</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setEditModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={editLoading}
                                    className="rounded-xl bg-[#48c96f] hover:bg-[#3db65e] px-5 py-2.5 text-sm font-bold text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {editLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
