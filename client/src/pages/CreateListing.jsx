import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { 
    Tag, MapPin, AlertCircle, Loader2, CheckCircle2, 
    Upload, X, ArrowLeft, Image as ImageIcon, Sparkles, PlusCircle
} from "lucide-react";
import { createListing } from "../services/listingService";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
    { label: "Books & Stationery", value: "books-and-stationery" },
    { label: "Electronics", value: "electronics" },
    { label: "Furniture", value: "furniture" },
    { label: "Fashion & Accessories", value: "fashion-and-accessories" },
    { label: "Sports & Outdoor", value: "sports-and-outdoor" },
    { label: "Vehicles", value: "vehicles" },
    { label: "Others", value: "others" },
];

const CONDITIONS = ["New", "Like New", "Good", "Used"];

export default function CreateListing() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "books-and-stationery",
        price: "",
        condition: "Good",
        location: "University of Kelaniya",
        isExchangeAvailable: false,
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form validation
    useEffect(() => {
        const errs = {};
        if (touched.title && form.title.trim().length < 3) {
            errs.title = "Title must be at least 3 characters long";
        }
        if (touched.description && form.description.trim().length < 10) {
            errs.description = "Description must be at least 10 characters long";
        }
        if (touched.price && (Number(form.price) < 0 || isNaN(form.price))) {
            errs.price = "Price must be a positive number";
        }
        if (touched.location && form.location.trim().length < 3) {
            errs.location = "Location must be at least 3 characters long";
        }
        setErrors(errs);
    }, [form, touched]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setApiError(null);
    };

    const handleBlur = (e) => {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            alert("You can upload a maximum of 5 images.");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);

        // Revoke the object URL to avoid memory leak
        URL.revokeObjectURL(previews[index]);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Touch all fields to trigger validations
        setTouched({
            title: true,
            description: true,
            price: true,
            location: true,
        });

        // Ensure form is valid
        const errs = {};
        if (form.title.trim().length < 3) errs.title = "Title is required";
        if (form.description.trim().length < 10) errs.description = "Description is required";
        if (Number(form.price) < 0) errs.price = "Invalid price";
        if (form.location.trim().length < 3) errs.location = "Location is required";

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        setApiError(null);

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("category", form.category);
            formData.append("price", form.price || 0);
            formData.append("condition", form.condition);
            formData.append("location", form.location);
            formData.append("isExchangeAvailable", form.isExchangeAvailable);

            images.forEach((file) => {
                formData.append("images", file);
            });

            await createListing(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate("/marketplace");
            }, 1800);
        } catch (err) {
            console.error("Create listing error:", err);
            setApiError(err.response?.data?.message || "Failed to create listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

    if (success) {
        return (
            <div className="min-h-screen bg-[#060f1e] flex items-center justify-center font-sans p-4">
                <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-[#48c96f]/15 border-2 border-[#48c96f]/40 flex items-center justify-center animate-bounce">
                        <CheckCircle2 size={40} className="text-[#48c96f]" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-[#fff] text-2xl font-black tracking-tight">Listing Published! 🚀</h2>
                        <p className="text-slate-400 text-sm font-medium">Your item is now live. Redirecting to marketplace...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060f1e] text-[#f1f5f9] flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden pt-24 pb-16">
            
            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(72,201,111,0.08) 0%, transparent 75%)" />
                <div className="absolute bottom-[-10%] right-[-5%] width-[500px] height-[500px] rounded-full bg-radial-gradient(circle, rgba(45,164,196,0.06) 0%, transparent 75%)" />
            </div>

            <div className="w-full max-w-3xl bg-[#0a1426]/90 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* Back Link */}
                <div>
                    <Link 
                        to="/marketplace" 
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>
                </div>

                {/* Title info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            Sell / Exchange Item <Sparkles size={20} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-400 mt-1.5 font-medium">Post details of your items to list them on UoK student marketplace.</p>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#48c96f]/10 text-[#48c96f] border border-[#48c96f]/20">
                        Listing Creator
                    </span>
                </div>

                {/* API Error */}
                {apiError && (
                    <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl">
                        <AlertCircle size={18} className="text-rose-400 shrink-0" />
                        <p className="text-rose-300 text-sm font-medium">{apiError}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Title */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Listing Title</label>
                            <input 
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                placeholder="What are you selling? (e.g. Mechanical Engineering Textbook)"
                                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white/5 outline-none transition-all placeholder:text-slate-500 ${
                                    touched.title && errors.title 
                                        ? "border-rose-500/40 bg-rose-500/5 focus:border-rose-500" 
                                        : "border-white/10 focus:border-[#48c96f]/50 focus:bg-white/10"
                                }`}
                            />
                            {touched.title && errors.title && (
                                <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={12} /> {errors.title}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <select 
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm bg-[#0a1426] outline-none focus:border-[#48c96f]/50 transition-all appearance-none cursor-pointer"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Tag size={14} /></span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Price (Rs.)</label>
                            <input 
                                type="number"
                                name="price"
                                min={0}
                                value={form.price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter price (0 if exchange only)"
                                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white/5 outline-none transition-all placeholder:text-slate-500 ${
                                    touched.price && errors.price 
                                        ? "border-rose-500/40 bg-rose-500/5 focus:border-rose-500" 
                                        : "border-white/10 focus:border-[#48c96f]/50 focus:bg-white/10"
                                }`}
                            />
                            {touched.price && errors.price && (
                                <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={12} /> {errors.price}</p>
                            )}
                        </div>

                        {/* Condition */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Condition</label>
                            <select 
                                name="condition"
                                value={form.condition}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm bg-[#0a1426] outline-none focus:border-[#48c96f]/50 transition-all cursor-pointer"
                            >
                                {CONDITIONS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    placeholder="Meetup location (e.g. Science Library)"
                                    className={`w-full rounded-xl border pl-4 pr-10 py-3 text-sm bg-white/5 outline-none transition-all placeholder:text-slate-500 ${
                                        touched.location && errors.location 
                                            ? "border-rose-500/40 bg-rose-500/5 focus:border-rose-500" 
                                            : "border-white/10 focus:border-[#48c96f]/50 focus:bg-white/10"
                                    }`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><MapPin size={14} /></span>
                            </div>
                            {touched.location && errors.location && (
                                <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={12} /> {errors.location}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                            <textarea 
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                placeholder="Describe the item's condition, defects, details, or trade requirements..."
                                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white/5 outline-none transition-all placeholder:text-slate-500 resize-none ${
                                    touched.description && errors.description 
                                        ? "border-rose-500/40 bg-rose-500/5 focus:border-rose-500" 
                                        : "border-white/10 focus:border-[#48c96f]/50 focus:bg-white/10"
                                }`}
                            />
                            {touched.description && errors.description && (
                                <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={12} /> {errors.description}</p>
                            )}
                        </div>

                        {/* Image Upload Area */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Upload Photos ({images.length}/5)
                            </label>
                            
                            {/* Drag drop zone */}
                            <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 hover:border-[#48c96f]/30 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/8 transition-colors select-none">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden" 
                                />
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <Upload className="h-8 w-8 text-slate-400 mb-2.5" />
                                    <p className="text-sm font-semibold text-slate-200">Click to upload images</p>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP up to 5MB (Max 5 images)</p>
                                </div>
                            </label>

                            {/* Previews Grid */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-5 gap-3 mt-4">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl border border-white/15 overflow-hidden group bg-slate-900">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/80 hover:bg-rose-600/90 text-white flex items-center justify-center transition-colors border border-white/10"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Exchange Toggle */}
                        <div className="md:col-span-2 flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input 
                                    type="checkbox" 
                                    name="isExchangeAvailable"
                                    checked={form.isExchangeAvailable}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#48c96f]" />
                            </label>
                            <div>
                                <span className="text-sm font-bold text-white block">Make Exchange Available</span>
                                <span className="text-xs text-slate-400 block mt-0.5">Let other UoK students offer items in exchange instead of paying cash.</span>
                            </div>
                        </div>

                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#48c96f] to-[#15945a] hover:from-[#5dd97f] hover:to-[#1bad6d] text-white font-black py-4.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Publishing listing...
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={16} /> Publish Listing
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
