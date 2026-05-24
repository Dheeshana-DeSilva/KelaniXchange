import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    AlertCircle, ArrowLeft, Calendar, Loader2, MapPin,
    PackageCheck, Phone, Save, Store
} from "lucide-react";
import { getMySales, updateSaleStatus } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const statusClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const paymentClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
    refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function MySales() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const data = await getMySales();
            setSales(data.sales || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load your sales.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (sale, nextOrderStatus, nextPaymentStatus) => {
        setActionLoading(sale._id);
        try {
            const data = await updateSaleStatus(sale._id, {
                orderStatus: nextOrderStatus,
                paymentStatus: nextPaymentStatus,
            });
            setSales(prev => prev.map(item => item._id === sale._id ? {
                ...item,
                orderStatus: data.order.orderStatus,
                paymentStatus: data.order.paymentStatus,
            } : item));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update sale.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-[#48c96f]" size={36} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-100">
                    <AlertCircle className="text-rose-500 mx-auto mb-3" size={36} />
                    <p className="text-sm font-semibold text-slate-600">{error}</p>
                    <button onClick={fetchSales} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Try Again</button>
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
                            My Sales <Store size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage buyer orders for your listings.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80">
                        {sales.length} {sales.length === 1 ? "Sale" : "Sales"}
                    </span>
                </div>

                {sales.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto space-y-5 shadow-xl shadow-slate-100">
                        <Store size={48} className="text-slate-400 mx-auto" />
                        <div>
                            <h3 className="text-lg font-black text-slate-800">No Sales Yet</h3>
                            <p className="text-xs text-slate-500 mt-1">Orders from buyers will appear here.</p>
                        </div>
                        <Link to="/marketplace/create" className="inline-block px-5 py-2.5 rounded-xl bg-[#48c96f] text-white hover:bg-[#3db65e] text-xs font-bold transition-all">
                            Sell an Item
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sales.map(sale => (
                            <div key={sale._id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                                    <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100 overflow-hidden shrink-0">
                                        {sale.listing?.images?.[0] ? (
                                            <img src={sale.listing.images[0]} alt={sale.listing?.title || ""} className="max-h-full max-w-full object-contain rounded-lg" />
                                        ) : (
                                            <PackageCheck size={28} className="text-slate-400" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusClasses[sale.orderStatus] || statusClasses.pending}`}>
                                                {sale.orderStatus}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${paymentClasses[sale.paymentStatus] || paymentClasses.pending}`}>
                                                {sale.paymentStatus}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">#{sale._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="font-black text-slate-800 truncate">{sale.listing?.title || "Deleted listing"}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(sale.createdAt).toLocaleString()}</span>
                                            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {sale.meetupLocation || sale.listing?.location || "Campus meetup"}</span>
                                            {sale.phone && <span className="inline-flex items-center gap-1"><Phone size={12} /> {sale.phone}</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Buyer: <span className="font-bold text-slate-700">{sale.user?.fullName || sale.user?.username || "Unknown"}</span></p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 xl:w-[430px]">
                                        <select
                                            value={sale.orderStatus}
                                            onChange={(e) => handleUpdate(sale, e.target.value, sale.paymentStatus)}
                                            disabled={actionLoading === sale._id || sale.orderStatus === "cancelled"}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#48c96f]/40 disabled:opacity-50"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <select
                                            value={sale.paymentStatus}
                                            onChange={(e) => handleUpdate(sale, sale.orderStatus, e.target.value)}
                                            disabled={actionLoading === sale._id || sale.orderStatus === "cancelled"}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#48c96f]/40 disabled:opacity-50"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="failed">Failed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                        <div className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500">
                                            {actionLoading === sale._id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            Rs. {Number(sale.totalAmount).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                {sale.note && (
                                    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
                                        <span className="font-bold text-slate-600">Buyer note:</span> {sale.note}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
