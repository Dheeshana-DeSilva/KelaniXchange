import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, MessageCircle, Search, Trash2 } from "lucide-react";
import { deleteChat, getMyChats } from "../services/chatService";
import { getSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../components/ui/AlertProvider";

const getUserId = (user) => user?._id || user?.id;

const otherParticipant = (chat, userId) =>
    chat.participants?.find((participant) => String(participant._id) !== String(userId)) || {};

export default function ChatList() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { confirmAction } = useConfirm();
    const [chats, setChats] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate]);

    const loadChats = async () => {
        try {
            setLoading(true);
            const data = await getMyChats();
            setChats(data.chats || []);
            setUnreadCount(data.unreadCount || 0);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load chats.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) loadChats();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const socket = getSocket();
        if (!socket) return;

        const handleUpdate = () => {
            loadChats();
            window.dispatchEvent(new Event("kx:chat-updated"));
            window.dispatchEvent(new Event("kx:notifications-updated"));
        };

        socket.on("chatUpdated", handleUpdate);
        socket.on("messagesRead", handleUpdate);

        return () => {
            socket.off("chatUpdated", handleUpdate);
            socket.off("messagesRead", handleUpdate);
        };
    }, [isAuthenticated]);

    const filteredChats = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return chats;
        return chats.filter((chat) => {
            const other = otherParticipant(chat, getUserId(user));
            return (
                other.username?.toLowerCase().includes(q) ||
                chat.listing?.title?.toLowerCase().includes(q) ||
                chat.lastMessage?.text?.toLowerCase().includes(q)
            );
        });
    }, [chats, search, user]);

    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation();
        const confirmed = await confirmAction({
            title: "Delete chat?",
            message: "This chat will be removed from your inbox.",
            confirmText: "Delete chat",
        });
        if (!confirmed) return;

        try {
            setActionLoadingId(chatId);
            await deleteChat(chatId);
            setChats((prev) => {
                const deleted = prev.find((chat) => chat._id === chatId);
                if (deleted?.unreadCount) {
                    setUnreadCount((count) => Math.max(0, count - Number(deleted.unreadCount || 0)));
                }
                return prev.filter((chat) => chat._id !== chatId);
            });
            window.dispatchEvent(new Event("kx:chat-updated"));
            window.dispatchEvent(new Event("kx:notifications-updated"));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete chat.");
        } finally {
            setActionLoadingId("");
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-8">
            <div className="mx-auto max-w-4xl">
                <Link to="/marketplace" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#15945a]">
                    <ArrowLeft size={16} /> Back to Marketplace
                </Link>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
                    <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                                Chats <MessageCircle size={24} className="text-[#48c96f]" />
                            </h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}` : "No unread messages."}
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search chats..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#48c96f] focus:bg-white"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16 text-sm font-bold text-slate-500">
                            <Loader2 size={20} className="animate-spin text-[#48c96f]" /> Loading chats...
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <MessageCircle size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">No chats yet</h2>
                            <p className="mt-1 text-sm text-slate-500">Open a listing and message the seller to start a conversation.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredChats.map((chat) => {
                                const other = otherParticipant(chat, getUserId(user));
                                const isUnread = Number(chat.unreadCount || 0) > 0;
                                return (
                                    <div
                                        key={chat._id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => navigate(`/chats/${chat._id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") navigate(`/chats/${chat._id}`);
                                        }}
                                        className="flex gap-4 rounded-2xl px-3 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#48c96f]/15 text-sm font-black text-[#15945a]">
                                            {other.username?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="truncate text-sm font-black text-slate-900">@{other.username || "student"}</p>
                                                {isUnread && (
                                                    <span className="rounded-full bg-[#48c96f] px-2 py-0.5 text-[11px] font-black text-white">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            {chat.listing && (
                                                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">{chat.listing.title}</p>
                                            )}
                                            <p className={`mt-1 truncate text-sm ${isUnread ? "font-black text-slate-800" : "font-medium text-slate-500"}`}>
                                                {chat.lastMessage?.text || "No messages yet"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteChat(e, chat._id)}
                                            disabled={actionLoadingId === chat._id}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            title="Delete chat"
                                        >
                                            {actionLoadingId === chat._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
