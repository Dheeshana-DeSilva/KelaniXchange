import { Fragment, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import {
    Search, SlidersHorizontal, X, ChevronDown,
    Heart, MessageCircle, RefreshCw, Tag,
    AlertCircle, Loader2, ShoppingBag, ArrowRight,
    ArrowUpDown, Filter, LayoutGrid, BookOpen,
    Laptop, Headphones, Home, Trophy,
    MoreHorizontal, GraduationCap, Car, ShoppingCart, Users
} from "lucide-react";
import { fetchListings, setFilters, clearFilters } from "../features/products/productsSlice";
import { addToCart, deleteFromCart } from "../features/cart/cartSlice";
import { addToWishlist, getWishlist, removeFromWishlist } from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";

import catBooksStationery from "../assets/category_books_stationery.png";
import catElectronics from "../assets/category_electronics_v2.png";
import catFurniture from "../assets/category_furniture_v2.png";
import catFashionAccessories from "../assets/category_fashion_accessories.png";
import catOthers from "../assets/category_others_v2.png";
import catVehicles from "../assets/category_vehicles.png";
import catSportsOutdoor from "../assets/category_sports_outdoor.png";

const CATEGORY_IMAGES = {
    "books-and-stationery": catBooksStationery,
    "electronics": catElectronics,
    "furniture": catFurniture,
    "fashion-and-accessories": catFashionAccessories,
    "sports-and-outdoor": catSportsOutdoor,
    "vehicles": catVehicles,
    "others": catOthers,
};

/* ── Constants ── */
const CATEGORIES = [
    { label: "All Categories", value: "" },
    { label: "Books & Stationery", value: "books-and-stationery" },
    { label: "Electronics", value: "electronics" },
    { label: "Furniture", value: "furniture" },
    { label: "Fashion & Accessories", value: "fashion-and-accessories" },
    { label: "Sports & Outdoor", value: "sports-and-outdoor" },
    { label: "Vehicles", value: "vehicles" },
    { label: "Others", value: "others" },
];

const CONDITIONS = [
    { label: "Any Condition", value: "" },
    { label: "New", value: "New" },
    { label: "Like New", value: "Like New" },
    { label: "Good", value: "Good" },
    { label: "Used", value: "Used" },
];

const SORT_OPTIONS = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
];

const ITEMS_PER_PAGE = 8;
const DEFAULT_FILTERS = {
    category: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    exchangeAvailable: false,
};

const CONDITION_COLORS = {
    "New": { bg: "rgba(72,201,111,0.15)", color: "#15945a", border: "rgba(72,201,111,0.3)" },
    "Like New": { bg: "rgba(45,164,196,0.15)", color: "#0284c7", border: "rgba(45,164,196,0.3)" },
    "Good": { bg: "rgba(250,204,21,0.15)", color: "#b45309", border: "rgba(250,204,21,0.3)" },
    "Used": { bg: "rgba(148,163,184,0.15)", color: "#475569", border: "rgba(148,163,184,0.3)" },
};

const CATEGORY_ICONS = {
    "": LayoutGrid,
    "books-and-stationery": BookOpen,
    "electronics": Laptop,
    "furniture": Home,
    "fashion-and-accessories": Headphones,
    "sports-and-outdoor": Trophy,
    "vehicles": Car,
    "others": MoreHorizontal,
};

const categoryPillClasses = {
    "books-and-stationery": "bg-sky-100 text-sky-700",
    "electronics": "bg-purple-100 text-purple-700",
    "furniture": "bg-cyan-100 text-cyan-700",
    "fashion-and-accessories": "bg-orange-100 text-orange-700",
    "sports-and-outdoor": "bg-green-100 text-green-700",
    "vehicles": "bg-pink-100 text-pink-700",
    "others": "bg-slate-100 text-slate-600",
};

const conditionDotClasses = {
    New: "bg-[#15945a]",
    "Like New": "bg-sky-600",
    Good: "bg-amber-600",
    Used: "bg-slate-500",
};

