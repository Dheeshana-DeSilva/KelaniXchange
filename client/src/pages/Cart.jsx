import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import {
    ShoppingBag, Trash2, Plus, Minus, ArrowLeft,
    CreditCard, MapPin
} from "lucide-react";
import { addToCart, removeFromCart, deleteFromCart, updateCartItemAvailability } from "../features/cart/cartSlice";
import { getListingById } from "../services/listingService";

export default function Cart() {
    const dispatch = useDispatch();
    const { items, totalItems, totalPrice } = useSelector(state => state.cart);

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

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center p-4 pt-28 sm:p-8 sm:pt-32 font-sans relative overflow-hidden pb-16">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(72,201,111,0.03) 0%, transparent 75%)" />
                <div className="absolute bottom-[-10%] right-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(45,164,196,0.02) 0%, transparent 75%)" />
            </div>

            <div className="w-full max-w-[1100px] relative z-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>
                </div>

                <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Shopping Cart <ShoppingBag size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Review your items before continuing to checkout.</p>
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
                                You haven't added any products to your cart yet. Explore study tools, textbooks, and accessories in the marketplace.
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
                        <div className="lg:col-span-7 space-y-4">
                            {items.map(item => {
                                const availableQuantity = Number(item.availableQuantity);
                                const hasAvailability = Number.isFinite(availableQuantity);

                                return (
                                    <div key={item.id} className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-slate-100 overflow-hidden">
                                                <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain rounded-lg" />
                                            </div>

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
                                                <p className="text-slate-550 text-xs mt-1">Seller ID: <span className="font-semibold text-slate-650">{item.sellerId?.slice(-6) || "-"}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-center justify-between sm:items-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                            <p className="text-[#15945a] font-black text-base sm:text-lg">Rs. {Number(item.price).toLocaleString()}</p>

                                            <div className="flex items-center gap-4">
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

                        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100 space-y-6">
                            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">Order Summary</h3>

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

                            <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-500/20 p-3.5 rounded-2xl">
                                <MapPin size={16} className="text-[#15945a] shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">On-Campus Handover</span>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">Confirm contact and handover details on the next step.</span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full mt-4 bg-gradient-to-r from-[#48c96f] to-[#15945a] hover:from-[#5dd97f] hover:to-[#1bad6d] text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <CreditCard size={16} /> Continue to Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
