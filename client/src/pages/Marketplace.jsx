import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router";
import {
    Search, SlidersHorizontal, X, ChevronDown,
    Heart, MessageCircle, RefreshCw, Tag,
    AlertCircle, Loader2, ShoppingBag, ArrowRight,
    ArrowUpDown, Filter, LayoutGrid, BookOpen,
    Laptop, Headphones, Home, Pencil, Trophy,
    MoreHorizontal, GraduationCap, Car
} from "lucide-react";
import { fetchListings, setFilters, clearFilters } from "../features/products/productsSlice";

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

/* ── Styles ── */
const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
@keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }
@keyframes spin { to { transform: rotate(360deg) } }

.mp-page { min-height:100vh; background:#f8fafc; font-family:'Inter',sans-serif; }
.mp-container { max-width:1450px; margin:0 auto; padding:0 24px; }
@media (min-width:640px) { .mp-container { padding:0 48px; } }

/* Listing card */
.listing-card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #f1f5f9; box-shadow:0 2px 12px rgba(0,0,0,0.04); transition:all 0.25s ease; cursor:pointer; display:flex; flex-direction:column; animation:fadeUp 0.4s ease both; }
.listing-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.1); border-color:#e2e8f0; }
.listing-card:hover .card-img { transform:scale(1.05); }
.card-img { transition:transform 0.4s ease; width:100%; height:100%; object-fit:cover; }

/* Skeleton */
.skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }

