import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
    ArrowLeft, MapPin, Calendar, Tag, User, CheckCircle2,
    Loader2, AlertCircle, Trash2, BookOpen, CreditCard,
    Wallet, Laptop, Key, ShoppingBag, Shirt, HelpCircle, Package, MessageCircle
} from "lucide-react";
import { getLostFoundPostById, markLostFoundResolved, deleteLostFoundPost } from "../services/lostFoundService";
import { startChat } from "../services/chatService";
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

.lfd-page { min-height:100vh; background:#f6f8fb; font-family:'Inter',sans-serif; color:#0f172a; padding-top:84px; padding-bottom:48px; }
.lfd-container { max-width:820px; margin:0 auto; padding:0 20px; }
.lfd-card { background:#fff; border-radius:20px; border:1px solid #e6ebf2; box-shadow:0 2px 16px rgba(15,23,42,.06); overflow:hidden; animation:fadeUp .4s ease both; }
.lfd-img { width:100%; max-height:380px; object-fit:cover; }
.lfd-img-placeholder { width:100%; height:220px; display:flex; align-items:center; justify-content:center; }
.lfd-body { padding:28px 32px; }
.lfd-badge { display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.04em; }
.lfd-badge.lost { background:rgba(239,68,68,.12);color:#dc2626;border:1px solid rgba(239,68,68,.25); }
.lfd-badge.found { background:rgba(72,201,111,.12);color:#15945a;border:1px solid rgba(72,201,111,.25); }
.lfd-badge.resolved { background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2); }
.lfd-meta { display:flex;align-items:center;gap:6px;font-size:13px;color:#64748b;font-weight:500; }
.lfd-action-btn { display:inline-flex;align-items:center;gap:7px;border-radius:12px;padding:11px 20px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;border:none;transition:transform .2s,box-shadow .2s; }
.lfd-action-btn:hover { transform:translateY(-1px); }
.lfd-resolve-btn { background:linear-gradient(135deg,#48c96f,#15945a);color:#fff;box-shadow:0 4px 16px rgba(72,201,111,.3); }
.lfd-delete-btn { background:#fff;color:#dc2626;border:1.5px solid #fecaca; }
.lfd-delete-btn:hover { background:#fff5f5; }
.lfd-info-row { display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #f1f5f9; }
.lfd-info-row:last-child { border-bottom:none; }
.lfd-info-icon { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#f1f5f9; }
.lfd-info-label { font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px; }
.lfd-info-value { font-size:14px;font-weight:700;color:#1e293b; }
.lfd-resolved-banner { background:linear-gradient(135deg,rgba(72,201,111,.1),rgba(21,148,90,.06));border:1px solid rgba(72,201,111,.25);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:20px; }
@media(max-width:600px){.lfd-body{padding:20px;}.lfd-actions{flex-direction:column;}}
`;

export default function LostFoundDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { confirmAction } = useConfirm();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getLostFoundPostById(id);
                setPost(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load post.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetch();
    }, [id]);

    const isOwner = user && post && (post.postedBy?._id === user._id || post.postedBy === user._id);
    const cat = post ? CATEGORY_MAP[post.category] : null;
    const CatIcon = cat?.icon || HelpCircle;

    const handleResolve = async () => {
        const confirmed = await confirmAction({
            title: "Mark as resolved?",
            message: "This will show other students that the item has been reunited with its owner.",
            confirmText: "Mark resolved",
            destructive: false,
        });
        if (!confirmed) return;
        setResolving(true);
        try {
            const data = await markLostFoundResolved(id);
            setPost(data.post);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark as resolved.");
        } finally {
            setResolving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirmAction({
            title: "Delete post?",
            message: "This Lost and Found post will be permanently deleted. This action cannot be undone.",
            confirmText: "Delete post",
        });
        if (!confirmed) return;
        setDeleting(true);
        try {
            await deleteLostFoundPost(id);
            navigate("/lost-found/my-posts");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete post.");
            setDeleting(false);
        }
    };

    const handleStartChat = async () => {
        if (!user) { navigate("/login"); return; }
        const posterId = post?.postedBy?._id || post?.postedBy;
        if (!posterId) return;
        setChatLoading(true);
        try {
            const data = await startChat({ recipientId: posterId });
            navigate(`/chats/${data.chat._id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to start chat.");
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", paddingTop: 72 }}>
            <div style={{ textAlign: "center" }}>
                <Loader2 size={36} className="animate-spin" style={{ color: "#ef4444", margin: "0 auto 12px" }} />
                <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Loading post...</p>
            </div>
        </div>
    );

    if (error || !post) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", paddingTop: 72 }}>
            <div style={{ textAlign: "center", maxWidth: 380, padding: 32 }}>
                <AlertCircle size={40} style={{ color: "#ef4444", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>Post not found</p>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{error}</p>
                <button onClick={() => navigate("/lost-found")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, background: "#0f172a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    <ArrowLeft size={14} /> Back to Board
                </button>
            </div>
        </div>
    );

    const dateStr = post.date ? new Date(post.date).toLocaleDateString("en-LK", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—";
    const postedStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const isResolved = post.status === "resolved";

    return (
        <>
            <style>{pageStyles}</style>
            <div className="lfd-page">
                <div className="lfd-container">
                    {/* Back */}
                    <div style={{ marginBottom: 14 }}>
                        <button onClick={() => navigate("/lost-found")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                            <ArrowLeft size={13} /> Back to Board
                        </button>
                    </div>

                    <div className="lfd-card">
                        {/* Image */}
                        {post.image ? (
                            <img src={post.image} alt={post.title} className="lfd-img" />
                        ) : (
                            <div className="lfd-img-placeholder" style={{ background: cat?.bg || "#f1f5f9" }}>
                                <CatIcon size={64} color={cat?.color || "#94a3b8"} strokeWidth={1.5} />
                            </div>
                        )}

                        <div className="lfd-body">
                            {/* Resolved banner */}
                            {isResolved && (
                                <div className="lfd-resolved-banner">
                                    <CheckCircle2 size={22} color="#15945a" />
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: "#15945a", margin: 0 }}>This post is marked as Resolved</p>
                                        <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>The item has been reunited with its owner.</p>
                                    </div>
                                </div>
                            )}

                            {/* Badges */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                                <span className={`lfd-badge ${isResolved ? "resolved" : post.postType}`}>
                                    {isResolved ? <CheckCircle2 size={11} /> : null}
                                    {isResolved ? "Resolved" : post.postType === "lost" ? "🔴 Lost" : "🟢 Found"}
                                </span>
                                {cat && (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 700, border: `1px solid ${cat.color}30` }}>
                                        <CatIcon size={12} /> {cat.label}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 20px", lineHeight: 1.25 }}>{post.title}</h1>

                            {/* Info rows */}
                            <div style={{ marginBottom: 20 }}>
                                <div className="lfd-info-row">
                                    <div className="lfd-info-icon"><MapPin size={16} color="#64748b" /></div>
                                    <div><div className="lfd-info-label">Location</div><div className="lfd-info-value">{post.location}</div></div>
                                </div>
                                <div className="lfd-info-row">
                                    <div className="lfd-info-icon"><Calendar size={16} color="#64748b" /></div>
                                    <div><div className="lfd-info-label">Date {post.postType === "lost" ? "Lost" : "Found"}</div><div className="lfd-info-value">{dateStr}</div></div>
                                </div>
                                <div className="lfd-info-row">
                                    <div className="lfd-info-icon"><User size={16} color="#64748b" /></div>
                                    <div><div className="lfd-info-label">Posted by</div><div className="lfd-info-value">@{post.postedBy?.username || "anonymous"}<span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginLeft: 8 }}>on {postedStr}</span></div></div>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", marginBottom: 24, border: "1px solid #f1f5f9" }}>
                                <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Description</p>
                                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>{post.description}</p>
                            </div>

                            {/* Owner actions */}
                            {isOwner && (
                                <div className="lfd-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {!isResolved && (
                                        <button className="lfd-action-btn lfd-resolve-btn" onClick={handleResolve} disabled={resolving}>
                                            {resolving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                            {resolving ? "Marking..." : "Mark as Resolved"}
                                        </button>
                                    )}
                                    <button className="lfd-action-btn lfd-delete-btn" onClick={handleDelete} disabled={deleting}>
                                        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                        {deleting ? "Deleting..." : "Delete Post"}
                                    </button>
                                </div>
                            )}

                            {/* Contact note for others */}
                            {!isOwner && !isResolved && (
                                <div style={{ background: "rgba(72,201,111,0.08)", border: "1px solid rgba(72,201,111,0.2)", borderRadius: 12, padding: "16px 18px" }}>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: "#15945a", margin: "0 0 4px" }}>Know about this item?</p>
                                    <p style={{ fontSize: 12, color: "#475569", margin: "0 0 14px" }}>Chat directly with the poster to help reunite them with their belongings.</p>
                                    <button
                                        onClick={handleStartChat}
                                        disabled={chatLoading}
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: 8,
                                            background: "linear-gradient(135deg,#48c96f,#15945a)",
                                            color: "#fff", border: "none", borderRadius: 10,
                                            padding: "10px 18px", fontSize: 13, fontWeight: 800,
                                            cursor: chatLoading ? "not-allowed" : "pointer",
                                            fontFamily: "Inter,sans-serif",
                                            opacity: chatLoading ? 0.7 : 1,
                                            boxShadow: "0 4px 14px rgba(72,201,111,0.3)",
                                            transition: "transform .2s",
                                        }}
                                    >
                                        {chatLoading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <MessageCircle size={15} />}
                                        {chatLoading ? "Starting chat..." : "Chat with Poster"}
                                    </button>
                                </div>
                            )}
                            {!isOwner && isResolved && (
                                <div style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)", borderRadius: 12, padding: "14px 18px" }}>
                                    <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 600 }}>This post has been marked as resolved — the item has been found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
