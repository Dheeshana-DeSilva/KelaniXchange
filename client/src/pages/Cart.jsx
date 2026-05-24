import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { 
    ShoppingBag, Trash2, Plus, Minus, ArrowLeft, 
    CreditCard, CheckCircle2, MapPin, AlertCircle, Loader2, Info
} from "lucide-react";
import { addToCart, removeFromCart, deleteFromCart, updateCartItemAvailability, clearCart } from "../features/cart/cartSlice";
import { checkoutCart } from "../services/orderService";
import { getListingById } from "../services/listingService";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    
    // Selectors from Redux store
    const { items, totalItems, totalPrice } = useSelector(state => state.cart);
    
    // Local State
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [meetupLocation, setMeetupLocation] = useState("University of Kelaniya - Main Campus");
    const [phone, setPhone] = useState("");

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
                    console.error("Failed to refresh cart item availability:", err);
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

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (items.length === 0) return;

        setLoading(true);
        setApiError(null);

        try {
            // Prepare backend items schema: { listingId, sellerId, quantity }
            const checkoutItems = items.map(item => ({
                listingId: item.id,
                sellerId: item.sellerId,
                quantity: item.quantity
            }));

            await checkoutCart({
                items: checkoutItems,
                paymentMethod,
                meetupLocation,
                phone
            });

            // On success, clear frontend persisted cart
            dispatch(clearCart());
            setCheckoutSuccess(true);
            
            // Redirect to marketplace after short delay
            setTimeout(() => {
                navigate("/marketplace");
            }, 2500);

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
                        <h2 className="text-slate-800 text-2xl font-black tracking-tight">Order Placed! 🎉</h2>
                        <p className="text-slate-500 text-sm font-medium">Your request has been successfully sent to the seller(s). You will be redirected to the marketplace shortly.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center p-4 pt-28 sm:p-8 sm:pt-32 font-sans relative overflow-hidden pb-16">
            
            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(72,201,111,0.03) 0%, transparent 75%)" />
                <div className="absolute bottom-[-10%] right-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(45,164,196,0.02) 0%, transparent 75%)" />
            </div>

            <div className="w-full max-w-[1100px] relative z-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* Back to Marketplace Link */}
                <div>
                    <Link 
                        to="/marketplace" 
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>
                </div>

                {/* Header */}
                <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Shopping Cart <ShoppingBag size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Review your items and complete checkout with campus meetup option.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80">
                        {totalItems} {totalItems === 1 ? "Item" : "Items"}
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto space-y-5 shadow-xl shadow-slate-100">
                        <ShoppingBag size={48} className="text-slate-400 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-800">Your Cart is Empty</h3>
                            <p className="text-xs text-slate-500 max-w-[300px] mx-auto leading-relaxed">
                                You haven't added any products to your cart yet. Explore study tools, textbooks, and accessories in the marketplace!
                            </p>
                        </div>
                        <Link 
                            to="/marketplace" 
                            className="inline-block px-5 py-2.5 rounded-xl bg-[#48c96f] text-white hover:bg-[#3db65e] text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Cart Items List */}
                        <div className="lg:col-span-7 space-y-4">
                            {items.map(item => {
                                const availableQuantity = Number(item.availableQuantity);
                                const hasAvailability = Number.isFinite(availableQuantity);

                                return (
                                <div key={item.id} className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        {/* Image */}
                                        <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-slate-100 overflow-hidden">
                                            <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain rounded-lg" />
                                        </div>

                                        {/* Text Details */}
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate hover:text-[#48c96f] transition-colors">
                                                <Link to={`/marketplace/${item.id}`}>{item.title}</Link>
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 rounded px-1.5 py-0.2 font-semibold capitalize">
                                                    {item.category?.replace(/-/g, " ")}
                                                </span>
                                                <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 rounded px-1.5 py-0.2 font-semibold">
                                                    {item.condition}
                                                </span>
                                                {hasAvailability && (
                                                    <span className={`text-[10px] rounded px-1.5 py-0.2 font-semibold ${
                                                        availableQuantity > 0
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                            : "bg-rose-50 text-rose-600 border border-rose-200"
                                                    }`}>
                                                        {availableQuantity > 0 ? `${availableQuantity} available` : "Out of stock"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-550 text-xs mt-1">Seller ID: <span className="font-semibold text-slate-650">{item.sellerId?.slice(-6) || "—"}</span></p>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="flex sm:flex-col items-center justify-between sm:items-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                        <p className="text-[#15945a] font-black text-base sm:text-lg">Rs. {Number(item.price).toLocaleString()}</p>
                                        
                                        <div className="flex items-center gap-4">
                                            {/* Quantity modifier */}
                                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 gap-3">
                                                <button
                                                    onClick={() => dispatch(removeFromCart(item.id))}
                                                    disabled={item.quantity <= 1}
                                                    className="text-slate-400 hover:text-slate-700 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Decrease quantity"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-xs font-bold text-slate-700 min-w-[12px] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                                                    disabled={hasAvailability && item.quantity >= availableQuantity}
                                                    className="text-slate-400 hover:text-slate-700 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Increase quantity"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            {/* Delete Item */}
                                            <button 
                                                onClick={() => dispatch(deleteFromCart(item.id))}
                                                className="text-rose-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 cursor-pointer"
                                                title="Remove item"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {/* Order Summary / Checkout Column */}
                        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100 space-y-6">
                            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">Checkout Details</h3>
                            
                            {apiError && (
                                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                                    <AlertCircle size={18} className="text-rose-600 shrink-0" />
                                    <p className="text-rose-700 text-sm font-medium">{apiError}</p>
                                </div>
                            )}

                            {/* Summary Totals */}
                            <div className="space-y-2">
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
                                    <span>Total Price</span>
                                    <span className="text-[#15945a]">Rs. {Number(totalPrice).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Campus Handshake delivery notice */}
                            <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-500/20 p-3.5 rounded-2xl">
                                <MapPin size={16} className="text-[#15945a] shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">On-Campus Handover</span>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">Orders on KelaniXchange are hand-delivered and resolved directly between UoK students.</span>
                                </div>
                            </div>

                            {/* Checkout Form */}
                            <form onSubmit={handleCheckout} className="space-y-4">
                                {/* Meetup Area */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Meetup Handover Location</label>
                                    <input 
                                        type="text"
                                        value={meetupLocation}
                                        onChange={(e) => setMeetupLocation(e.target.value)}
                                        required
                                        placeholder="e.g. Science Library, main gate"
                                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#48c96f] outline-none px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number (WhatsApp)</label>
                                    <input 
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        placeholder="e.g. 071XXXXXXX"
                                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#48c96f] outline-none px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* Payment Options */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                                    <div className="relative">
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200/80 bg-white text-slate-800 focus:border-[#48c96f] outline-none px-4 py-2.5 text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="Cash">Cash on Delivery (Handover)</option>
                                            <option value="Card">Visa/Mastercard</option>
                                            <option value="PayPal">PayPal</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><CreditCard size={14} /></span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 bg-gradient-to-r from-[#48c96f] to-[#15945a] hover:from-[#5dd97f] hover:to-[#1bad6d] text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-65"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Placing Orders...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={16} /> Place Orders
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
                                <Info size={11} />
                                <span>No payment is processed now. Resolve payment during campus handover.</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
