import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
    Plus, Loader2, AlertCircle, CheckCircle2, Trash2,
    MapPin, Calendar, Eye, ArrowLeft,
    BookOpen, CreditCard, Wallet, Laptop, Key,
    ShoppingBag, Shirt, HelpCircle, Package
} from "lucide-react";
import { getMyLostFoundPosts, markLostFoundResolved, deleteLostFoundPost } from "../services/lostFoundService";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../components/ui/AlertProvider";

const CATEGORY_MAP = {
    "id-card":    { label: "ID Card",     icon: CreditCard, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    "wallet":     { label: "Wallet",      icon: Wallet,     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    "electronics":{ label: "Electronics", icon: Laptop,     color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    "books":      { label: "Books",       icon: BookOpen,   color: "#0284c7", bg: "rgba(2,132,199,0.12)" },
    "stationery": { label: "Stationery",  icon: Package,    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    "keys":       { label: "Keys",        icon: Key,        color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    "bags":       { label: "Bags",        icon: ShoppingBag,color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
    "clothing":   { label: "Clothing",    icon: Shirt,      color: "#14b8a6", bg: "rgba(20,184,166,0.12)" },
    "other":      { label: "Other",       icon: HelpCircle, color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}

.mlf-page { min-height:100vh; background:#f6f8fb; font-family:'Inter',sans-serif; color:#0f172a; padding-top:84px; padding-bottom:48px; }
.mlf-container { max-width:960px; margin:0 auto; padding:0 24px; }
.mlf-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.mlf-h1 { font-size:22px; font-weight:900; color:#0f172a; margin:0; }
.mlf-sub { font-size:13px; color:#64748b; margin:4px 0 0; }
.mlf-new-btn { display:inline-flex;align-items:center;gap:7px;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 14px rgba(239,68,68,.3);transition:transform .2s; }
.mlf-new-btn:hover { transform:translateY(-1px); }

.mlf-tabs { display:flex; gap:8px; margin-bottom:20px; }
.mlf-tab { padding:7px 18px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;border:1px solid #dbe3ee;background:#fff;color:#64748b;font-family:inherit;transition:all .2s; }
.mlf-tab.active { background:#0f172a;border-color:#0f172a;color:#fff; }

.mlf-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
.mlf-card { background:#fff; border-radius:16px; border:1px solid #e6ebf2; box-shadow:0 1px 4px rgba(15,23,42,.04); overflow:hidden; animation:fadeUp .4s ease both; transition:box-shadow .2s,transform .2s; }
.mlf-card:hover { box-shadow:0 10px 28px rgba(15,23,42,.08);transform:translateY(-2px); }
.mlf-card-img { width:100%;height:150px;object-fit:cover; }
.mlf-card-ph { width:100%;height:150px;display:flex;align-items:center;justify-content:center; }
.mlf-card-body { padding:14px; }

.mlf-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:800; }
.mlf-badge.lost { background:rgba(239,68,68,.1);color:#dc2626;border:1px solid rgba(239,68,68,.2); }
.mlf-badge.found { background:rgba(72,201,111,.1);color:#15945a;border:1px solid rgba(72,201,111,.2); }
.mlf-badge.resolved { background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2); }

.mlf-action-row { display:flex;gap:7px;margin-top:12px; }
.mlf-btn { flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:800;cursor:pointer;border:none;font-family:inherit;transition:all .2s; }
.mlf-btn-view { background:#f1f5f9;color:#475569; }
.mlf-btn-view:hover { background:#e2e8f0; }
.mlf-btn-resolve { background:rgba(72,201,111,.12);color:#15945a;border:1px solid rgba(72,201,111,.25); }
.mlf-btn-resolve:hover { background:rgba(72,201,111,.2); }
.mlf-btn-delete { background:rgba(239,68,68,.08);color:#dc2626;border:1px solid rgba(239,68,68,.2); }
.mlf-btn-delete:hover { background:rgba(239,68,68,.15); }

.skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px; }
.mlf-empty { text-align:center; padding:56px 20px; color:#94a3b8; }
`;

export default function MyLostFoundPosts() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { confirmAction } = useConfirm();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [actionId, setActionId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/login"); return; }
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getMyLostFoundPosts();
                setPosts(Array.isArray(data) ? data : []);
            } catch { setPosts([]); }
            finally { setLoading(false); }
        };
        fetch();
    }, [isAuthenticated, navigate]);

    const filtered = posts.filter(p => {
        if (activeTab === "lost") return p.postType === "lost";
        if (activeTab === "found") return p.postType === "found";
        if (activeTab === "resolved") return p.status === "resolved";
        if (activeTab === "open") return p.status === "open";
        return true;
    });

    const handleResolve = async (id) => {
        const confirmed = await confirmAction({
            title: "Mark as resolved?",
            message: "This will show other students that the item has been reunited with its owner.",
            confirmText: "Mark resolved",
            destructive: false,
        });
        if (!confirmed) return;
        setActionId(id);
        try {
            const data = await markLostFoundResolved(id);
            setPosts(prev => prev.map(p => p._id === id ? data.post : p));
        } catch (err) {
            alert(err.response?.data?.message || "Failed.");
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: "Delete post?",
            message: "This Lost and Found post will be permanently deleted.",
            confirmText: "Delete post",
        });
        if (!confirmed) return;
        setActionId(id);
        try {
            await deleteLostFoundPost(id);
            setPosts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete.");
        } finally {
            setActionId(null);
        }
    };

    return (
        <>
            <style>{pageStyles}</style>
            <div className="mlf-page">
                <div className="mlf-container">
                    {/* Header */}
                    <div style={{ marginBottom: 8 }}>
                        <button onClick={() => navigate("/lost-found")} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>
                            <ArrowLeft size={13} /> Lost &amp; Found Board
                        </button>
                    </div>

                    <div className="mlf-header">
                        <div>
                            <h1 className="mlf-h1">My Lost &amp; Found Posts</h1>
                            <p className="mlf-sub">{posts.length} post{posts.length !== 1 ? "s" : ""} total</p>
                        </div>
                        <button className="mlf-new-btn" onClick={() => navigate("/lost-found/create")}>
                            <Plus size={14} /> New Post
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mlf-tabs">
                        {[
                            { label: `All (${posts.length})`, value: "all" },
                            { label: `Lost (${posts.filter(p => p.postType === "lost").length})`, value: "lost" },
                            { label: `Found (${posts.filter(p => p.postType === "found").length})`, value: "found" },
                            { label: `Open (${posts.filter(p => p.status === "open").length})`, value: "open" },
                            { label: `Resolved (${posts.filter(p => p.status === "resolved").length})`, value: "resolved" },
                        ].map(t => (
                            <button key={t.value} className={`mlf-tab${activeTab === t.value ? " active" : ""}`} onClick={() => setActiveTab(t.value)}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="mlf-grid">
                            {[1,2,3].map(i => (
                                <div key={i} style={{ background:"#fff",borderRadius:16,border:"1px solid #f1f5f9",overflow:"hidden" }}>
                                    <div className="skeleton" style={{ height:150 }} />
                                    <div style={{ padding:14 }}>
                                        <div className="skeleton" style={{ height:13,width:"40%",marginBottom:8 }} />
                                        <div className="skeleton" style={{ height:15,width:"80%",marginBottom:6 }} />
                                        <div className="skeleton" style={{ height:12,width:"55%" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="mlf-empty">
                            <AlertCircle size={36} style={{ margin:"0 auto 12px",opacity:.4 }} />
                            <p style={{ fontSize:14,fontWeight:700,color:"#64748b",margin:"0 0 6px" }}>
                                {posts.length === 0 ? "No posts yet" : "No posts in this filter"}
                            </p>
                            {posts.length === 0 && (
                                <button onClick={() => navigate("/lost-found/create")} style={{ marginTop:14,display:"inline-flex",alignItems:"center",gap:7,background:"#ef4444",color:"#fff",border:"none",borderRadius:12,padding:"10px 20px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
                                    <Plus size={14} /> Create Your First Post
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="mlf-grid">
                            {filtered.map((post, i) => {
                                const cat = CATEGORY_MAP[post.category];
                                const Icon = cat?.icon || HelpCircle;
                                const isResolved = post.status === "resolved";
                                const busy = actionId === post._id;
                                const dateStr = post.date ? new Date(post.date).toLocaleDateString("en-LK", { day:"numeric",month:"short",year:"numeric" }) : "";

                                return (
                                    <div key={post._id} className="mlf-card" style={{ animationDelay:`${i*40}ms`, opacity: isResolved ? 0.8 : 1 }}>
                                        {post.image ? (
                                            <img src={post.image} alt={post.title} className="mlf-card-img" />
                                        ) : (
                                            <div className="mlf-card-ph" style={{ background: cat?.bg||"#f1f5f9" }}>
                                                <Icon size={40} color={cat?.color||"#94a3b8"} strokeWidth={1.5} />
                                            </div>
                                        )}
                                        <div className="mlf-card-body">
                                            <div style={{ display:"flex",gap:6,marginBottom:8,flexWrap:"wrap" }}>
                                                <span className={`mlf-badge ${isResolved?"resolved":post.postType}`}>
                                                    {isResolved ? <CheckCircle2 size={10}/> : null}
                                                    {isResolved ? "Resolved" : post.postType === "lost" ? "🔴 Lost" : "🟢 Found"}
                                                </span>
                                                {cat && (
                                                    <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,background:cat.bg,color:cat.color,fontSize:10,fontWeight:700,border:`1px solid ${cat.color}30` }}>
                                                        <Icon size={10}/> {cat.label}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 style={{ fontSize:14,fontWeight:800,color:"#1e293b",margin:"0 0 6px",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>
                                                {post.title}
                                            </h3>
                                            <div style={{ display:"flex",alignItems:"center",gap:4,color:"#64748b",fontSize:11,fontWeight:500,marginBottom:2 }}>
                                                <MapPin size={10}/> {post.location}
                                            </div>
                                            {dateStr && (
                                                <div style={{ display:"flex",alignItems:"center",gap:4,color:"#94a3b8",fontSize:11,fontWeight:500 }}>
                                                    <Calendar size={10}/> {dateStr}
                                                </div>
                                            )}
                                            <div className="mlf-action-row">
                                                <button className="mlf-btn mlf-btn-view" onClick={() => navigate(`/lost-found/${post._id}`)}>
                                                    <Eye size={12}/> View
                                                </button>
                                                {!isResolved && (
                                                    <button className="mlf-btn mlf-btn-resolve" onClick={() => handleResolve(post._id)} disabled={busy}>
                                                        {busy ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle2 size={12}/>} Resolve
                                                    </button>
                                                )}
                                                <button className="mlf-btn mlf-btn-delete" onClick={() => handleDelete(post._id)} disabled={busy}>
                                                    {busy ? <Loader2 size={12} className="animate-spin"/> : <Trash2 size={12}/>} Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
