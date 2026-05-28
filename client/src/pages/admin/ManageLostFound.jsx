import React, { useState, useEffect } from "react";
import { 
    Search, Trash2, Loader2, XCircle, CheckCircle, 
    Clock, MapPin, Calendar, User, Tag, HelpCircle, X 
} from "lucide-react";
import { 
    getAllLostFoundAdmin, 
    updateLostFoundStatusAdmin, 
    deleteLostFoundAdmin 
} from "../../services/adminService";
import { useConfirm } from "../../components/ui/AlertProvider";

const CATEGORIES = [
    { value: "id-card", label: "ID Card" },
    { value: "wallet", label: "Wallet" },
    { value: "electronics", label: "Electronics" },
    { value: "books", label: "Books" },
    { value: "stationery", label: "Stationery" },
    { value: "keys", label: "Keys" },
    { value: "bags", label: "Bags" },
    { value: "clothing", label: "Clothing" },
    { value: "other", label: "Other" },
];

const ManageLostFound = () => {
    const { confirmAction } = useConfirm();
    const [posts, setPosts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        let result = posts;

        // Apply type filter
        if (typeFilter !== "all") {
            result = result.filter((p) => p.postType === typeFilter);
        }

        // Apply category filter
        if (categoryFilter !== "all") {
            result = result.filter((p) => p.category === categoryFilter);
        }

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter((p) => p.status === statusFilter);
        }

        // Apply search query
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter((p) =>
                p.title?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.location?.toLowerCase().includes(query) ||
                p.postedBy?.username?.toLowerCase().includes(query) ||
                p.postedBy?.email?.toLowerCase().includes(query)
            );
        }

        setFiltered(result);
    }, [search, typeFilter, categoryFilter, statusFilter, posts]);

    const fetchPosts = async () => {
        try {
            const data = await getAllLostFoundAdmin();
            setPosts(data.posts || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load Lost & Found posts");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setActionLoading(id);
        try {
            await updateLostFoundStatusAdmin(id, newStatus);
            // Refresh list
            const data = await getAllLostFoundAdmin();
            setPosts(data.posts || []);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: "Delete Lost and Found post?",
            message: "This post will be permanently deleted. This action cannot be undone.",
            confirmText: "Delete post",
        });
        if (!confirmed) return;
        setActionLoading(id);
        try {
            await deleteLostFoundAdmin(id);
            // Refresh list
            const data = await getAllLostFoundAdmin();
            setPosts(data.posts || []);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to delete post");
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status) => {
        if (status === "open") {
            return {
                cls: "bg-amber-50 text-amber-700 border-amber-200",
                icon: Clock,
            };
        }
        return {
            cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: CheckCircle,
        };
    };

    const typeBadge = (type) => {
        if (type === "lost") {
            return "bg-rose-50 text-rose-600 border border-rose-200 uppercase text-[10px] font-bold";
        }
        return "bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase text-[10px] font-bold";
    };

    const getCategoryLabel = (val) => {
        const cat = CATEGORIES.find((c) => c.value === val);
        return cat ? cat.label : val;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[#48c96f]" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <XCircle className="text-rose-400 mb-3" size={40} />
                <p className="text-slate-500 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header section */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Lost & Found</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {posts.length} total post{posts.length !== 1 ? "s" : ""} registered
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                {/* Search field */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search title, description, location, or user..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40" 
                    />
                </div>

                {/* Filters grid */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Post Type filter */}
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)} 
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                    >
                        <option value="all">All Types</option>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                    </select>

                    {/* Category filter */}
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)} 
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)} 
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Table layout */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Post details</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Posted by</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location & Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((post) => {
                                const badge = statusBadge(post.status);
                                const StatusIcon = badge.icon;
                                return (
                                    <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Post details (Image + Title + Type Badge) */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {post.image ? (
                                                    <img 
                                                        src={post.image} 
                                                        alt="" 
                                                        className="h-12 w-12 rounded-xl object-cover border border-slate-200" 
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <HelpCircle size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 max-w-[240px] truncate">
                                                        {post.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${typeBadge(post.postType)}`}>
                                                            {post.postType}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                                            {post.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* User Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {post.postedBy?.username || "—"}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {post.postedBy?.email || "—"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 font-medium">
                                                {getCategoryLabel(post.category)}
                                            </span>
                                        </td>

                                        {/* Location & Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{post.location}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} className="text-slate-400 shrink-0" />
                                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${badge.cls}`}>
                                                <StatusIcon size={12} /> {post.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                {/* Change Status Dropdown */}
                                                <select
                                                    value={post.status}
                                                    onChange={(e) => handleStatusChange(post._id, e.target.value)}
                                                    disabled={actionLoading === post._id}
                                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#48c96f]/40 disabled:opacity-50"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>

                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => handleDelete(post._id)} 
                                                    disabled={actionLoading === post._id}
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 transition-colors"
                                                    title="Delete Post"
                                                >
                                                    {actionLoading === post._id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <HelpCircle size={36} className="text-slate-300 mx-auto mb-2.5" />
                        <p className="text-slate-500 text-sm font-semibold">No Lost & Found posts found.</p>
                        <p className="text-slate-400 text-xs mt-1">Try modifying your search or filter options.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageLostFound;
