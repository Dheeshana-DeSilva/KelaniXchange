import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Loader2, XCircle, Eye, ShoppingCart, Search } from "lucide-react";
import { getAllOrdersAdmin } from "../../services/orderService";

const orderStatusLabels = {
    pending: "Handover: Waiting for seller",
    processing: "Handover: Being arranged",
    shipped: "Handover: On the way",
    delivered: "Handover: Completed",
    cancelled: "Handover: Cancelled",
};

const paymentStatusLabels = {
    pending: "Payment: Unpaid / pay on handover",
    paid: "Payment: Paid",
    failed: "Payment: Failed",
    cancelled: "Payment: Cancelled",
    refunded: "Payment: Refunded",
    expired: "Payment: Expired",
};

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    useEffect(() => {
        let result = orders;
        if (statusFilter !== "all") {
            result = result.filter(o => o.orderStatus === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(o =>
                o._id.toLowerCase().includes(q) ||
                o.user?.username?.toLowerCase().includes(q) ||
                o.listing?.title?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrdersAdmin();
            setOrders(data.orders || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load orders");
        } finally { setLoading(false); }
    };

    const statusBadge = (s) => {
        const map = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            processing: "bg-blue-50 text-blue-700 border-blue-200",
            shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
            delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
            cancelled: "bg-rose-50 text-rose-700 border-rose-200",
        };
        return map[s] || "bg-slate-100 text-slate-600 border-slate-200";
    };

    const paymentBadge = (s) => {
        const map = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
            failed: "bg-rose-50 text-rose-700 border-rose-200",
            cancelled: "bg-slate-100 text-slate-600 border-slate-200",
            refunded: "bg-purple-50 text-purple-700 border-purple-200",
            expired: "bg-orange-50 text-orange-700 border-orange-200",
        };
        return map[s] || "bg-slate-100 text-slate-600 border-slate-200";
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#48c96f]" size={32} /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><XCircle className="text-rose-400 mb-3" size={40} /><p className="text-slate-500 font-semibold">{error}</p></div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Orders</h1>
                    <p className="text-sm text-slate-500 mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40">
                        <option value="all">All</option>
                        <option value="pending">Handover: Waiting for seller</option>
                        <option value="processing">Handover: Being arranged</option>
                        <option value="shipped">Handover: On the way</option>
                        <option value="delivered">Handover: Completed</option>
                        <option value="cancelled">Handover: Cancelled</option>
                    </select>
                    <div className="relative max-w-xs w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40" />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-slate-200">
                            {["Order ID","Buyer","Item","Total","Handover Status","Payment Status","Actions"].map((h,i)=><th key={i} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${i===6?"text-right":""}`}>{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((o) => (
                                <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">#{o._id.substring(o._id.length - 6).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{o.user?.username || "—"}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">{o.listing?.title || "—"}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">Rs. {o.totalAmount?.toLocaleString() || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusBadge(o.orderStatus)}`}>
                                            {orderStatusLabels[o.orderStatus] || `Handover: ${o.orderStatus}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${paymentBadge(o.paymentStatus)}`}>
                                            {paymentStatusLabels[o.paymentStatus] || `Payment: ${o.paymentStatus}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/admin/orders/${o._id}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors">
                                            <Eye size={14} /> Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="py-16 text-center"><p className="text-slate-500 text-sm">No orders found.</p></div>}
            </div>
        </div>
    );
};

export default ManageOrders;
