import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import {
    AlertCircle, ArrowLeft, CheckCircle2, CreditCard,
    Loader2, MapPin, Phone, ShieldCheck, ShoppingBag
} from "lucide-react";
import { clearCart, updateCartItemAvailability } from "../features/cart/cartSlice";
import { getListingById } from "../services/listingService";
import { checkoutCart } from "../services/orderService";
import { getSellerPaymentProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const paymentCopy = {
    Cash: "No online payment is processed for cash orders. Confirm payment directly during campus handover.",
    BankTransfer: "Payment is pending until seller/admin verifies receipt.",
};

export default function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { items, totalItems, totalPrice } = useSelector(state => state.cart);

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [meetupLocation, setMeetupLocation] = useState("University of Kelaniya - Main Campus");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentProof, setPaymentProof] = useState(null);
    const [sellerPaymentProfile, setSellerPaymentProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [successTitle, setSuccessTitle] = useState("Order Placed");
    const [successMessage, setSuccessMessage] = useState("Your request has been sent to the seller. Redirecting to marketplace...");
    const sellerIds = [...new Set(items.map(item => item.sellerId).filter(Boolean))];
    const hasMultipleSellers = sellerIds.length > 1;
    const selectedSellerPayout = sellerPaymentProfile?.payoutDetails || {};

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let isMounted = true;

        const refreshAvailability = async () => {
            await Promise.all(items.map(async (item) => {
                try {
                    const listing = await getListingById(item.id);
                    if (!isMounted) return;

                    dispatch(updateCartItemAvailability({
                        id: item.id,
                        availableQuantity: listing.quantity,
                    }));
                } catch (err) {
                    console.error("Failed to refresh checkout item availability:", err);
                }
            }));
        };

        if (items.length > 0) {
            refreshAvailability();
        }

        return () => {
            isMounted = false;
        };
    }, [dispatch, items]);

    useEffect(() => {
        let isMounted = true;

        const loadSellerPaymentProfile = async () => {
            if (sellerIds.length !== 1) {
                setSellerPaymentProfile(null);
                return;
            }

            try {
                const data = await getSellerPaymentProfile(sellerIds[0]);
                if (isMounted) {
                    setSellerPaymentProfile(data.seller);
                }
            } catch (err) {
                console.error("Failed to load seller payment profile:", err);
                if (isMounted) {
                    setSellerPaymentProfile(null);
                }
            }
        };

        loadSellerPaymentProfile();

        return () => {
            isMounted = false;
        };
    }, [sellerIds.join("|")]);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (items.length === 0) return;

        setLoading(true);
        setApiError(null);

        try {
            if (paymentMethod === "BankTransfer" && hasMultipleSellers) {
                setApiError("Bank Transfer is available only when your cart has items from one seller. Checkout one seller at a time.");
                setLoading(false);
                return;
            }

            if (paymentMethod === "BankTransfer" && !paymentReference.trim() && !paymentProof) {
                setApiError("Add a transaction reference or upload a receipt screenshot.");
                setLoading(false);
                return;
            }

            const checkoutItems = items.map(item => ({
                listingId: item.id,
                sellerId: item.sellerId,
                quantity: item.quantity,
            }));

            let checkoutPayload;
            if (paymentProof) {
                checkoutPayload = new FormData();
                checkoutPayload.append("items", JSON.stringify(checkoutItems));
                checkoutPayload.append("paymentMethod", paymentMethod);
                checkoutPayload.append("meetupLocation", meetupLocation);
                checkoutPayload.append("phone", phone);
                checkoutPayload.append("note", note);
                checkoutPayload.append("paymentReference", paymentReference);
                checkoutPayload.append("paymentProof", paymentProof);
            } else {
                checkoutPayload = {
                    items: checkoutItems,
                    paymentMethod,
                    meetupLocation,
                    phone,
                    note,
                    paymentReference,
                };
            }

            await checkoutCart(checkoutPayload);

            dispatch(clearCart());
            setSuccessTitle("Order Placed");
            setSuccessMessage(
                paymentMethod === "Cash"
                    ? "Your request has been sent to the seller. Redirecting to marketplace..."
                    : "Payment is pending until seller/admin verifies receipt. Redirecting to your orders..."
            );
            setCheckoutSuccess(true);
            setTimeout(() => {
                navigate(paymentMethod === "Cash" ? "/marketplace" : "/orders");
            }, 2400);
        } catch (err) {
            console.error("Checkout failed:", err);
            setApiError(err.response?.data?.message || "Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkoutSuccess) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans p-4">
                <div className="text-center space-y-6 max-w-md w-full bg-white p-8 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 animate-in fade-in zoom-in duration-200">
                    <div className="mx-auto w-20 h-20 rounded-full bg-[#48c96f]/15 border-2 border-[#48c96f]/40 flex items-center justify-center animate-bounce">
                        <CheckCircle2 size={40} className="text-[#15945a]" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-slate-800 text-2xl font-black tracking-tight">{successTitle}</h2>
                        <p className="text-slate-500 text-sm font-medium">{successMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4 pt-28 font-sans">
                <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg w-full space-y-5 shadow-xl shadow-slate-100">
                    <ShoppingBag size={48} className="text-slate-400 mx-auto" />
                    <div className="space-y-1">
                        <h1 className="text-xl font-black text-slate-800">Nothing to Checkout</h1>
                        <p className="text-xs text-slate-500 max-w-[300px] mx-auto leading-relaxed">
                            Add items to your cart before placing an order.
                        </p>
                    </div>
                    <Link
                        to="/marketplace"
                        className="inline-block px-5 py-2.5 rounded-xl bg-[#48c96f] text-white hover:bg-[#3db65e] text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                    >
                        Browse Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center p-4 pt-28 sm:p-8 sm:pt-32 font-sans pb-16">
            <div className="w-full max-w-[1120px] space-y-8">
                <div>
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Cart
                    </Link>
                </div>

                <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Checkout <CreditCard size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Confirm handover details and place your campus order.</p>
                    </div>
                    <span className="self-start sm:self-center bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80">
                        {totalItems} {totalItems === 1 ? "Item" : "Items"}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <form onSubmit={handleCheckout} className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100 space-y-5">
                        <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">Handover Details</h2>

                        {apiError && (
                            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                                <p className="text-rose-700 text-sm font-medium">{apiError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Meetup Handover Location</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={meetupLocation}
                                        onChange={(e) => setMeetupLocation(e.target.value)}
                                        required
                                        placeholder="e.g. Science Library, main gate"
                                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#48c96f] outline-none pl-10 pr-4 py-2.5 text-sm"
                                    />
                                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        placeholder="e.g. 071XXXXXXX"
                                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#48c96f] outline-none pl-10 pr-4 py-2.5 text-sm"
                                    />
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                                <div className="relative">
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200/80 bg-white text-slate-800 focus:border-[#48c96f] outline-none px-4 py-2.5 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="Cash">Cash on Handover</option>
                                        <option value="BankTransfer">Bank Transfer</option>
                                    </select>
                                    <CreditCard size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {paymentMethod === "BankTransfer" && (
                                <>
                                    <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Bank Transfer Details</p>
                                        <div className="mt-2 grid gap-1 text-xs text-slate-600">
                                            {hasMultipleSellers ? (
                                                <span>Checkout one seller at a time to see bank transfer details.</span>
                                            ) : (
                                                <>
                                                    <span>Seller: {sellerPaymentProfile?.sellerName || "Seller"}</span>
                                                    <span>Account Name: {selectedSellerPayout.bankAccountName || "Not provided"}</span>
                                                    <span>Bank / Branch: {[selectedSellerPayout.bankName, selectedSellerPayout.bankBranch].filter(Boolean).join(" / ") || "Not provided"}</span>
                                                    <span>Account Number: {selectedSellerPayout.bankAccountNumber || "Not provided"}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Reference</label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Reference ID, sender name, or payment note"
                                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#48c96f] outline-none px-4 py-2.5 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Receipt Screenshot</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                                            className="w-full rounded-xl border border-slate-200/80 bg-white text-slate-700 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-slate-600 text-xs"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Note for Seller</label>
                                <textarea
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Optional meetup timing or handover note"
                                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#48c96f] outline-none px-4 py-2.5 text-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-500/20 p-3.5 rounded-2xl">
                            <ShieldCheck size={16} className="text-[#15945a] shrink-0 mt-0.5" />
                            <span className="text-[11px] text-slate-500 block">
                                {paymentCopy[paymentMethod]}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#48c96f] to-[#15945a] hover:from-[#5dd97f] hover:to-[#1bad6d] text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} /> Place Order
                                </>
                            )}
                        </button>
                    </form>

                    <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100 space-y-5">
                        <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">Review Items</h2>

                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 border border-slate-100 rounded-2xl p-3 bg-slate-50/40">
                                    <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 border border-slate-100 overflow-hidden">
                                        <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain rounded-lg" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Qty {item.quantity} x Rs. {Number(item.price).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-black text-[#15945a] whitespace-nowrap">Rs. {Number(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Items Subtotal</span>
                                <span className="font-semibold text-slate-750">Rs. {Number(totalPrice).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Campus Meetup Fee</span>
                                <span className="font-semibold text-[#15945a] uppercase text-xs tracking-wider">Free</span>
                            </div>
                            <div className="my-3 border-t border-slate-100" />
                            <div className="flex justify-between text-slate-800 font-black text-lg">
                                <span>Total</span>
                                <span className="text-[#15945a]">Rs. {Number(totalPrice).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
