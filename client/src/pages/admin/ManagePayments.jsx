import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { CreditCard, Eye, Loader2, Search, XCircle } from "lucide-react";
import { getAllOrdersAdmin, updateOrderStatusAdmin } from "../../services/orderService";

const paymentStatusLabels = {
    pending: "Pending verification",
    paid: "Paid",
    failed: "Failed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    expired: "Expired",
};

const paymentBadge = (status) => {
    const map = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
        failed: "bg-rose-50 text-rose-700 border-rose-200",
        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
        refunded: "bg-purple-50 text-purple-700 border-purple-200",
        expired: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return map[status] || "bg-slate-100 text-slate-600 border-slate-200";
};

const paymentMethodLabels = {
    Cash: "Cash on Handover",
    BankTransfer: "Bank Transfer",
};

export default function ManagePayments() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState("");

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await getAllOrdersAdmin();
            setOrders(data.orders || []);
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const payments = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;
            const matchesMethod = methodFilter === "all" || order.paymentMethod === methodFilter;
            const matchesSearch = !q ||
                order._id?.toLowerCase().includes(q) ||
                order.user?.username?.toLowerCase().includes(q) ||
                order.seller?.username?.toLowerCase().includes(q) ||
                order.listing?.title?.toLowerCase().includes(q) ||
                order.paymentReference?.toLowerCase().includes(q);

            return matchesStatus && matchesMethod && matchesSearch;
        });
    }, [orders, search, statusFilter, methodFilter]);

    const handleStatusChange = async (order, paymentStatus) => {
        setActionLoadingId(order._id);
        try {
            const data = await updateOrderStatusAdmin(order._id, { paymentStatus });
            setOrders((prev) => prev.map((item) => item._id === order._id ? {
                ...item,
                orderStatus: data.order.orderStatus,
                paymentStatus: data.order.paymentStatus,
                paidAt: data.order.paidAt,
                expiredAt: data.order.expiredAt,
                paymentExpiresAt: data.order.paymentExpiresAt,
            } : item));
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to update payment status");
        } finally {
            setActionLoadingId("");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#48c96f]" size={32} /></div>;
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-800">
                        Payment Management <CreditCard size={24} className="text-[#48c96f]" />
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Verify bank transfers, mark paid/failed, and inspect receipt screenshots.
                    </p>
                </div>
                <span className="self-start rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600 sm:self-center">
                    {payments.length} shown
                </span>
            </div>

            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                >
                    <option value="all">All Statuses</option>
                    {Object.entries(paymentStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                >
                    <option value="all">All Methods</option>
                    <option value="Cash">Cash on Handover</option>
                    <option value="BankTransfer">Bank Transfer</option>
                </select>
                <div className="relative min-w-0 flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search buyer, seller, item, reference..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#48c96f]/40"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/60">
                                {["Order", "Buyer", "Seller", "Item", "Method", "Reference", "Status", "Receipt", "Action"].map((h, i) => (
                                    <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${i === 8 ? "text-right" : ""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.map((order) => (
                                <tr key={order._id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">#{order._id.slice(-6).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">@{order.user?.username || "unknown"}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">@{order.seller?.username || "unknown"}</td>
                                    <td className="max-w-[220px] truncate px-6 py-4 text-sm text-slate-600">{order.listing?.title || "Deleted listing"}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</td>
                                    <td className="max-w-[180px] truncate px-6 py-4 text-sm text-slate-500">{order.paymentReference || "-"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${paymentBadge(order.paymentStatus)}`}>
                                            {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.paymentProofUrl ? (
                                            <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#15945a] hover:bg-emerald-100">
                                                <Eye size={13} /> Receipt
                                            </a>
                                        ) : (
                                            <span className="text-xs font-semibold text-slate-400">No receipt</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={order.paymentStatus}
                                                onChange={(e) => handleStatusChange(order, e.target.value)}
                                                disabled={actionLoadingId === order._id}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#48c96f]/40 disabled:opacity-50"
                                            >
                                                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                            {actionLoadingId === order._id && <Loader2 size={16} className="animate-spin text-[#48c96f]" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payments.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-slate-500">No payments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
