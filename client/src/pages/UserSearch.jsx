import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Search, User, Users } from "lucide-react";
import { searchUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function UserSearch() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let isMounted = true;

        const runSearch = async () => {
            if (query.trim().length < 2) {
                setUsers([]);
                setError("");
                return;
            }

            try {
                setLoading(true);
                const data = await searchUsers(query.trim());
                if (!isMounted) return;
                setUsers(data.users || []);
                setError("");
            } catch (err) {
                if (!isMounted) return;
                setError(err.response?.data?.message || "Failed to search users.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const timer = setTimeout(runSearch, 350);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [query]);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 pt-28 sm:p-8 sm:pt-32 font-sans pb-16">
            <div className="max-w-[920px] mx-auto space-y-8">
                <div>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>
                </div>

                <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Find Users <Users size={24} className="text-[#48c96f]" />
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Search students by username and browse their marketplace listings.</p>
                    </div>
                </div>

                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#48c96f] focus:ring-4 focus:ring-emerald-500/10"
                    />
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 size={32} className="animate-spin text-[#48c96f] mx-auto" />
                        </div>
                    ) : query.trim().length < 2 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
                            Type at least 2 characters to search users.
                        </div>
                    ) : users.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
                            No users found.
                        </div>
                    ) : (
                        users.map((user) => (
                            <Link
                                key={user.id}
                                to={`/users/${user.id}`}
                                className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#48c96f]/50 hover:shadow-md transition-all"
                            >
                                <div className="h-14 w-14 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-slate-800 truncate">@{user.username}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