/* Filter panel */
.filter-panel { background:#fff; border-radius:20px; border:1px solid #f1f5f9; box-shadow:0 2px 12px rgba(0,0,0,0.04); padding:24px; }

/* Select */
.mp-select { appearance:none; background:#f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center; border:1.5px solid #e2e8f0; border-radius:10px; padding:9px 32px 9px 12px; font-size:13px; color:#334155; font-family:inherit; width:100%; cursor:pointer; outline:none; transition:border-color 0.2s; }
.mp-select:focus { border-color:#48c96f; background-color:#fff; }

/* Search input */
.mp-search { background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:11px 16px 11px 44px; font-size:14px; color:#1e293b; font-family:inherit; width:100%; box-sizing:border-box; outline:none; transition:all 0.2s; }
.mp-search:focus { border-color:#48c96f; background:#fff; box-shadow:0 0 0 3px rgba(72,201,111,0.08); }

/* Active filter chip */
.filter-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:99px; background:rgba(72,201,111,0.1); border:1px solid rgba(72,201,111,0.25); color:#15945a; font-size:12px; font-weight:600; }

/* Mobile filter overlay */
.filter-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:50; display:flex; align-items:flex-end; backdrop-filter:blur(4px); }
.filter-sheet { background:#fff; border-radius:24px 24px 0 0; width:100%; max-height:85vh; overflow-y:auto; padding:28px 24px 36px; }

/* Overlapping Search and Tabs */
.search-container { background: #fff; border-radius: 16px; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 8px 30px rgba(0,0,0,0.06); margin-top: -36px; position: relative; z-index: 10; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.search-input-wrapper { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 280px; }
.search-input-large { border: none; font-size: 15px; color: #1e293b; width: 100%; outline: none; background: transparent; font-family: inherit; }
.search-input-large::placeholder { color: #94a3b8; }

.cat-tabs-container { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 32px; scrollbar-width: none; }
.cat-tabs-container::-webkit-scrollbar { display: none; }
.cat-tab { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.cat-tab:hover { border-color: #cbd5e1; color: #334155; background: #f8fafc; }
.cat-tab.active { background: rgba(72,201,111,0.08); border-color: #48c96f; color: #15945a; }

/* Category Pills on cards */
.card-cat-pill { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; margin-bottom: 8px; }
.cat-books-and-stationery { background: #e0f2fe; color: #0284c7; }
.cat-electronics { background: #f3e8ff; color: #9333ea; }
.cat-furniture { background: #cffafe; color: #0891b2; }
.cat-fashion-and-accessories { background: #ffedd5; color: #ea580c; }
.cat-sports-and-outdoor { background: #dcfce7; color: #16a34a; }
.cat-vehicles { background: #fce7f3; color: #db2777; }
.cat-others { background: #f1f5f9; color: #475569; }

/* View Button */
.btn-view-details { width: 100%; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 700; background: #fff; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-view-details:hover { border-color: #cbd5e1; color: #334155; background: #f8fafc; }
.btn-exchange { width: 100%; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 700; background: rgba(72,201,111,0.08); color: #15945a; border: 1.5px solid rgba(72,201,111,0.3); cursor: pointer; transition: all 0.2s; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-exchange:hover { background: rgba(72,201,111,0.15); border-color: #48c96f; }

@media (min-width: 1024px) { .mobile-filter-btn { display:none !important; } }
@media (max-width: 1023px) { .desktop-filters { display:none !important; } }
`;

/* ── Skeleton Card ── */
function SkeletonCard() {
    return (
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f1f5f9" }}>
            <div className="skeleton" style={{ height: 200 }} />
            <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 16 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skeleton" style={{ height: 20, width: "35%" }} />
                    <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 8 }} />
                </div>
            </div>
        </div>
    );
}

/* ── Listing Card ── */
function ListingCard({ listing, index }) {
    const condStyle = CONDITION_COLORS[listing.condition] ?? CONDITION_COLORS["Used"];
    const img = listing.images?.[0] || CATEGORY_IMAGES[listing.category] || catOthers;

    // Helper to get formatted category name
    const catName = CATEGORIES.find(c => c.value === listing.category)?.label || listing.category?.replace(/-/g, " ");

    return (
        <Link
            to={`/marketplace/${listing._id}`}
            className="listing-card"
            style={{ animationDelay: `${index * 40}ms`, textDecoration: "none", color: "inherit" }}
        >
            {/* Image */}
            <div style={{ position: "relative", height: 220, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 16px 0", overflow: "hidden" }}>
                <img src={img} alt={listing.title} className="card-img" style={{ objectFit: "contain" }} />

                {/* Top-left Badges */}
                <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    {listing.isExchangeAvailable ? (
                        <span style={{
                            background: "rgba(45,164,196,0.15)", color: "#0284c7",
                            fontSize: 10, fontWeight: 800, padding: "4px 10px",
                            borderRadius: 99, letterSpacing: "0.3px",
                        }}>
                            Exchange Available
                        </span>
                    ) : (
                        <span style={{
                            background: "rgba(72,201,111,0.15)", color: "#15945a",
                            fontSize: 10, fontWeight: 800, padding: "4px 10px",
                            borderRadius: 99, letterSpacing: "0.3px",
                        }}>
                            For Sale
                        </span>
                    )}
                </div>

                {/* Heart Button */}
                <button
                    onClick={(e) => e.preventDefault()}
                    style={{
                        position: "absolute", top: 16, right: 16,
                        width: 32, height: 32, borderRadius: "50%",
                        background: "#fff", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "#94a3b8", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f43f5e"; e.currentTarget.style.borderColor = "#f43f5e"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                    <Heart size={14} />
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: "12px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Category Pill */}
                <div>
                    <span className={`card-cat-pill cat-${listing.category || "others"}`}>
                        {catName}
                    </span>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: 15, fontWeight: 800, color: "#1e293b",
                    margin: "0 0 6px", lineHeight: 1.3,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {listing.title}
                </h3>

                {/* Condition dot */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: condStyle.color }} />
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                        {listing.condition}
                    </span>
                </div>

                <div style={{ flex: 1 }} />

                {/* Price Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#15945a" }}>
                        Rs. {Number(listing.price).toLocaleString()}
                    </span>
                    
                    {listing.isExchangeAvailable && (
                        <button
                            onClick={e => e.preventDefault()}
                            style={{
                                width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1.5px solid #e2e8f0",
                                display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
                                cursor: "pointer", transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#334155"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                        >
                            <ArrowUpDown size={14} />
                        </button>
                    )}
                </div>

                {/* Action Button */}
                {listing.isExchangeAvailable ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-exchange" style={{ flex: 1 }} onClick={e => e.preventDefault()}>
                            <RefreshCw size={14} /> Exchange
                        </button>
                        <button className="btn-view-details" style={{ flex: 1 }} onClick={e => e.preventDefault()}>
                            View Details
                        </button>
                    </div>
                ) : (
                    <button className="btn-view-details" onClick={e => e.preventDefault()}>
                        View Details
                    </button>
                )}
            </div>
        </Link>
    );
}

/* ── Filter Panel (shared between desktop sidebar and mobile sheet) ── */
function FilterContent({ localFilters, setLocalFilters, onApply, onReset }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Category */}
            <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Category</label>
                <select className="mp-select" value={localFilters.category} onChange={e => setLocalFilters(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {/* Condition */}
            <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Condition</label>
                <select className="mp-select" value={localFilters.condition} onChange={e => setLocalFilters(f => ({ ...f, condition: e.target.value }))}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {/* Price Range */}
            <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Price Range (Rs.)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="number" placeholder="Min" min={0}
                        value={localFilters.minPrice}
                        onChange={e => setLocalFilters(f => ({ ...f, minPrice: e.target.value }))}
                        style={{ flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#334155", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }}
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
    const productsState = useSelector(s => s.products) || {};
    const { 
        items: listings = [], 
        isLoading = false, 
        error = null, 
        filters = { search: "", category: "", minPrice: "", maxPrice: "", sort: "newest" } 
    } = productsState;
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchInput, setSearchInput] = useState(filters.search);
    const [sortBy, setSortBy] = useState(filters.sort);
    const [localFilters, setLocalFilters] = useState({
        category: filters.category,
        condition: filters.condition ?? "",
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        exchangeAvailable: false,
    });
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const buildParams = useCallback((overrides = {}) => {
        const f = { ...localFilters, search: searchInput, sort: sortBy, ...overrides };
        const params = {};
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
    }, [localFilters, searchInput, sortBy]);

    const dispatchFetch = useCallback((overrides = {}) => {
        const params = buildParams(overrides);
        dispatch(fetchListings(params));
    }, [buildParams, dispatch]);

    /* Read category from URL on mount */
    useEffect(() => {
        const cat = searchParams.get("category") ?? "";
        if (cat) {
            setLocalFilters(f => ({ ...f, category: cat }));
            dispatch(setFilters({ category: cat }));
        }
    }, [dispatch, searchParams]);

    /* Initial fetch */
    useEffect(() => {
        dispatchFetch();
    }, [dispatchFetch]);

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
        const reset = { category: "", condition: "", minPrice: "", maxPrice: "", exchangeAvailable: false };
        setLocalFilters(reset);
        setSearchInput("");
        setSortBy("newest");
        dispatch(clearFilters());
        dispatch(fetchListings({}));
        setSearchParams({});
        setMobileFilterOpen(false);
    };

    /* Sort listings client-side for price sorts (server may not support) */
    const sortedListings = [...listings].sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

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
            <style>{pageStyles}</style>
            <div className="mp-page">

                {/* ── Hero Banner ── */}
                <div style={{
                    background: "linear-gradient(135deg,#0a192f 0%,#0d2a42 50%,#0a192f 100%)",
                    padding: "80px 0 80px", position: "relative", overflow: "hidden",
                }}>
                    {/* Background Graphics */}
                    <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "100%", opacity: 0.1, backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"0\" y1=\"50\" x2=\"100\" y2=\"50\" stroke=\"white\" stroke-width=\"0.5\"/><line x1=\"50\" y1=\"0\" x2=\"50\" y2=\"100\" stroke=\"white\" stroke-width=\"0.5\"/></svg>')", backgroundSize: "30px 30px" }} />
                    <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(72,201,111,0.15) 0%,transparent 70%)" }} />
                    <div style={{ position: "absolute", bottom: "-30%", right: "20%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,164,196,0.1) 0%,transparent 70%)" }} />

                    {/* Floating icons */}
                    <div style={{ position: "absolute", top: "25%", right: "15%", width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(72,201,111,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#48c96f", background: "rgba(72,201,111,0.05)" }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div style={{ position: "absolute", bottom: "30%", right: "8%", width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(45,164,196,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2da4c4", background: "rgba(45,164,196,0.05)" }}>
                        <GraduationCap size={24} />
                    </div>

                    <div className="mp-container" style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "inline-block", padding: "4px 10px", border: "1px solid rgba(72,201,111,0.5)", borderRadius: 6, marginBottom: 20 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: "#48c96f", letterSpacing: "0.5px" }}>
                                ONLINE MARKETPLACE FOR KELANIYA STUDENTS
                            </span>
                        </div>
                        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "#fff", margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.1 }}>
                            Browse <span style={{ color: "#48c96f" }}>Marketplace</span>
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: 500, margin: "0", maxWidth: 500 }}>
                            Buy, sell, and exchange items with fellow Kelaniya students.
                        </p>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="mp-container" style={{ paddingBottom: 48 }}>
                    
                    {/* Overlapping Search Bar */}
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search size={20} color="#94a3b8" />
                            <input
                                className="search-input-large"
                                type="text"
                                placeholder="Search for items, books, gadgets and more..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                            {searchInput && (
                                <button onClick={() => setSearchInput("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 700, color: "#334155", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                                >
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <button style={{ width: 36, height: 36, borderRadius: 10, background: "#48c96f", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                    <LayoutGrid size={18} />
                                </button>
                                <button style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "1.5px solid #e2e8f0", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                    <SlidersHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="cat-tabs-container">
                        {CATEGORIES.map(c => {
                            const Icon = CATEGORY_ICONS[c.value] || LayoutGrid;
                            const isActive = localFilters.category === c.value;
                            return (
                                <button
                                    key={c.value}
                                    className={`cat-tab ${isActive ? "active" : ""}`}
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

                    {/* Active Filters Row (if any) */}
                    {activeFilters.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                            <button
                                className="mobile-filter-btn"
                                onClick={() => setMobileFilterOpen(true)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 7,
                                    padding: "9px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                                    background: "#fff", fontSize: 13, fontWeight: 600, color: "#334155",
                                    cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                <Filter size={14} /> Filters
                            </button>

                            {activeFilters.map(f => (
                                <span key={f.key} className="filter-chip">
                                    {f.label}
                                    <button onClick={() => {
                                        const reset = { ...localFilters };
                                        if (f.key === "category") reset.category = "";
                                        if (f.key === "condition") reset.condition = "";
                                        if (f.key === "price") { reset.minPrice = ""; reset.maxPrice = ""; }
                                        if (f.key === "exchange") reset.exchangeAvailable = false;
                                        setLocalFilters(reset);
                                        dispatchFetch(reset);
                                    }} style={{ background: "none", border: "none", cursor: "pointer", color: "#15945a", display: "flex", padding: 0 }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            ))}

                            <button onClick={handleReset} style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Layout */}
                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

                        {/* ── Desktop Sidebar Filters ── */}
                        <div className="filter-panel desktop-filters" style={{ width: 260, flexShrink: 0, position: "sticky", top: 88 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <SlidersHorizontal size={15} color="#48c96f" />
                                    <span style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>Filters</span>
                                </div>
                                {activeFilters.length > 0 && (
                                    <button onClick={handleReset} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {isLoading ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
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
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 16 }}>
                                        Showing <strong style={{ color: "#334155" }}>{sortedListings.length}</strong> {sortedListings.length === 1 ? "listing" : "listings"}
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
                                        {sortedListings.map((listing, i) => (
                                            <ListingCard key={listing._id} listing={listing} index={i} />
                                        ))}
                                    </div>

                                    {/* Pagination / Load More */}
                                    {sortedListings.length > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 40, gap: 16, flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button style={{ width: 36, height: 36, borderRadius: 8, background: "#48c96f", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>1</button>
                                                <button style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>2</button>
                                                <button style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>3</button>
                                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, color: "#94a3b8" }}>...</span>
                                                <button style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>8</button>
                                                <button style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                                    <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
                                                </button>
                                            </div>

                                            <button style={{
                                                padding: "10px 24px", borderRadius: 10, background: "#fff", border: "1.5px solid #e2e8f0", color: "#15945a", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
                                            }}>
                                                Load More Items <ChevronDown size={14} />
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
                    <div className="filter-overlay" onClick={() => setMobileFilterOpen(false)}>
                        <div className="filter-sheet" onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <SlidersHorizontal size={15} color="#48c96f" />
                                    <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>Filters</span>
                                </div>
                                <button onClick={() => setMobileFilterOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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