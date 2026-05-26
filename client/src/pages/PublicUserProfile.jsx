import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, Loader2, ShoppingBag, User } from "lucide-react";
import { getPublicUserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function PublicUserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [profile, setProfile] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await getPublicUserProfile(id);
                if (!isMounted) return;
                setProfile(data.user);
                setListings(data.listings || []);
                setError("");
            } catch (err) {
                if (!isMounted) return;
                setError(err.response?.data?.message || "Failed to load user profile.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id && isAuthenticated) {
            loadProfile();
        }

        return () => {
            isMounted = false;
        };
    }, [id, isAuthenticated]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[#48c96f] mx-auto" size={40} />
                    <p className="text-slate-500 font-medium text-sm">Loading user profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 pt-28 sm:p-8 sm:pt-32 font-sans pb-16">
            <div className="max-w-[1120px] mx-auto space-y-8">
                <div>
                    <Link to="/users" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={14} /> Back to User Search
                    </Link>
                </div>

                {error || !profile ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-semibold text-rose-700">
                        {error || "User not found."}
                    </div>
                ) : (
                    <>
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
                            <div className="h-24 w-24 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt={profile.username} className="h-full w-full object-cover" />
                                ) : (
                                    <User size={38} className="text-slate-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight truncate">
                                    {profile.fullName || profile.username}
                                </h1>
                                <p className="text-sm font-bold text-slate-500 mt-1">@{profile.username}</p>
                                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-3">
                                    <Calendar size={13} /> Joined {new Date(profile.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="sm:ml-auto bg-slate-100 text-slate-600 font-bold px-3.5 py-1.5 rounded-full text-xs border border-slate-200/80 w-fit">
                                {listings.length} {listings.length === 1 ? "Listing" : "Listings"}
                            </span>
                        </div>

                        {listings.length === 0 ? (
                            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500">
                                This user has no available listings right now.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {listings.map((listing) => (
                                    <Link
                                        key={listing._id}
                                        to={`/marketplace/${listing._id}`}
                                        className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#48c96f]/40 transition-all"
                                    >
                                        <div className="h-44 bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-center">
                                            {listing.images?.[0] ? (
                                                <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-contain" />
                                            ) : (
                                                <ShoppingBag size={40} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <h3 className="font-black text-slate-800 line-clamp-2">{listing.title}</h3>
                                            <p className="text-xs font-semibold text-slate-500 capitalize">{listing.category?.replace(/-/g, " ")}</p>
                                            <p className="text-lg font-black text-[#15945a]">Rs. {Number(listing.price).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
