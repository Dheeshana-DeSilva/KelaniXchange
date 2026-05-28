import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Star, Trash2, XCircle } from "lucide-react";
import { deleteReviewAdmin, getAllReviewsAdmin } from "../../services/reviewService";
import { useConfirm } from "../../components/ui/AlertProvider";

export default function ManageReviews() {
    const { confirmAction } = useConfirm();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await getAllReviewsAdmin();
            setReviews(data.reviews || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load reviews.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const filteredReviews = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return reviews;

        return reviews.filter((review) =>
            review.comment?.toLowerCase().includes(query) ||
            review.reviewer?.username?.toLowerCase().includes(query) ||
            review.seller?.username?.toLowerCase().includes(query) ||
            review.listing?.title?.toLowerCase().includes(query)
        );
    }, [reviews, search]);

    const handleDelete = async (review) => {
        const confirmed = await confirmAction({
            title: "Delete review?",
            message: "Remove this seller feedback comment from the platform?",
            confirmText: "Delete review",
        });
        if (!confirmed) return;

        try {
            setActionLoading(review._id);
            await deleteReviewAdmin(review._id);
            setReviews((current) => current.filter((item) => item._id !== review._id));
            alert("Review deleted successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete review.");
        } finally {
            setActionLoading("");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#48c96f]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">Manage Reviews</h1>
                    <p className="mt-1 text-sm text-slate-500">{reviews.length} seller feedback review{reviews.length === 1 ? "" : "s"}</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search reviews"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#48c96f]/50"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/60">
                                {["Rating", "Review", "Reviewer", "Seller", "Listing", "Date", "Action"].map((heading, index) => (
                                    <th key={heading} className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${index === 6 ? "text-right" : ""}`}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReviews.map((review) => (
                                <tr key={review._id} className="align-top hover:bg-slate-50/60">
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                                            <Star size={13} className="fill-amber-400 text-amber-400" />
                                            {review.rating}/5
                                        </span>
                                    </td>
                                    <td className="max-w-[360px] px-5 py-4 text-sm font-medium leading-6 text-slate-600">
                                        {review.comment || "No comment"}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">@{review.reviewer?.username || "user"}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">@{review.seller?.username || "seller"}</td>
                                    <td className="max-w-[220px] px-5 py-4 text-sm text-slate-500">{review.listing?.title || "Deleted listing"}</td>
                                    <td className="px-5 py-4 text-sm text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(review)}
                                            disabled={actionLoading === review._id}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                            title="Delete review"
                                        >
                                            {actionLoading === review._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredReviews.length === 0 && (
                    <div className="py-16 text-center">
                        <XCircle size={28} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-500">No reviews found.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
