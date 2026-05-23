import React, { useState, useEffect } from "react";
import { Search, Trash2, ShieldAlert, Loader2, PackageSearch } from "lucide-react";
import { getAllLostFoundAdmin, deleteLostFoundAdmin } from "../../services/adminService";

const ManageLostFound = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [error, setError] = useState(null);

    const fetchPosts = async () => {
        try {
            const data = await getAllLostFoundAdmin();
            setPosts(data.posts || []);
        } catch (err) {
            console.error("Failed to fetch lost and found posts:", err);
            setError(err.response?.data?.message || "Failed to load posts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post completely?")) return;

        try {
            setDeleteLoading(id);
            await deleteLostFoundAdmin(id);
            setPosts((prev) => prev.filter((post) => post._id !== id));
        } catch (err) {
            console.error("Failed to delete post:", err);
            alert(err.response?.data?.message || "Failed to delete post.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredPosts = posts.filter(
        (post) =>
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.postedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-[#48c96f]" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <ShieldAlert size={48} className="text-rose-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Error Loading Posts</h3>
                <p className="text-slate-500 mt-2">{error}</p>
                <button
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        fetchPosts();
                    }}
                    className="mt-4 px-6 py-2 bg-[#48c96f] text-white rounded-xl font-semibold hover:bg-[#15945a] transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                        Manage Lost & Found
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        View, moderate, and remove lost and found community posts.
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#48c96f] focus:border-transparent transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Category</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Posted By</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <tr key={post._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {post.image ? (
                                                        <img
                                                            src={post.image}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <PackageSearch size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <span>{post.location}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span>{new Date(post.date).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                                    post.postType === "lost" 
                                                        ? "bg-rose-100 text-rose-700" 
                                                        : "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                    {post.postType}
                                                </span>
                                                <span className="text-xs font-medium text-slate-600 capitalize">
                                                    {post.category?.replace("-", " ")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {post.postedBy?.username || "Unknown"}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize ${
                                                post.status === "open"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(post._id)}
                                                    disabled={deleteLoading === post._id}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete Post"
                                                >
                                                    {deleteLoading === post._id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <PackageSearch className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">No posts found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageLostFound;
