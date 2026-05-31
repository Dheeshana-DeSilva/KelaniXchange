import { useState } from "react";
import { useNavigate } from "react-router";
import {
    ArrowLeft, Upload, Loader2, MapPin, Calendar, FileText,
    Tag, AlertCircle, CheckCircle2, X
} from "lucide-react";
import { createLostFoundPost } from "../services/lostFoundService";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
    { label: "ID Card", value: "id-card" },
    { label: "Wallet", value: "wallet" },
    { label: "Electronics", value: "electronics" },
    { label: "Books", value: "books" },
    { label: "Stationery", value: "stationery" },
    { label: "Keys", value: "keys" },
    { label: "Bags", value: "bags" },
    { label: "Clothing", value: "clothing" },
    { label: "Other", value: "other" },
];

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.clf-page { min-height:100vh; background:#f6f8fb; font-family:'Inter',sans-serif; color:#0f172a; padding-top:88px; padding-bottom:48px; }
.clf-container { max-width:680px; margin:0 auto; padding:0 20px; }
.clf-card { background:#fff; border-radius:20px; border:1px solid #e6ebf2; box-shadow:0 2px 16px rgba(15,23,42,.06); padding:32px; }
.clf-title { font-size:22px; font-weight:900; color:#0f172a; margin:0 0 4px; }
.clf-sub { font-size:13px; color:#64748b; margin:0 0 28px; }
.clf-label { display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
.clf-input { width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 14px; font-size:14px; color:#1e293b; font-family:inherit; outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; background:#f8fafc; }
.clf-input:focus { border-color:#ef4444; background:#fff; box-shadow:0 0 0 3px rgba(239,68,68,.08); }
.clf-select { appearance:none; background:#f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center; }
.clf-textarea { resize:vertical; min-height:100px; }
.clf-type-group { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
.clf-type-btn { border-radius:12px; padding:14px; font-size:14px; font-weight:800; cursor:pointer; border:2px solid; font-family:inherit; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
.clf-type-btn.lost { border-color:#fecaca; background:#fff5f5; color:#dc2626; }
.clf-type-btn.lost.active { border-color:#dc2626; background:#dc2626; color:#fff; }
.clf-type-btn.found { border-color:#bbf7d0; background:#f0fdf4; color:#15945a; }
.clf-type-btn.found.active { border-color:#15945a; background:#15945a; color:#fff; }
.clf-img-drop { display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; min-height:144px; box-sizing:border-box; border:2px dashed #cbd5e1; border-radius:12px; padding:24px; text-align:center; cursor:pointer; transition:border-color .2s,background .2s,box-shadow .2s; background:#f8fafc; }
.clf-img-drop:hover { border-color:#ef4444; background:#fff5f5; box-shadow:0 0 0 3px rgba(239,68,68,.06); }
.clf-img-drop:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 3px rgba(239,68,68,.1); }
.clf-submit { width:100%; padding:13px; border-radius:12px; font-size:14px; font-weight:800; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border:none; cursor:pointer; font-family:inherit; transition:transform .2s,box-shadow .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
.clf-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(239,68,68,.35); }
.clf-submit:disabled { opacity:.6; cursor:not-allowed; }
.clf-field { margin-bottom:18px; }
.clf-error { display:flex; align-items:center; gap:6px; padding:10px 14px; border-radius:10px; background:#fff5f5; border:1px solid #fecaca; color:#dc2626; font-size:12px; font-weight:600; margin-bottom:16px; }
`;

export default function CreateLostFound() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [form, setForm] = useState({
        postType: "",
        title: "",
        description: "",
        category: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.postType) { setError("Please select Lost or Found."); return; }
        if (!form.title.trim()) { setError("Title is required."); return; }
        if (!form.description.trim()) { setError("Description is required."); return; }
        if (!form.category) { setError("Please select a category."); return; }
        if (!form.location.trim()) { setError("Location is required."); return; }
        if (!form.date) { setError("Date is required."); return; }

        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (imageFile) fd.append("image", imageFile);
            await createLostFoundPost(fd);
            navigate("/lost-found/my-posts");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{pageStyles}</style>
            <div className="clf-page">
                <div className="clf-container">
                    {/* Back */}
                    <div style={{ marginBottom: 16 }}>
                        <button onClick={() => navigate("/lost-found")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            <ArrowLeft size={14} /> Back to Lost &amp; Found
                        </button>
                    </div>

                    <div className="clf-card">
                        <h1 className="clf-title">Report a Lost or Found Item</h1>
                        <p className="clf-sub">Help your fellow students reunite with their belongings at University of Kelaniya.</p>

                        {error && (
                            <div className="clf-error">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Type Selection */}
                            <div className="clf-field">
                                <label className="clf-label">Post Type *</label>
                                <div className="clf-type-group">
                                    <button type="button" className={`clf-type-btn lost${form.postType === "lost" ? " active" : ""}`} onClick={() => setForm(f => ({ ...f, postType: "lost" }))}>
                                        🔴 I Lost Something
                                    </button>
                                    <button type="button" className={`clf-type-btn found${form.postType === "found" ? " active" : ""}`} onClick={() => setForm(f => ({ ...f, postType: "found" }))}>
                                        🟢 I Found Something
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="clf-field">
                                <label className="clf-label"><FileText size={11} style={{ display: "inline", marginRight: 4 }} />Title *</label>
                                <input className="clf-input" type="text" placeholder="e.g. Lost black wallet near library" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={120} />
                            </div>

                            {/* Category & Date row */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                                <div>
                                    <label className="clf-label"><Tag size={11} style={{ display: "inline", marginRight: 4 }} />Category *</label>
                                    <select className="clf-input clf-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="clf-label"><Calendar size={11} style={{ display: "inline", marginRight: 4 }} />Date Lost/Found *</label>
                                    <input className="clf-input" type="date" value={form.date} max={new Date().toISOString().split("T")[0]} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="clf-field">
                                <label className="clf-label"><MapPin size={11} style={{ display: "inline", marginRight: 4 }} />Location *</label>
                                <input className="clf-input" type="text" placeholder="e.g. Faculty of Science, Library, Canteen..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                            </div>

                            {/* Description */}
                            <div className="clf-field">
                                <label className="clf-label">Description *</label>
                                <textarea className="clf-input clf-textarea" placeholder="Describe the item in detail — color, brand, identifying features..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>

                            {/* Image upload */}
                            <div className="clf-field">
                                <label className="clf-label"><Upload size={11} style={{ display: "inline", marginRight: 4 }} />Photo (optional)</label>
                                {imagePreview ? (
                                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                        <img
                                            src={imagePreview}
                                            alt="Selected lost and found item"
                                            className="h-56 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            aria-label="Remove selected photo"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/75 text-white shadow-lg transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className="group flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition-all hover:border-red-400 hover:bg-red-50/60 focus-within:border-red-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100"
                                        htmlFor="lf-image-upload"
                                    >
                                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:text-red-500 group-hover:ring-red-200">
                                            <Upload size={24} />
                                        </span>
                                        <span className="block text-sm font-extrabold text-slate-700">Click to upload a photo</span>
                                        <span className="mt-1 block text-xs font-medium text-slate-400">JPG, PNG, WEBP up to 5MB</span>
                                        <input
                                            id="lf-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>

                            <button type="submit" className="clf-submit" disabled={loading}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {loading ? "Posting..." : "Submit Report"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
