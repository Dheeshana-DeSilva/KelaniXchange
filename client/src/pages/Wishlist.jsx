import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
    AlertCircle, ArrowLeft, Heart, Loader2, ShoppingBag, ShoppingCart, Trash2
} from "lucide-react";
import { addToCart, deleteFromCart } from "../features/cart/cartSlice";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const cartItems = useSelector((state) => state.cart?.items || []);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let isMounted = true;

        const loadWishlist = async () => {
            try {
                setLoading(true);
                const data = await getWishlist();
                if (!isMounted) return;
                setItems((data.wishlist || []).filter(Boolean));
                setError("");
            } catch (err) {
                if (!isMounted) return;
                setError(err.response?.data?.message || "Failed to load your wishlist.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (isAuthenticated) {
            loadWishlist();
        }

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    const handleRemove = async (listingId) => {
        const previousItems = items;
        setItems((prev) => prev.filter((item) => item._id !== listingId));

        try {
            await removeFromWishlist(listingId);
            window.dispatchEvent(new Event("kx:wishlist-updated"));
        } catch (err) {
            setItems(previousItems);
            alert(err.response?.data?.message || "Failed to remove item from wishlist.");
        }
    };

    const handleCartToggle = (item) => {
        const isInCart = cartItems.some((cartItem) => cartItem.id === item._id);

        if (isInCart) {
            dispatch(deleteFromCart(item._id));
            return;
        }

        dispatch(addToCart({
            id: item._id,
            title: item.title,
            price: item.price,
            image: item.images?.[0],
            sellerId: item.seller?._id || item.seller,
            category: item.category,
            condition: item.condition,
            availableQuantity: item.quantity || 1,
        }));
    };

    const handleBuyNow = (item) => {
        const buyNowItem = {
            id: item._id,
            title: item.title,
            price: item.price,
            image: item.images?.[0],
            sellerId: item.seller?._id || item.seller,
            category: item.category,
            condition: item.condition,
            availableQuantity: item.quantity || 1,
            quantity: 1,
        };
        sessionStorage.setItem("kx_buy_now", JSON.stringify(buyNowItem));
        navigate("/checkout?mode=buy-now", { state: { buyNowItem } });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[#48c96f] mx-auto" size={40} />
                    <p className="text-slate-500 font-medium text-sm">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 pt-28 sm:p-8 sm:pt-32 font-sans pb-16">
            <div className="w-full max-w-[1120px] mx-auto space-y-8">
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={14} /> Back to Marketplace
                </Link>

                <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Wishlist <Heart size={24} className="text-rose-500 fill-rose-500" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Saved marketplace items you want to revisit.</p>
                    </div>
                    <span className="self-start sm:self-center bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80">
                        {items.length} {items.length === 1 ? "Item" : "Items"}
                    </span>
                </div>

                {error ? (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                        <AlertCircle size={18} className="text-rose-600 shrink-0" />
                        <p className="text-rose-700 text-sm font-medium">{error}</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto space-y-5 shadow-xl shadow-slate-100">
                        <Heart size={48} className="text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-800">No Saved Items Yet</h3>
                            <p className="text-xs text-slate-500 max-w-[300px] mx-auto leading-relaxed">
                                Tap the heart on marketplace items to keep them here.
                            </p>
                        </div>
                        <Link to="/marketplace" className="inline-block px-5 py-2.5 rounded-xl bg-[#48c96f] text-white hover:bg-[#3db65e] text-xs font-bold transition-all">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {items.map((item) => {
                            const isUnavailable = item.status === "sold" || item.status === "reserved" || Number(item.quantity) <= 0;
                            const isInCart = cartItems.some((cartItem) => cartItem.id === item._id);

                            return (
                                <div key={item._id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <Link to={`/marketplace/${item._id}`} className="block h-44 bg-slate-50 border-b border-slate-100 p-4">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} alt={item.title} className="h-full w-full object-contain" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                <ShoppingBag size={40} />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="p-4 space-y-4">
                                        <div>
                                            <Link to={`/marketplace/${item._id}`} className="font-black text-slate-800 hover:text-[#15945a] line-clamp-2">
                                                {item.title}
                                            </Link>
                                            <p className="text-xs text-slate-500 mt-1 capitalize">
                                                {item.category?.replace(/-/g, " ")} {item.condition ? `- ${item.condition}` : ""}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-lg font-black text-[#15945a]">Rs. {Number(item.price).toLocaleString()}</p>
                                            <span className={`text-[10px] rounded-full px-2 py-1 font-bold ${
                                                isUnavailable ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                            }`}>
                                                {isUnavailable ? "Unavailable" : `${item.quantity || 1} available`}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleCartToggle(item)}
                                                disabled={isUnavailable}
                                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isInCart
                                                        ? "border border-slate-800 bg-slate-900 text-white hover:bg-slate-700"
                                                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                }`}
                                                title={isInCart ? "Remove from cart" : "Add to cart"}
                                            >
                                                <ShoppingCart size={14} /> {isInCart ? "Remove" : "Cart"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleBuyNow(item)}
                                                disabled={isUnavailable}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#48c96f] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#3db65e] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ShoppingBag size={14} /> Buy Now
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item._id)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                                        >
                                            <Trash2 size={14} /> Remove from Wishlist
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
