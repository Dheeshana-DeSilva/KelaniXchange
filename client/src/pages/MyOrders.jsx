import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import {
    AlertCircle, ArrowLeft, Calendar, Loader2, MapPin,
    ExternalLink, PackageCheck, Phone, ReceiptText, Trash2, XCircle
} from "lucide-react";
import { cancelMyOrder, clearOrderErrors, deleteMyCancelledOrder, fetchMyOrders } from "../features/orders/orderSlice";
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

const orderStatusLabels = {
    pending: "Handover: Waiting for seller",
    processing: "Handover: Being arranged",
    shipped: "Handover: On the way",
    delivered: "Handover: Completed",
    cancelled: "Handover: Cancelled",
};

const paymentStatusLabels = {
    pending: "Payment: Pending verification",
    paid: "Payment: Paid",
    failed: "Payment: Failed",
    cancelled: "Payment: Cancelled",
    refunded: "Payment: Refunded",
};

const paymentMethodLabels = {
    Cash: "Cash on Handover",
    BankTransfer: "Bank Transfer",
};

const getPaymentStatusLabel = (order) => {
    if (order.paymentStatus === "pending" && order.paymentMethod === "Cash") {
        return "Payment: Pay on handover";
    }
    return paymentStatusLabels[order.paymentStatus] || `Payment: ${order.paymentStatus}`;
};

export default function MyOrders() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const {
        orders,
        ordersLoading: loading,
        ordersError: error,
        actionLoadingId,
        actionError,
    } = useSelector(state => state.orders);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchMyOrders());
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        if (actionError) {
            alert(actionError);
            dispatch(clearOrderErrors());
        }
    }, [actionError, dispatch]);

    const handleCancel = async (orderId) => {
        if (!confirm("Cancel this order while the handover is still waiting for seller action?")) return;
        dispatch(cancelMyOrder(orderId));
    };

    const handleDelete = async (orderId) => {
        if (!confirm("Delete this cancelled order from your order history?")) return;
        dispatch(deleteMyCancelledOrder(orderId));
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
                    <button onClick={() => dispatch(fetchMyOrders())} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Try Again</button>
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
                            My Orders <ReceiptText size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Track purchases, handover details, and payment status.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80">
                        {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                    </span>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto space-y-5 shadow-xl shadow-slate-100">
                        <PackageCheck size={48} className="text-slate-400 mx-auto" />
                        <div>
                            <h3 className="text-lg font-black text-slate-800">No Orders Yet</h3>
                            <p className="text-xs text-slate-500 mt-1">Your purchases will appear here after checkout.</p>
                        </div>
                        <Link to="/marketplace" className="inline-block px-5 py-2.5 rounded-xl bg-[#48c96f] text-white hover:bg-[#3db65e] text-xs font-bold transition-all">
                            Browse Items
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                                    <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100 overflow-hidden shrink-0">
                                        {order.listing?.images?.[0] ? (
                                            <img src={order.listing.images[0]} alt={order.listing?.title || ""} className="max-h-full max-w-full object-contain rounded-lg" />
                                        ) : (
                                            <PackageCheck size={28} className="text-slate-400" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusClasses[order.orderStatus] || statusClasses.pending}`}
                                                title="Order handover / delivery status"
                                            >
                                                {orderStatusLabels[order.orderStatus] || `Handover: ${order.orderStatus}`}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${paymentClasses[order.paymentStatus] || paymentClasses.pending}`}
                                                title="Payment status"
                                            >
                                                {getPaymentStatusLabel(order)}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="font-black text-slate-800 truncate">{order.listing?.title || "Deleted listing"}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(order.createdAt).toLocaleString()}</span>
                                            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {order.meetupLocation || order.listing?.location || "Campus meetup"}</span>
                                            {order.phone && <span className="inline-flex items-center gap-1"><Phone size={12} /> {order.phone}</span>}
                                        </div>
                                    </div>

                                    <div className="lg:text-right space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Qty {order.quantity}</p>
                                            <p className="text-lg font-black text-[#15945a]">Rs. {Number(order.totalAmount).toLocaleString()}</p>
                                        </div>
                                        {order.listing?._id && (
                                            <Link
                                                to={`/marketplace/${order.listing._id}`}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#48c96f] hover:text-[#15945a] transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                                View Item
                                            </Link>
                                        )}
                                        {order.orderStatus === "cancelled" ? (
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                disabled={actionLoadingId === order._id}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {actionLoadingId === order._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                Delete
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCancel(order._id)}
                                                disabled={order.orderStatus !== "pending" || actionLoadingId === order._id}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {actionLoadingId === order._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                                        {order.note && (
                                    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
                                        <span className="font-bold text-slate-600">Note:</span> {order.note}
                                    </div>
                                )}
                                {(order.paymentMethod || order.paymentReference || order.paymentProofUrl) && (
                                    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 space-y-1.5">
                                        {order.paymentMethod && (
                                            <p><span className="font-bold text-slate-600">Payment method:</span> {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
                                        )}
                                        {order.paymentReference && (
                                            <p><span className="font-bold text-slate-600">Reference:</span> {order.paymentReference}</p>
                                        )}
                                        {order.paymentProofUrl && (
                                            <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="inline-flex font-bold text-[#15945a] hover:underline">
                                                View receipt screenshot
                                            </a>
                                        )}
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
