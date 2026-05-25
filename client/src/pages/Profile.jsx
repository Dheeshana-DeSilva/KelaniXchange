import { useEffect, useState } from "react";
import { Camera, Loader2, Mail, Save, ShieldCheck, User, WalletCards } from "lucide-react";
import { getUserProfile, updateUserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { updateAuthUser } from "../features/auth/authSlice";

const emptyPayoutDetails = {
    bankAccountName: "",
    bankName: "",
    bankBranch: "",
    bankAccountNumber: "",
};

export default function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        fullName: "",
        username: "",
        email: "",
        role: "USER",
        profileImage: "",
        payoutDetails: emptyPayoutDetails,
    });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadProfile = async () => {
            try {
                const data = await getUserProfile();
                setForm({
                    fullName: data.user?.fullName || "",
                    username: data.user?.username || "",
                    email: data.user?.email || "",
                    role: data.user?.role || "USER",
                    profileImage: data.user?.profileImage || "",
                    payoutDetails: {
                        ...emptyPayoutDetails,
                        ...(data.user?.payoutDetails || {}),
                    },
                });
                setProfilePreview(data.user?.profileImage || "");
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [isAuthenticated]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const updatePayoutField = (field, value) => {
        setForm(prev => ({
            ...prev,
            payoutDetails: {
                ...prev.payoutDetails,
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            let payload;
            if (profileImageFile) {
                payload = new FormData();
                payload.append("fullName", form.fullName);
                payload.append("username", form.username);
                payload.append("payoutDetails", JSON.stringify(form.payoutDetails));
                payload.append("profileImage", profileImageFile);
            } else {
                payload = {
                    fullName: form.fullName,
                    username: form.username,
                    payoutDetails: form.payoutDetails,
                };
            }

            const data = await updateUserProfile(payload);
            setForm(prev => ({
                ...prev,
                profileImage: data.user?.profileImage || prev.profileImage,
            }));
            setProfilePreview(data.user?.profileImage || profilePreview);
            setProfileImageFile(null);
            dispatch(updateAuthUser(data.user));
            setMessage("Profile and payment details saved.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setProfileImageFile(file);
        setProfilePreview(URL.createObjectURL(file));
        setMessage("");
        setError("");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-[#48c96f]" size={36} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 pt-28 sm:p-8 sm:pt-32 font-sans pb-16">
            <form onSubmit={handleSubmit} className="max-w-[920px] mx-auto space-y-8">
                <div className="border-b border-slate-100 pb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        My Profile <User size={24} className="text-[#48c96f]" />
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage your account and seller payment details.</p>
                </div>

                {(error || message) && (
                    <div className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                        {error || message}
                    </div>
                )}

                <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Account</h2>
                    <div className="flex flex-col sm:flex-row gap-5 sm:items-center rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="h-24 w-24 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                            {profilePreview ? (
                                <img src={profilePreview} alt={form.fullName || "Profile"} className="h-full w-full object-cover" />
                            ) : (
                                <User size={34} className="text-slate-400" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                                <Camera size={14} />
                                Change Profile Picture
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            <p className="text-xs text-slate-500">JPG, PNG, or WEBP. Max 5MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</span>
                            <input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#48c96f]" />
                        </label>
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Username</span>
                            <input value={form.username} onChange={(e) => updateField("username", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#48c96f]" />
                        </label>
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email</span>
                            <div className="relative">
                                <input value={form.email || user?.email || ""} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pl-10 text-sm text-slate-500 outline-none" />
                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </label>
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Role</span>
                            <div className="relative">
                                <input value={form.role || user?.role || "USER"} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pl-10 text-sm text-slate-500 outline-none" />
                                <ShieldCheck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </label>
                    </div>
                </section>

                <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">Seller Payment Details <WalletCards size={18} className="text-[#48c96f]" /></h2>
                        <p className="text-xs text-slate-500 mt-1">Buyers will see these details during Bank Transfer checkout.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Account Name</span>
                            <input value={form.payoutDetails.bankAccountName} onChange={(e) => updatePayoutField("bankAccountName", e.target.value)} placeholder="Name on bank account" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#48c96f]" />
                        </label>
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</span>
                            <input value={form.payoutDetails.bankName} onChange={(e) => updatePayoutField("bankName", e.target.value)} placeholder="e.g. Bank of Ceylon" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#48c96f]" />
                        </label>
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</span>
                            <input value={form.payoutDetails.bankBranch} onChange={(e) => updatePayoutField("bankBranch", e.target.value)} placeholder="Branch name" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#48c96f]" />
                        </label>
                        <label className="space-y-1.5">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Account Number</span>
                            <input value={form.payoutDetails.bankAccountNumber} onChange={(e) => updatePayoutField("bankAccountNumber", e.target.value)} placeholder="Bank account number" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#48c96f]" />
                        </label>
                    </div>
                </section>

                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-5 py-3 text-sm font-black text-white hover:bg-[#3db65e] disabled:opacity-60">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Profile
                </button>
            </form>
        </div>
    );
}
