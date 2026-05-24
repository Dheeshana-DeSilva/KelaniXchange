import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
    Tag, MapPin, Loader2, AlertCircle, Trash2, Edit, 
    ExternalLink, HelpCircle, ArrowLeft, X, Sparkles, ShoppingBag
} from "lucide-react";
import { getMyListings, deleteListing, updateListing } from "../services/listingService";
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

export default function MyListings() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        category: "",
        price: 0,
        quantity: 1,
        condition: "",
        location: "",
        status: "",
        isExchangeAvailable: false,
    });

    // Guard route
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const data = await getMyListings();
            setListings(data.listings || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching my listings:", err);
            setError(err.response?.data?.message || "Failed to load your listings.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this listing? This action cannot be undone.")) {
            return;
        }
        setActionLoading(id);
        try {
            await deleteListing(id);
            setListings((prev) => prev.filter((item) => item._id !== id));
            alert("Listing deleted successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete listing.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditClick = (listing) => {
        setSelectedListing(listing);
        setEditForm({
            title: listing.title || "",
            description: listing.description || "",
            category: listing.category || "others",
            price: listing.price || 0,
            quantity: listing.quantity || 1,
            condition: listing.condition || "Good",
            location: listing.location || "",
            status: listing.status || "available",
            isExchangeAvailable: listing.isExchangeAvailable || false,
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedListing) return;
        setActionLoading(selectedListing._id);
        try {
            const data = await updateListing(selectedListing._id, editForm);
            // Refresh list
            const updatedListings = listings.map((l) => 
                l._id === selectedListing._id ? (data.listing || data) : l
            );
            setListings(updatedListings);
            setEditModalOpen(false);
            alert("Listing updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update listing.");
        } finally {
            setActionLoading(null);
        }
    };

    const getCategoryLabel = (val) => {
        const cat = CATEGORIES.find((c) => c.value === val);
        return cat ? cat.label : val?.replace(/-/g, " ");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060f1e] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[#48c96f] mx-auto" size={40} />
                    <p className="text-slate-500 font-medium text-sm">Loading your listings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#060f1e] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#0a1426] border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white">Error Occurred</h3>
                        <p className="text-sm text-slate-400">{error}</p>
                    </div>
                    <button 
                        onClick={fetchMyListings} 
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 text-white font-bold py-3 hover:bg-slate-900 transition-colors text-sm cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center p-4 pt-28 sm:p-8 sm:pt-32 font-sans relative overflow-hidden pb-16">
            
            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(72,201,111,0.03) 0%, transparent 75%)" />
                <div className="absolute bottom-[-10%] right-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(45,164,196,0.02) 0%, transparent 75%)" />
            </div>

            <div className="w-full max-w-[1200px] relative z-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link 
                        to="/marketplace" 
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>
                    <Link 
                        to="/marketplace/create" 
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase bg-[#48c96f] text-white hover:bg-[#3db65e] transition-all shadow-lg shadow-emerald-500/10"
                    >
                        Sell An Item
                    </Link>
                </div>

                {/* Title */}
                <div className="border-b border-slate-100 pb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        My Marketplace Listings <Sparkles size={20} className="text-[#48c96f]" />
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage details, resolve status, or remove items you have posted on KelaniXchange.</p>
                </div>

                {/* Grid layout */}
                {listings.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto space-y-5 shadow-xl shadow-slate-100">
                        <ShoppingBag size={48} className="text-slate-400 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-800">No Listings Found</h3>
                            <p className="text-xs text-slate-500 max-w-[300px] mx-auto leading-relaxed">
                                You haven't posted any items on the marketplace yet. Sell your unused study materials or electronics!
                            </p>
                        </div>
                        <Link 
                            to="/marketplace/create" 
                            className="inline-block px-5 py-2.5 rounded-xl bg-[#48c96f] text-white hover:bg-[#3db65e] text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                        >
                            Create First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((l) => {
                            const mainImg = l.images?.[0] || CATEGORY_IMAGES[l.category] || catOthers;
                            return (
                                <div key={l._id} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl hover:border-[#48c96f]/35 transition-all duration-300 group">
                                    <div>
                                        {/* Image */}
                                        <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100 flex items-center justify-center p-5 relative overflow-hidden">
                                            <img src={mainImg} alt={l.title} className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-102" />
                                            <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                                                l.status === "available" || l.status === "active"
                                                    ? "bg-emerald-50 text-[#15945a] border-[#48c96f]/30"
                                                    : l.status === "reserved"
                                                    ? "bg-amber-50 text-amber-600 border-amber-500/30"
                                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                            }`}>
                                                {l.status}
                                            </span>
                                        </div>

                                        {/* Text Info */}
                                        <div className="p-5 pt-6 space-y-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="text-[10px] bg-slate-50 border border-slate-200/80 text-slate-500 px-2 py-0.5 rounded font-bold">
                                                    {getCategoryLabel(l.category)}
                                                </span>
                                                <span className="text-[10px] bg-slate-50 border border-slate-200/80 text-slate-500 px-2 py-0.5 rounded font-bold">
                                                    {l.condition}
                                                </span>
                                                {l.isExchangeAvailable && (
                                                    <span className="text-[10px] bg-emerald-50 border border-emerald-500/30 text-[#15945a] px-2 py-0.5 rounded font-bold">
                                                        Exchange Ready
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-md font-bold text-slate-800 leading-snug line-clamp-1 group-hover:text-[#48c96f] transition-colors">{l.title}</h3>
                                            <p className="text-lg font-black text-[#15945a]">Rs. {Number(l.price).toLocaleString()}</p>
                                            
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                <MapPin size={11} className="shrink-0" />
                                                <span className="truncate">{l.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-5 pt-0 grid grid-cols-3 gap-2">
                                        <Link 
                                            to={`/marketplace/${l._id}`}
                                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 py-2 border border-slate-200/80 transition-colors"
                                            title="View Details"
                                        >
                                            <ExternalLink size={12} /> View
                                        </Link>
                                        <button 
                                            onClick={() => handleEditClick(l)}
                                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-600 py-2 border border-blue-200 transition-colors cursor-pointer"
                                            title="Edit Item"
                                        >
                                            <Edit size={12} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(l._id)}
                                            disabled={actionLoading === l._id}
                                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 py-2 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                                            title="Delete Item"
                                        >
                                            {actionLoading === l._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Modal (Owner) */}
            {editModalOpen && selectedListing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] z-50">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit Your Listing</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Modify fields and save changes instantly</p>
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
                                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] focus:bg-white outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                        <textarea 
                                            rows={3}
                                            required
                                            value={editForm.description} 
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] focus:bg-white outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                                        <select 
                                            value={editForm.category} 
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] outline-none"
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
                                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] focus:bg-white outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quantity Available</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={editForm.quantity}
                                            onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] focus:bg-white outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label>
                                        <select 
                                            value={editForm.condition} 
                                            onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] outline-none"
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
                                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] focus:bg-white outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                                        <select 
                                            value={editForm.status} 
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#48c96f] outline-none"
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
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#48c96f]" />
                                        </label>
                                        <div>
                                            <span className="text-sm font-bold text-slate-800">Exchange Available</span>
                                            <p className="text-[11px] text-slate-500">Accept trade offers for this item</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setEditModalOpen(false)}
                                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={actionLoading === selectedListing?._id}
                                    className="rounded-xl bg-gradient-to-r from-[#48c96f] to-[#15945a] hover:from-[#5dd97f] hover:to-[#1bad6d] px-5 py-2.5 text-sm font-bold text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === selectedListing?._id ? <Loader2 size={16} className="animate-spin" /> : null}
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
