import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    AlertCircle, ArrowLeft, ArrowRightLeft, Check, Clock, Loader2, X
} from "lucide-react";
import {
    acceptExchangeRequest,
    cancelExchangeRequest,
    getReceivedExchangeRequests,
    getSentExchangeRequests,
    rejectExchangeRequest,
} from "../services/exchangeService";
import { useAuth } from "../context/AuthContext";

const statusClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-slate-50 text-slate-600 border-slate-200",
};

function ListingPreview({ label, listing }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 min-w-0">
            <div className="h-16 w-16 rounded-xl border border-slate-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                {listing?.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing?.title || ""} className="h-full w-full object-contain p-1" />
                ) : (
                    <ArrowRightLeft size={24} className="text-slate-300" />
                )}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                {listing?._id ? (
                    <Link to={`/marketplace/${listing._id}`} className="block truncate text-sm font-black text-slate-800 hover:text-[#15945a]">
                        {listing.title}
                    </Link>
                ) : (
                    <p className="truncate text-sm font-black text-slate-500">Deleted listing</p>
                )}
                <p className="text-xs font-bold text-[#15945a] mt-0.5">
                    Rs. {Number(listing?.price || 0).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

export default function MyExchanges() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState("received");
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const [receivedData, sentData] = await Promise.all([
                getReceivedExchangeRequests(),
                getSentExchangeRequests(),
            ]);
            setReceived(receivedData.requests || []);
            setSent(sentData.requests || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load exchange requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadRequests();
        }
    }, [isAuthenticated]);

    const runAction = async (requestId, action) => {
        try {
            setActionLoadingId(requestId);
            await action(requestId);
            await loadRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update exchange request.");
        } finally {
            setActionLoadingId("");
        }
    };

    const requests = activeTab === "received" ? received : sent;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[#48c96f] mx-auto" size={40} />
                    <p className="text-slate-500 font-medium text-sm">Loading exchange requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 pt-28 sm:p-8 sm:pt-32 font-sans pb-16">
            <div className="max-w-[1120px] mx-auto space-y-8">
                <div>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>
                </div>

                <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            My Exchanges <ArrowRightLeft size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Review exchange offers you received and track offers you sent.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80">
                        {requests.length} {requests.length === 1 ? "Request" : "Requests"}
                    </span>
                </div>

                <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab("received")}
                        className={`rounded-xl px-4 py-2 text-xs font-black transition-colors ${
                            activeTab === "received" ? "bg-[#48c96f] text-white" : "text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        Received ({received.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("sent")}
                        className={`rounded-xl px-4 py-2 text-xs font-black transition-colors ${
                            activeTab === "sent" ? "bg-[#48c96f] text-white" : "text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        Sent ({sent.length})
                    </button>
                </div>

                {error ? (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                        <AlertCircle size={18} className="text-rose-600 shrink-0" />
                        <p className="text-rose-700 text-sm font-medium">{error}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto space-y-5 shadow-xl shadow-slate-100">
                        <ArrowRightLeft size={48} className="text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-800">No Exchange Requests</h3>
                            <p className="text-xs text-slate-500 max-w-[320px] mx-auto leading-relaxed">
                                {activeTab === "received"
                                    ? "Requests from other students for your exchange-enabled listings will appear here."
                                    : "Exchange offers you send to other students will appear here."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const actionBusy = actionLoadingId === request._id;
                            const isPending = request.status === "pending";

                            return (
                                <div key={request._id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black capitalize ${statusClasses[request.status] || statusClasses.pending}`}>
                                                    {request.status === "pending" && <Clock size={12} />}
                                                    {request.status}
                                                </span>
                                                <span className="text-xs text-slate-400 font-semibold">
                                                    {new Date(request.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2">
                                                {activeTab === "received"
                                                    ? `From ${request.requester?.username || "Student"}`
                                                    : `To ${request.receiver?.username || "Student"}`}
                                            </p>
                                        </div>

                                        {isPending && activeTab === "received" && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => runAction(request._id, acceptExchangeRequest)}
                                                    disabled={actionBusy}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#48c96f] px-4 py-2 text-xs font-black text-white hover:bg-[#3db65e] disabled:opacity-60"
                                                >
                                                    {actionBusy ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => runAction(request._id, rejectExchangeRequest)}
                                                    disabled={actionBusy}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {isPending && activeTab === "sent" && (
                                            <button
                                                type="button"
                                                onClick={() => runAction(request._id, cancelExchangeRequest)}
                                                disabled={actionBusy}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                                            >
                                                {actionBusy ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:items-center">
                                        <ListingPreview
                                            label={activeTab === "received" ? "They want" : "You want"}
                                            listing={request.requestedListing}
                                        />
                                        <div className="hidden md:flex h-10 w-10 rounded-full bg-emerald-50 text-[#15945a] items-center justify-center">
                                            <ArrowRightLeft size={18} />
                                        </div>
                                        <ListingPreview
                                            label={activeTab === "received" ? "They offer" : "You offer"}
                                            listing={request.offeredListing}
                                        />
                                    </div>

                                    {request.message && (
                                        <p className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-sm text-slate-600">
                                            <span className="font-black text-slate-700">Message:</span> {request.message}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
