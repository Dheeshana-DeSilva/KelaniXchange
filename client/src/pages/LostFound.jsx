import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
    Search, SlidersHorizontal, Plus, MapPin, Calendar,
    AlertCircle, Loader2, CheckCircle2, X, Filter,
    BookOpen, CreditCard, Wallet, Laptop, Key, ShoppingBag,
    Shirt, HelpCircle, Package, Eye
} from "lucide-react";
import { getLostFoundPosts } from "../services/lostFoundService";
import { useAuth } from "../context/AuthContext";

/* ── Constants ── */
const CATEGORIES = [
    { label: "All", value: "" },
    { label: "ID Card", value: "id-card", icon: CreditCard, color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
    { label: "Wallet", value: "wallet", icon: Wallet, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    { label: "Electronics", value: "electronics", icon: Laptop, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
    { label: "Books", value: "books", icon: BookOpen, color: "#0284c7", bg: "rgba(2,132,199,0.15)" },
    { label: "Stationery", value: "stationery", icon: Package, color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    { label: "Keys", value: "keys", icon: Key, color: "#f97316", bg: "rgba(249,115,22,0.15)" },
    { label: "Bags", value: "bags", icon: ShoppingBag, color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
    { label: "Clothing", value: "clothing", icon: Shirt, color: "#14b8a6", bg: "rgba(20,184,166,0.15)" },
    { label: "Other", value: "other", icon: HelpCircle, color: "#64748b", bg: "rgba(100,116,139,0.15)" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.slice(1).map(c => [c.value, c]));

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes lfFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
@keyframes heroPulse { 0%,100%{opacity:.5}50%{opacity:1} }
@keyframes shimmer { from{background-position:-200% 0}to{background-position:200% 0} }

.lf-page { min-height:100vh; background:#f6f8fb; font-family:'Inter',sans-serif; color:#0f172a; }
.lf-container { max-width:1200px; margin:0 auto; padding:0 24px; }
@media(min-width:640px){.lf-container{padding:0 48px;}}

.lf-hero { margin-top:72px; background:#05111f; padding:32px 0 48px; position:relative; overflow:hidden; border-bottom:1px solid rgba(72,201,111,0.12); }
.lf-hero::before { content:""; position:absolute; inset:0; background: radial-gradient(ellipse 70% 80% at 15% 50%, rgba(239,68,68,0.2) 0%,transparent 55%), radial-gradient(ellipse 50% 60% at 85% 30%, rgba(99,102,241,0.18) 0%,transparent 50%); pointer-events:none; }
.lf-hero::after { content:""; position:absolute; inset:0; background-image:linear-gradient(rgba(72,201,111,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(72,201,111,0.03) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
.lf-hero-inner { position:relative;z-index:2; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
.lf-eyebrow { display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border:1px solid rgba(239,68,68,0.35);border-radius:999px;margin-bottom:12px;color:#fca5a5;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;background:rgba(239,68,68,0.1);backdrop-filter:blur(8px); }
.lf-eyebrow-dot { width:5px;height:5px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px rgba(239,68,68,0.9);animation:heroPulse 2s ease-in-out infinite; }
.lf-hero-title { font-size:clamp(22px,3vw,36px);font-weight:900;color:#fff;margin:0 0 8px;line-height:1.1;letter-spacing:-1px; }
.lf-hero-title .accent { background:linear-gradient(135deg,#f87171 0%,#fb923c 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.lf-hero-sub { color:rgba(186,210,200,0.65);font-size:13px;font-weight:500;margin:0;line-height:1.5; }
.lf-hero-right { display:flex;align-items:center;gap:16px;flex-shrink:0; }
.lf-hero-cta { display:inline-flex;align-items:center;gap:8px;border-radius:12px;padding:11px 20px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;border:0;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:#fff;box-shadow:0 6px 20px rgba(239,68,68,0.35);transition:transform .2s,box-shadow .2s;white-space:nowrap; }
.lf-hero-cta:hover { transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,68,68,0.45); }

.lf-search-bar { background:#fff;border-radius:14px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 14px 32px rgba(15,23,42,.08);border:1px solid #e6ebf2;margin-top:-24px;position:relative;z-index:10;margin-bottom:20px;gap:10px;flex-wrap:wrap; }
.lf-search-input { border:none;font-size:14px;color:#1e293b;width:100%;outline:none;background:transparent;font-family:inherit;font-weight:600; }
.lf-search-input::placeholder { color:#94a3b8; }

.lf-type-tabs { display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap; }
.lf-type-tab { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:999px;font-size:13px;font-weight:800;cursor:pointer;border:1px solid;transition:all .2s;font-family:inherit; }
.lf-type-tab.all { background:#fff;border-color:#dbe3ee;color:#475569; }
.lf-type-tab.all.active { background:#0f172a;border-color:#0f172a;color:#fff; }
.lf-type-tab.lost { background:#fff;border-color:#fecaca;color:#dc2626; }
.lf-type-tab.lost.active { background:#dc2626;border-color:#dc2626;color:#fff; }
.lf-type-tab.found { background:#fff;border-color:#bbf7d0;color:#15945a; }
.lf-type-tab.found.active { background:#15945a;border-color:#15945a;color:#fff; }

.lf-cat-scroll { display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:16px;scrollbar-width:none; }
.lf-cat-scroll::-webkit-scrollbar{display:none;}
.lf-cat-pill { display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid #dbe3ee;background:#fff;color:#64748b;white-space:nowrap;transition:all .2s;font-family:inherit; }
.lf-cat-pill.active { background:#0f172a;border-color:#0f172a;color:#fff; }
.lf-cat-pill:hover:not(.active) { background:#f8fafc;border-color:#cbd5e1; }

.lf-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px; }
.lf-card { background:#fff;border-radius:16px;border:1px solid #e6ebf2;box-shadow:0 1px 4px rgba(15,23,42,.04);transition:box-shadow .2s,transform .2s;overflow:hidden;animation:lfFadeUp .4s ease both;cursor:pointer; }
.lf-card:hover { transform:translateY(-2px);box-shadow:0 12px 30px rgba(15,23,42,.09);border-color:#cfd8e6; }
.lf-card-img { width:100%;height:180px;object-fit:cover; }
.lf-card-img-placeholder { width:100%;height:180px;display:flex;align-items:center;justify-content:center; }
.lf-card-body { padding:14px 16px; }

.lf-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.03em; }
.lf-badge.lost { background:rgba(239,68,68,.12);color:#dc2626;border:1px solid rgba(239,68,68,.25); }
.lf-badge.found { background:rgba(72,201,111,.12);color:#15945a;border:1px solid rgba(72,201,111,.25); }
.lf-badge.resolved { background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2); }

.skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px; }

.lf-empty { text-align:center;padding:64px 24px;color:#94a3b8; }
@media(max-width:700px){.lf-hero{padding:24px 0 36px;}.lf-hero-title{font-size:clamp(20px,6vw,28px);}.lf-hero-right{display:none;}}
`;

function SkeletonCard() {
    return (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
            <div className="skeleton" style={{ height: 180 }} />
            <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 16, width: "80%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 12, width: "40%" }} />
            </div>
        </div>
    );
}

function PostCard({ post, index, onClick }) {
    const cat = CATEGORY_MAP[post.category];
    const Icon = cat?.icon || HelpCircle;
    const dateStr = post.date ? new Date(post.date).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" }) : "";
    const isResolved = post.status === "resolved";

    return (
        <div className="lf-card" style={{ animationDelay: `${index * 40}ms`, opacity: isResolved ? 0.75 : 1 }} onClick={() => onClick(post._id)}>
            {post.image ? (
                <img src={post.image} alt={post.title} className="lf-card-img" />
            ) : (
                <div className="lf-card-img-placeholder" style={{ background: cat?.bg || "#f1f5f9" }}>
                    <Icon size={48} color={cat?.color || "#94a3b8"} strokeWidth={1.5} />
                </div>
            )}
            <div className="lf-card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <span className={`lf-badge ${isResolved ? "resolved" : post.postType}`}>
                        {isResolved ? <CheckCircle2 size={10} /> : null}
                        {isResolved ? "Resolved" : post.postType === "lost" ? "🔴 Lost" : "🟢 Found"}
                    </span>
                    {cat && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, background: cat.bg, color: cat.color, fontSize: 10, fontWeight: 700, border: `1px solid ${cat.color}30` }}>
                            <Icon size={10} /> {cat.label}
                        </span>
                    )}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: "0 0 6px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {post.title}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11, fontWeight: 500, marginBottom: 4 }}>
                    <MapPin size={11} /> {post.location}
                </div>
                {dateStr && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>
                        <Calendar size={11} /> {dateStr}
                    </div>
                )}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>by @{post.postedBy?.username || "anonymous"}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#48c96f" }}>
                        <Eye size={12} /> View
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function LostFound() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [catFilter, setCatFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("open");

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (typeFilter) params.type = typeFilter;
            if (catFilter) params.category = catFilter;
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const data = await getLostFoundPosts(params);
            setPosts(Array.isArray(data) ? data : []);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, catFilter, search, statusFilter]);

    useEffect(() => {
        const t = setTimeout(fetchPosts, 350);
        return () => clearTimeout(t);
    }, [fetchPosts]);

    return (
        <>
            <style>{pageStyles}</style>
            <div className="lf-page">
                {/* Hero */}
                <div className="lf-hero">
                    <div className="lf-container">
                        <div className="lf-hero-inner">
                            <div>
                                <div className="lf-eyebrow">
                                    <span className="lf-eyebrow-dot" />
                                    Lost &amp; Found Board
                                </div>
                                <h1 className="lf-hero-title">
                                    Lost something? <span className="accent">Found</span> something?
                                </h1>
                                <p className="lf-hero-sub">Help fellow students at University of Kelaniya reunite with their belongings.</p>
                            </div>
                            <div className="lf-hero-right">
                                {isAuthenticated ? (
                                    <button className="lf-hero-cta" onClick={() => navigate("/lost-found/create")}>
                                        <Plus size={15} /> Post a Report
                                    </button>
                                ) : (
                                    <button className="lf-hero-cta" onClick={() => navigate("/login")}>
                                        <Plus size={15} /> Post a Report
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lf-container" style={{ paddingTop: 0, paddingBottom: 48 }}>
                    {/* Search Bar */}
                    <div className="lf-search-bar">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
                            <Search size={18} color="#94a3b8" />
                            <input
                                className="lf-search-input"
                                type="text"
                                placeholder="Search by title, description or location..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ border: "1px solid #dbe3ee", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: "#334155", background: "#f8fafc", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                            >
                                <option value="">All Status</option>
                                <option value="open">Open</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            {isAuthenticated && (
                                <button
                                    onClick={() => navigate("/lost-found/create")}
                                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                                >
                                    <Plus size={14} /> New Post
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Type filter tabs */}
                    <div className="lf-type-tabs">
                        {[
                            { label: "All Posts", value: "", cls: "all" },
                            { label: "🔴 Lost", value: "lost", cls: "lost" },
                            { label: "🟢 Found", value: "found", cls: "found" },
                        ].map(t => (
                            <button key={t.value} className={`lf-type-tab ${t.cls}${typeFilter === t.value ? " active" : ""}`} onClick={() => setTypeFilter(t.value)}>
                                {t.label}
                            </button>
                        ))}
                        {isAuthenticated && (
                            <button
                                onClick={() => navigate("/lost-found/my-posts")}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: "pointer", border: "1px solid #dbe3ee", background: "#fff", color: "#475569", fontFamily: "inherit", marginLeft: "auto" }}
                            >
                                <Filter size={13} /> My Posts
                            </button>
                        )}
                    </div>

                    {/* Category pills */}
                    <div className="lf-cat-scroll">
                        {CATEGORIES.map(c => {
                            const Icon = c.icon;
                            return (
                                <button key={c.value} className={`lf-cat-pill${catFilter === c.value ? " active" : ""}`} onClick={() => setCatFilter(c.value)}>
                                    {Icon && <Icon size={12} />} {c.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Results count */}
                    <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 13, color: "#64748b", fontWeight: 700, margin: 0 }}>
                            {loading ? "Loading..." : `${posts.length} ${posts.length === 1 ? "post" : "posts"} found`}
                        </p>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="lf-grid">
                            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="lf-empty">
                            <AlertCircle size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>No posts found</p>
                            <p style={{ fontSize: 13, color: "#94a3b8" }}>Try changing your filters or be the first to post!</p>
                            {isAuthenticated && (
                                <button
                                    onClick={() => navigate("/lost-found/create")}
                                    style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, background: "#ef4444", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                    <Plus size={15} /> Post a Report
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="lf-grid">
                            {posts.map((post, i) => (
                                <PostCard key={post._id} post={post} index={i} onClick={id => navigate(`/lost-found/${id}`)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
