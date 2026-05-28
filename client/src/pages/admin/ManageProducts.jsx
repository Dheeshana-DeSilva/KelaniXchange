import React, { useState, useEffect } from "react";
import { Search, Trash2, ExternalLink, Loader2, XCircle, Edit, Star, X } from "lucide-react";
import { 
    getAllListingsAdmin, 
    removeListingAdmin, 
    updateListingAdmin, 
    deleteListingAdmin 
} from "../../services/adminService";
import { useConfirm } from "../../components/ui/AlertProvider";

const CATEGORIES = [
    { value: "books-and-stationery", label: "Books & Stationery" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "fashion-and-accessories", label: "Fashion & Accessories" },
    { value: "sports-and-outdoor", label: "Sports & Outdoor" },
    { value: "vehicles", label: "Vehicles" },
    { value: "others", label: "Others" },
];

const STATUSES = [
    { value: "available", label: "Available / Active" },
    { value: "pending", label: "Pending Approval" },
    { value: "rejected", label: "Rejected" },
    { value: "sold", label: "Sold" },
    { value: "reserved", label: "Reserved" },
    { value: "removed", label: "Removed" },
    { value: "hidden", label: "Hidden" },
];

const CONDITIONS = ["New", "Like New", "Good", "Used"];

const ManageProducts = () => {
    const { confirmAction } = useConfirm();
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
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
        condition: "",
        location: "",
        status: "",
        isFeatured: false,
        isExchangeAvailable: false,
    });

    useEffect(() => { fetchListings(); }, []);

    useEffect(() => {
        let result = listings;
        if (statusFilter !== "all") result = result.filter((l) => l.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((l) =>
                l.title?.toLowerCase().includes(q) ||
                l.category?.toLowerCase().includes(q) ||
                l.seller?.username?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, statusFilter, listings]);

    const fetchListings = async () => {
        try {
            const data = await getAllListingsAdmin();
            setListings(data.listings || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load listings");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: "Delete listing?",
            message: "This listing will be permanently deleted. This cannot be undone.",
            confirmText: "Delete listing",
        });
        if (!confirmed) return;
        setActionLoading(id);
        try {
            await deleteListingAdmin(id);
            const data = await getAllListingsAdmin();
            setListings(data.listings || []);
        } catch (err) { alert(err?.response?.data?.message || "Failed to delete listing"); }
        finally { setActionLoading(null); }
    };

    const handleEditClick = (listing) => {
        setSelectedListing(listing);
        setEditForm({
            title: listing.title || "",
            description: listing.description || "",
            category: listing.category || "others",
            price: listing.price || 0,
            condition: listing.condition || "Good",
            location: listing.location || "University of Kelaniya",
            status: listing.status || "available",
            isFeatured: listing.isFeatured || false,
            isExchangeAvailable: listing.isExchangeAvailable || false,
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedListing) return;
        setActionLoading(selectedListing._id);
        try {
            await updateListingAdmin(selectedListing._id, editForm);
            setEditModalOpen(false);
            const data = await getAllListingsAdmin();
            setListings(data.listings || []);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to update listing");
        } finally {
            setActionLoading(null);
        }
    };

    const statusColor = (s) => {
        const map = { 
            available: "emerald", 
            active: "emerald", 
            sold: "blue", 
            reserved: "amber", 
            removed: "rose",
            rejected: "rose",
            pending: "indigo",
            hidden: "slate"
        };
        const c = map[s] || "slate";
        return `bg-${c}-50 text-${c}-700 border-${c}-200`;
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#48c96f]" size={32} /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><XCircle className="text-rose-400 mb-3" size={40} /><p className="text-slate-500 font-semibold">{error}</p></div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Listings</h1>
                    <p className="text-sm text-slate-500 mt-1">{listings.length} total listing{listings.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40">
                        <option value="all">All Statuses</option>
                        <option value="available">Available / Active</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="sold">Sold</option>
                        <option value="reserved">Reserved</option>
                        <option value="removed">Removed</option>
                        <option value="hidden">Hidden</option>
                    </select>
                    <div className="relative max-w-xs w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search title, category, seller…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40" />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-slate-200 bg-slate-50/50">
                            {["Listing","Seller","Category","Price","Status","Featured","Date","Actions"].map((h,i)=><th key={i} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${i===7?"text-right":""}`}>{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((l) => (
                                <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4"><div className="flex items-center gap-3">
                                        {l.images?.[0] ? <img src={l.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200" /> : <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200" />}
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 max-w-[200px] truncate">{l.title}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-xs text-slate-400">{l.condition}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                    l.isExchangeAvailable 
                                                        ? "bg-sky-50 text-sky-600 border border-sky-200" 
                                                        : "bg-slate-50 text-slate-400 border border-slate-200"
                                                }`}>
                                                    {l.isExchangeAvailable ? "Exchange Ready" : "Sale Only"}
                                                </span>
                                            </div>
                                        </div>
                                    </div></td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{l.seller?.username || "—"}</td>
                                    <td className="px-6 py-4"><span className="text-xs text-slate-600 bg-slate-50 rounded-full px-2.5 py-0.5 border border-slate-200">{l.category}</span></td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">Rs. {l.price?.toLocaleString() || 0}</td>
                                    <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusColor(l.status)}`}>{l.status}</span></td>
                                    <td className="px-6 py-4">
                                        {l.isFeatured ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                <Star size={12} className="fill-amber-600 text-amber-600" /> Yes
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2">
                                        <a href={`/marketplace/${l._id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"><ExternalLink size={13}/>View</a>
                                        <button onClick={() => handleEditClick(l)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                                            <Edit size={13}/>Edit
                                        </button>
                                        <button onClick={() => handleDelete(l._id)} disabled={actionLoading === l._id} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 disabled:opacity-50">
                                            {actionLoading === l._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}Delete
                                        </button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="py-16 text-center"><p className="text-slate-500 text-sm">No listings found.</p></div>}
            </div>

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
                    
                    {/* Modal Body */}
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-250 flex flex-col max-h-[90vh]">
                        {/* Header (Sticky) */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit Listing Details</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Moderator tools for KelaniXchange listing ID: {selectedListing?._id}</p>
                            </div>
                            <button onClick={() => setEditModalOpen(false)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form Wrapper */}
                        <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
                            {/* Scrollable Fields Body */}
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Title */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Listing Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={editForm.title} 
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                        <textarea 
                                            rows={3}
                                            required
                                            value={editForm.description} 
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40 resize-none"
                                        />
                                    </div>

                                    {/* Category */}
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

                                    {/* Price */}
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

                                    {/* Condition */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label>
                                        <select 
                                            value={editForm.condition} 
                                            onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        >
                                            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Location */}
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

                                    {/* Status */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                                        <select 
                                            value={editForm.status} 
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                        >
                                            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>

                                    {/* Featured Listing Toggle */}
                                    <div className="flex items-center gap-3 h-full pt-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={editForm.isFeatured}
                                                onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#48c96f]" />
                                        </label>
                                        <div>
                                            <span className="text-sm font-bold text-slate-700">Feature this Listing</span>
                                            <p className="text-[11px] text-slate-400">Show this item prominently in search results</p>
                                        </div>
                                    </div>

                                    {/* Exchange Available Toggle */}
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
                                            <p className="text-[11px] text-slate-400">Allow other students to offer items in exchange</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button (Sticky Footer) */}
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
                                    disabled={actionLoading === selectedListing?._id}
                                    className="rounded-xl bg-[#48c96f] hover:bg-[#3db65e] px-5 py-2.5 text-sm font-bold text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === selectedListing?._id ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