/* ── Skeleton Card ── */
function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="h-[200px] animate-pulse rounded-lg bg-slate-200" />
            <div className="p-4">
                <div className="mb-2 h-3.5 w-[70%] animate-pulse rounded-lg bg-slate-200" />
                <div className="mb-4 h-3 w-[90%] animate-pulse rounded-lg bg-slate-200" />
                <div className="flex items-center justify-between">
                    <div className="h-5 w-[35%] animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200" />
                </div>
            </div>
        </div>
    );
}
/* ── Listing Card ── */
function ListingCard({ listing, index, isWishlisted, isInCart, onWishlistToggle }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const img = listing.images?.[0] || CATEGORY_IMAGES[listing.category] || catOthers;
    const cartItem = {
        id: listing._id,
        title: listing.title,
        price: listing.price,
        image: img,
        sellerId: listing.seller?._id || listing.seller,
        category: listing.category,
        condition: listing.condition,
        availableQuantity: listing.quantity || 1
    };
    const isUnavailable = listing.status === "sold" || listing.status === "reserved" || Number(listing.quantity) <= 0;

    const goToDetails = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        navigate(`/marketplace/${listing._id}`);
    };

    const handleCartToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isUnavailable) return;

        if (isInCart) {
            dispatch(deleteFromCart(listing._id));
            return;
        }

        dispatch(addToCart(cartItem));
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isUnavailable) return;
        const buyNowItem = { ...cartItem, quantity: 1 };
        sessionStorage.setItem("kx_buy_now", JSON.stringify(buyNowItem));
        navigate("/checkout?mode=buy-now", { state: { buyNowItem } });
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onWishlistToggle(listing._id);
    };

    // Helper to get formatted category name
    const catName = CATEGORIES.find(c => c.value === listing.category)?.label || listing.category?.replace(/-/g, " ");

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={goToDetails}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") goToDetails(e);
            }}
            className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-inherit shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl"
            style={{ animationDelay: `${index * 40}ms` }}
        >
            {/* Image */}
            <div className="relative flex h-[220px] items-center justify-center overflow-hidden bg-white px-4 pt-4">
                <img src={img} alt={listing.title} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />

                {/* Top-left Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                    {listing.isExchangeAvailable ? (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-sky-700">
                            Exchange Available
                        </span>
                    ) : (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#15945a]">
                            For Sale
                        </span>
                    )}
                </div>

                {/* Heart Button */}
                <button
                    type="button"
                    onClick={handleWishlistClick}
                    className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border bg-white transition-colors hover:border-rose-500 hover:text-rose-500 ${
                        isWishlisted ? "border-rose-200 text-rose-500" : "border-slate-200 text-slate-400"
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart size={14} className={isWishlisted ? "fill-rose-500" : ""} />
                </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                {/* Category Pill */}
                <div>
                    <span className={`mb-2 inline-block rounded-md px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${categoryPillClasses[listing.category] || categoryPillClasses.others}`}>
                        {catName}
                    </span>
                </div>

                {/* Title */}
                <h3 className="mb-1.5 line-clamp-2 text-[15px] font-extrabold leading-snug text-slate-800">
                    {listing.title}
                </h3>

                {/* Condition dot */}
                <div className="mb-3 flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${conditionDotClasses[listing.condition] || conditionDotClasses.Used}`} />
                    <span className="text-xs font-medium text-slate-500">
                        {listing.condition}
                    </span>
                </div>

                <div className="flex-1" />

                {/* Price Row */}
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-black text-[#15945a]">
                        Rs. {Number(listing.price).toLocaleString()}
                    </span>
                    
                    <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={handleCartToggle}
                            disabled={isUnavailable}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors disabled:cursor-not-allowed ${
                                isUnavailable ? "bg-slate-300" : isInCart ? "bg-slate-900 hover:bg-slate-700" : "bg-[#48c96f] hover:bg-[#15945a]"
                            }`}
                            title={isUnavailable ? "Unavailable" : isInCart ? "Remove from Cart" : "Add to Cart"}
                        >
                            <ShoppingCart size={14} />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                {listing.isExchangeAvailable ? (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={isUnavailable}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#48c96f] p-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-[#15945a] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            <ShoppingBag size={14} /> Buy Now
                        </button>
                        <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-teal-100 bg-slate-50 p-2.5 text-[13px] font-extrabold text-teal-700 transition-colors hover:border-[#48c96f] hover:bg-emerald-50" onClick={goToDetails}>
                            <RefreshCw size={14} /> Exchange
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={isUnavailable}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#48c96f] p-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-[#15945a] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <ShoppingBag size={14} /> Buy Now
                    </button>
                )}
            </div>
        </article>
    );
}

/* ── Filter Panel (shared between desktop sidebar and mobile sheet) ── */
function FilterContent({ localFilters, setLocalFilters, onApply, onReset }) {
    return (
        <div className="flex flex-col gap-5">
            {/* Category */}
            <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Category</label>
                <select className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-[13px] text-slate-700 outline-none transition-colors focus:border-[#48c96f] focus:bg-white focus:ring-4 focus:ring-emerald-500/10" value={localFilters.category} onChange={e => setLocalFilters(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {/* Condition */}
            <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Condition</label>
                <select className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-[13px] text-slate-700 outline-none transition-colors focus:border-[#48c96f] focus:bg-white focus:ring-4 focus:ring-emerald-500/10" value={localFilters.condition} onChange={e => setLocalFilters(f => ({ ...f, condition: e.target.value }))}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {/* Price Range */}
            <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Price Range (Rs.)</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number" placeholder="Min" min={0}
                        value={localFilters.minPrice}
                        onChange={e => setLocalFilters(f => ({ ...f, minPrice: e.target.value }))}
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-[#48c96f] focus:bg-white"
                    />
                    <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 12, flexShrink: 0 }}>–</span>
                    <input
                        type="number" placeholder="Max" min={0}
                        value={localFilters.maxPrice}
                        onChange={e => setLocalFilters(f => ({ ...f, maxPrice: e.target.value }))}
                        style={{ flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#334155", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                </div>
            </div>

            {/* Exchange toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: 0 }}>Exchange Available</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Only show exchange listings</p>
                </div>
                <button
                    onClick={() => setLocalFilters(f => ({ ...f, exchangeAvailable: !f.exchangeAvailable }))}
                    style={{
                        width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                        background: localFilters.exchangeAvailable ? "#48c96f" : "#e2e8f0",
                        position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}
                >
                    <span style={{
                        position: "absolute", top: 2, left: localFilters.exchangeAvailable ? 22 : 2,
                        width: 20, height: 20, borderRadius: "50%", background: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
                    }} />
                </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                    onClick={onReset}
                    style={{
                        flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: "#f1f5f9", border: "none", color: "#64748b", cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    Reset
                </button>
                <button
                    onClick={onApply}
                    style={{
                        flex: 2, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: "linear-gradient(135deg,#48c96f,#15945a)", border: "none",
                        color: "#fff", cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}

/* ── Main Marketplace Page ── */
export default function Marketplace() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const cartItems = useSelector(s => s.cart?.items || []);
    const productsState = useSelector(s => s.products) || {};
    const { 
        items: listings = [], 
        total = 0,
        pages: serverPages = 1,
        isLoading = false, 
        error = null, 
        filters = { search: "", category: "", minPrice: "", maxPrice: "", sort: "newest" } 
    } = productsState;
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get("category") ?? "";

    const [searchInput, setSearchInput] = useState(filters.search);
    const [sortBy, setSortBy] = useState(filters.sort);
    const [localFilters, setLocalFilters] = useState({
        ...DEFAULT_FILTERS,
        category: filters.category ?? "",
        condition: filters.condition ?? "",
        minPrice: filters.minPrice ?? "",
        maxPrice: filters.maxPrice ?? "",
    });
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const buildParams = useCallback((overrides = {}) => {
        const f = { ...localFilters, search: searchInput, sort: sortBy, page: currentPage, ...overrides };
        const params = {};
        params.page = f.page || 1;
        params.limit = ITEMS_PER_PAGE;
        if (f.search) params.search = f.search;
        if (f.category) params.category = f.category;
        if (f.condition) params.condition = f.condition;
        if (f.minPrice) params.minPrice = f.minPrice;
        if (f.maxPrice) params.maxPrice = f.maxPrice;
        if (f.exchangeAvailable) params.exchangeAvailable = "true";
        if (f.sort === "price_asc") params.sort = "price";
        if (f.sort === "price_desc") params.sort = "-price";
        if (f.sort === "oldest") params.sort = "createdAt";
        return params;
    }, [currentPage, localFilters, searchInput, sortBy]);

    const dispatchFetch = useCallback((overrides = {}) => {
        const params = buildParams(overrides);
        dispatch(fetchListings(params));
    }, [buildParams, dispatch]);

    /* Reset marketplace filters when the logged-in account changes. */
    useEffect(() => {
        const reset = { ...DEFAULT_FILTERS, category: categoryParam };
        setLocalFilters(reset);
        setSearchInput("");
        setSortBy("newest");
        setCurrentPage(1);
        dispatch(clearFilters());
        if (categoryParam) dispatch(setFilters({ category: categoryParam }));
    }, [categoryParam, dispatch, isAuthenticated, user?._id]);

    /* Initial fetch */
    useEffect(() => {
        dispatchFetch();
    }, [dispatchFetch]);

    useEffect(() => {
        let isMounted = true;

        const loadWishlist = async () => {
            if (!isAuthenticated) {
                setWishlistIds([]);
                return;
            }

            try {
                const data = await getWishlist();
                if (!isMounted) return;
                setWishlistIds((data.wishlist || []).map((item) => item?._id || item).filter(Boolean));
            } catch (err) {
                console.error("Failed to load wishlist:", err);
            }
        };

        loadWishlist();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    /* Search with debounce */
    useEffect(() => {
        const t = setTimeout(() => dispatchFetch(), 450);
        return () => clearTimeout(t);
    }, [searchInput, dispatchFetch]);

    /* Sort change */
    useEffect(() => {
        dispatchFetch();
    }, [sortBy, dispatchFetch]);

    const handleApplyFilters = () => {
        setCurrentPage(1);
        dispatch(setFilters({
            category: localFilters.category,
            condition: localFilters.condition,
            minPrice: localFilters.minPrice,
            maxPrice: localFilters.maxPrice,
        }));
        dispatchFetch();
        setMobileFilterOpen(false);
    };

    const handleReset = () => {
        const reset = { ...DEFAULT_FILTERS };
        setCurrentPage(1);
        setLocalFilters(reset);
        setSearchInput("");
        setSortBy("newest");
        dispatch(clearFilters());
        dispatch(fetchListings({}));
        setSearchParams({});
        setMobileFilterOpen(false);
    };

    const handleWishlistToggle = async (listingId) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const alreadySaved = wishlistIds.includes(listingId);
        setWishlistIds((prev) =>
            alreadySaved ? prev.filter((id) => id !== listingId) : [...prev, listingId]
        );

        try {
            if (alreadySaved) {
                await removeFromWishlist(listingId);
            } else {
                await addToWishlist(listingId);
            }
            window.dispatchEvent(new Event("kx:wishlist-updated"));
        } catch (err) {
            setWishlistIds((prev) =>
                alreadySaved ? [...prev, listingId] : prev.filter((id) => id !== listingId)
            );
            alert(err.response?.data?.message || "Failed to update wishlist.");
        }
    };

    /* Sort listings client-side for price sorts (server may not support) */
    const sortedListings = [...listings].sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const totalListings = total || sortedListings.length;
    const totalPages = Math.max(1, serverPages || Math.ceil(totalListings / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const visibleCount = sortedListings.length;
    const startIndex = totalListings === 0 || visibleCount === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex === 0 ? 0 : Math.min(startIndex + visibleCount, totalListings);
    const visibleListings = sortedListings;
    const canLoadMore = safeCurrentPage < totalPages;
    const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => (
        page === 1
        || page === totalPages
        || Math.abs(page - safeCurrentPage) <= 1
    ));

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchInput,
        sortBy,
        localFilters.category,
        localFilters.condition,
        localFilters.minPrice,
        localFilters.maxPrice,
        localFilters.exchangeAvailable,
    ]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handlePageChange = (page) => {
        setCurrentPage(Math.min(Math.max(page, 1), totalPages));
        window.scrollTo({ top: 420, behavior: "smooth" });
    };

    /* Active filter chips */
    const activeFilters = [
        localFilters.category && { key: "category", label: CATEGORIES.find(c => c.value === localFilters.category)?.label },
        localFilters.condition && { key: "condition", label: localFilters.condition },
        (localFilters.minPrice || localFilters.maxPrice) && {
            key: "price", label: `Rs. ${localFilters.minPrice || "0"} – ${localFilters.maxPrice || "∞"}`,
        },
        localFilters.exchangeAvailable && { key: "exchange", label: "Exchange Available" },
    ].filter(Boolean);

    return (
        <>
            <div className="min-h-screen bg-[#f6f8fb] text-slate-900">

                {/* ── Hero Banner ── */}
                <div className="relative mt-[72px] overflow-hidden border-b border-emerald-500/10 bg-[#05111f] py-7 pb-13">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_10%_50%,rgba(15,138,95,0.28)_0%,transparent_55%),radial-gradient(ellipse_50%_60%_at_90%_30%,rgba(45,100,180,0.2)_0%,transparent_50%)]" />
                    <div className="relative z-10 mx-auto max-w-[1450px] px-6 sm:px-12">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-8">
                                {/* Left: title + subtitle */}
                                <div className="min-w-[280px] flex-1">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#48c96f]/40 bg-[#48c96f]/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-200 backdrop-blur">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#48c96f] shadow-[0_0_8px_rgba(72,201,111,0.9)]" />
                                        <ShoppingBag size={11} /> KelaniXchange Marketplace
                                    </div>
                                    <h1 className="m-0 mb-2 text-[clamp(22px,3vw,38px)] font-black leading-tight tracking-normal text-white">
                                        Buy, sell &amp; <span className="bg-gradient-to-br from-[#48c96f] to-teal-400 bg-clip-text text-transparent">exchange</span><br />
                                        campus essentials
                                    </h1>
                                    <p className="m-0 text-[13px] font-medium leading-relaxed text-emerald-100/70">
                                        The student marketplace for University of Kelaniya.
                                    </p>
                                </div>

                                {/* Right: stats pill + CTA */}
                                <div className="flex shrink-0 items-center gap-6">
                                    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur md:flex">
                                        <div className="flex flex-col items-center px-5 py-3">
                                            <span className="text-lg font-black leading-none text-white">{totalListings > 0 ? totalListings.toLocaleString() : "-"}</span>
                                            <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-emerald-100/70">Listings</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-white/10 px-5 py-3">
                                            <span className="text-lg font-black leading-none text-white">7</span>
                                            <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-emerald-100/70">Categories</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-white/10 px-5 py-3">
                                            <span className="text-lg font-black leading-none text-white">Free</span>
                                            <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-emerald-100/70">To Join</span>
                                        </div>
                                    </div>
                                    <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#48c96f] to-[#15945a] px-5 py-3 text-[13px] font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:-translate-y-0.5" onClick={() => navigate("/marketplace/create")}>
                                        <Tag size={14} /> Post a Listing
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="mx-auto max-w-[1450px] px-6 pb-12 sm:px-12">
                    
                    {/* Overlapping Search Bar */}
                    <div className="relative z-10 mb-6 mt-[-28px] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
                        <div className="flex min-w-[280px] flex-1 items-center gap-3">
                            <Search size={20} color="#94a3b8" />
                            <input
                                className="w-full bg-transparent text-[15px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                                type="text"
                                placeholder="Search for items, books, gadgets and more..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                            {searchInput && (
                                <button type="button" onClick={() => setSearchInput("")} className="flex p-0 text-slate-400 hover:text-slate-700">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex min-h-10 items-center gap-2 border-l border-slate-200 pl-3">
                                <span className="text-[13px] font-semibold text-slate-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="cursor-pointer bg-transparent text-[13px] font-extrabold text-slate-700 outline-none"
                                >
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/users")}
                                className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                title="Search users"
                            >
                                <Users size={15} /> Users
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="mb-6 flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {CATEGORIES.map(c => {
                            const Icon = CATEGORY_ICONS[c.value] || LayoutGrid;
                            const isActive = localFilters.category === c.value;
                            return (
                                <button
                                    key={c.value}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-[13px] font-extrabold transition-colors ${
                                        isActive
                                            ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                    onClick={() => {
                                        setLocalFilters(f => ({ ...f, category: c.value }));
                                        dispatchFetch({ category: c.value });
                                    }}
                                >
                                    <Icon size={16} />
                                    {c.label === "All Categories" ? "All Items" : c.label.replace(" & Stationery", " & Notes")}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile Filters / Active Filters */}
                    <div className={`mb-5 flex flex-wrap items-center gap-2.5 ${activeFilters.length === 0 ? "lg:hidden" : ""}`}>
                        <button
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 lg:hidden"
                            onClick={() => setMobileFilterOpen(true)}
                        >
                            <Filter size={14} /> Filters
                        </button>

                        {activeFilters.length > 0 && (
                            <>
                                {activeFilters.map(f => (
                                    <span key={f.key} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137a4b]">
                                        {f.label}
                                        <button onClick={() => {
                                            const reset = { ...localFilters };
                                            if (f.key === "category") reset.category = "";
                                            if (f.key === "condition") reset.condition = "";
                                            if (f.key === "price") { reset.minPrice = ""; reset.maxPrice = ""; }
                                            if (f.key === "exchange") reset.exchangeAvailable = false;
                                            setLocalFilters(reset);
                                            dispatchFetch(reset);
                                        }} className="flex p-0 text-[#15945a]">
                                            <X size={11} />
                                        </button>
                                    </span>
                                ))}

                                <button onClick={handleReset} className="bg-transparent text-xs font-semibold text-slate-400 hover:text-slate-700">
                                    Clear all
                                </button>
                            </>
                        )}
                    </div>

                    {/* Layout */}
                    <div className="flex items-start gap-6 max-lg:block">

                        {/* ── Desktop Sidebar Filters ── */}
                        <div className="sticky top-[88px] w-[260px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-lg:hidden">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal size={15} color="#48c96f" />
                                    <span className="text-sm font-extrabold text-slate-800">Filters</span>
                                </div>
                                {activeFilters.length > 0 && (
                                    <button onClick={handleReset} className="bg-transparent text-[11px] font-bold text-slate-400 hover:text-slate-700">
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <FilterContent
                                localFilters={localFilters}
                                setLocalFilters={setLocalFilters}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            />
                        </div>

                        {/* ── Grid ── */}
                        <div className="min-w-0 flex-1">
                            {isLoading ? (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px] max-[700px]:grid-cols-1">
                                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : error ? (
                                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                        <AlertCircle size={26} color="#f87171" />
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>Failed to load listings</h3>
                                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>{error}</p>
                                    <button onClick={() => dispatchFetch()} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#48c96f,#15945a)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                        Try Again
                                    </button>
                                </div>
                            ) : sortedListings.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                        <ShoppingBag size={32} color="#94a3b8" />
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>No listings found</h3>
                                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 24px", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
                                        Try adjusting your filters or search term.
                                    </p>
                                    <button onClick={handleReset} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#48c96f,#15945a)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
                                        <p className="m-0 text-[13px] font-bold text-slate-500">
                                            Showing <strong className="text-slate-700">{startIndex + 1}-{endIndex}</strong> of <strong className="text-slate-700">{totalListings}</strong> {totalListings === 1 ? "listing" : "listings"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px] max-[700px]:grid-cols-1">
                                        {visibleListings.map((listing, i) => (
                                            <ListingCard
                                                key={listing._id}
                                                listing={listing}
                                                index={i}
                                                isWishlisted={wishlistIds.includes(listing._id)}
                                                isInCart={cartItems.some((item) => item.id === listing._id)}
                                                onWishlistToggle={handleWishlistToggle}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination / Load More */}
                                    {sortedListings.length > 0 && (
                                        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {paginationPages.map((page, index) => (
                                                    <Fragment key={page}>
                                                        {index > 0 && page - paginationPages[index - 1] > 1 && (
                                                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, color: "#94a3b8" }}>...</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePageChange(page)}
                                                            style={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 8,
                                                                background: page === safeCurrentPage ? "#48c96f" : "#fff",
                                                                color: page === safeCurrentPage ? "#fff" : "#64748b",
                                                                border: page === safeCurrentPage ? "none" : "1px solid #e2e8f0",
                                                                fontWeight: 700,
                                                                cursor: "pointer",
                                                                fontFamily: "inherit",
                                                            }}
                                                        >
                                                            {page}
                                                        </button>
                                                    </Fragment>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                                                    disabled={!canLoadMore}
                                                    style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", color: canLoadMore ? "#64748b" : "#cbd5e1", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: canLoadMore ? "pointer" : "not-allowed" }}
                                                    title="Next page"
                                                >
                                                    <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(safeCurrentPage + 1)}
                                                disabled={!canLoadMore}
                                                style={{
                                                padding: "10px 24px", borderRadius: 10, background: "#fff", border: "1.5px solid #e2e8f0", color: canLoadMore ? "#15945a" : "#94a3b8", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: canLoadMore ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s"
                                            }}>
                                                {canLoadMore ? "Load More Items" : "All Items Loaded"} <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Mobile Filter Sheet ── */}
                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)}>
                        <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white px-6 pb-9 pt-7" onClick={e => e.stopPropagation()}>
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal size={15} color="#48c96f" />
                                    <span className="text-base font-extrabold text-slate-800">Filters</span>
                                </div>
                                <button onClick={() => setMobileFilterOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                                    <X size={16} color="#64748b" />
                                </button>
                            </div>
                            <FilterContent
                                localFilters={localFilters}
                                setLocalFilters={setLocalFilters}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}