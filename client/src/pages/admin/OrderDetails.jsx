import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Loader2, XCircle, ArrowLeft, Save } from "lucide-react";
import { getOrderByIdAdmin, updateOrderStatusAdmin } from "../../services/orderService";

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const data = await getOrderByIdAdmin(id);
            setOrder(data.order);
            setOrderStatus(data.order.orderStatus);
            setPaymentStatus(data.order.paymentStatus);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const data = await updateOrderStatusAdmin(id, { orderStatus, paymentStatus });
            setOrder(data.order);
            alert("Order updated successfully");
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to update order");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#48c96f]" size={32} /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><XCircle className="text-rose-400 mb-3" size={40} /><p className="text-slate-500 font-semibold">{error}</p></div>;
    if (!order) return null;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link to="/admin/orders" className="text-[#48c96f] hover:underline text-sm flex items-center gap-1 mb-2">
                        <ArrowLeft size={14} /> Back to Orders
                    </Link>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h1>
                    <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Item Details */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Item Details</h2>
                        <div className="flex items-center gap-4">
                            {order.listing?.images?.[0] ? (
                                <img src={order.listing.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200" />
                            )}
                            <div>
                                <p className="text-slate-800 font-semibold">{order.listing?.title || "Deleted Listing"}</p>
                                <p className="text-slate-500 text-sm">{order.listing?.category || "Unknown Category"}</p>
                                <p className="text-[#48c96f] font-bold mt-1">Rs. {order.totalAmount?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* People Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Buyer Info</h2>
                            <p className="text-slate-700 text-sm mb-1"><span className="text-slate-500">Name:</span> {order.user?.fullName || "—"}</p>
                            <p className="text-slate-700 text-sm mb-1"><span className="text-slate-500">Username:</span> @{order.user?.username || "—"}</p>
                            <p className="text-slate-700 text-sm"><span className="text-slate-500">Email:</span> {order.user?.email || "—"}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Seller Info</h2>
                            <p className="text-slate-700 text-sm mb-1"><span className="text-slate-500">Name:</span> {order.seller?.fullName || "—"}</p>
                            <p className="text-slate-700 text-sm mb-1"><span className="text-slate-500">Username:</span> @{order.seller?.username || "—"}</p>
                            <p className="text-slate-700 text-sm"><span className="text-slate-500">Email:</span> {order.seller?.email || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Status Update */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Update Status</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Order Status</label>
                                <select 
                                    value={orderStatus} 
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Payment Status</label>
                                <select 
                                    value={paymentStatus} 
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#48c96f]/40"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button 
                                    onClick={handleUpdate} 
                                    disabled={updating}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-4 py-3 text-sm font-bold text-white hover:bg-[#5dd97f] transition-all disabled:opacity-50"
                                >
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Payment Details</h2>
                        <p className="text-slate-700 text-sm mb-2"><span className="text-slate-500">Method:</span> {order.paymentMethod}</p>
                        <p className="text-slate-700 text-sm mb-2"><span className="text-slate-500">Transaction ID:</span> {order.transactionId || "N/A"}</p>
                        <p className="text-slate-700 text-sm"><span className="text-slate-500">Paid At:</span> {order.paidAt ? new Date(order.paidAt).toLocaleString() : "N/A"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
