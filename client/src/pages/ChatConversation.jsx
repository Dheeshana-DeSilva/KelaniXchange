import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import {
    deleteChat,
    getChatMessages,
    getMyChats,
    markChatAsRead,
    sendChatMessage,
} from "../services/chatService";
import { getSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";

const getUserId = (user) => user?._id || user?.id;

const otherParticipant = (chat, userId) =>
    chat?.participants?.find((participant) => String(participant._id) !== String(userId)) || {};

export default function ChatConversation() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate]);

    const loadConversation = async () => {
        try {
            setLoading(true);
            const [chatsData, messagesData] = await Promise.all([
                getMyChats(),
                getChatMessages(chatId),
            ]);
            setChat((chatsData.chats || []).find((item) => item._id === chatId) || null);
            setMessages(messagesData.messages || []);
            await markChatAsRead(chatId);
            window.dispatchEvent(new Event("kx:chat-updated"));
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load conversation.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && chatId) loadConversation();
    }, [isAuthenticated, chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    useEffect(() => {
        if (!isAuthenticated || !chatId) return;
        const socket = getSocket();
        if (!socket) return;

        socket.emit("joinChat", chatId);

        const handleNewMessage = async (message) => {
            if (message.chat?.toString?.() !== chatId && message.chat !== chatId) return;
            setMessages((prev) => {
                if (prev.some((item) => item._id === message._id)) return prev;
                return [...prev, message];
            });
            if (String(message.sender?._id || message.sender) !== String(getUserId(user))) {
                await markChatAsRead(chatId);
            }
            window.dispatchEvent(new Event("kx:chat-updated"));
            window.dispatchEvent(new Event("kx:notifications-updated"));
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.emit("leaveChat", chatId);
            socket.off("newMessage", handleNewMessage);
        };
    }, [chatId, isAuthenticated, user]);

    const other = useMemo(() => otherParticipant(chat, getUserId(user)), [chat, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const clean = text.trim();
        if (!clean || sending) return;

        try {
            setSending(true);
            setText("");
            const data = await sendChatMessage(chatId, clean);
            setMessages((prev) => {
                if (prev.some((item) => item._id === data.chatMessage._id)) return prev;
                return [...prev, data.chatMessage];
            });
            window.dispatchEvent(new Event("kx:chat-updated"));
        } catch (err) {
            setText(clean);
            setError(err.response?.data?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteChat = async () => {
        if (!confirm("Delete this chat from your inbox?")) return;

        try {
            setDeleting(true);
            await deleteChat(chatId);
            window.dispatchEvent(new Event("kx:chat-updated"));
            window.dispatchEvent(new Event("kx:notifications-updated"));
            navigate("/chats");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete chat.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-10 px-4 sm:px-8">
            <div className="mx-auto max-w-4xl">
                <Link to="/chats" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#15945a]">
                    <ArrowLeft size={16} /> Back to Chats
                </Link>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
                    <div className="border-b border-slate-100 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#48c96f]/15 text-sm font-black text-[#15945a]">
                                    {other.username?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-black text-slate-900">@{other.username || "student"}</h1>
                                    <p className="truncate text-xs font-bold text-slate-400">
                                        {chat?.listing?.title || "Direct chat"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleDeleteChat}
                                disabled={deleting}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete chat"
                            >
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-5 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex h-[56vh] items-center justify-center gap-3 text-sm font-bold text-slate-500">
                            <Loader2 size={20} className="animate-spin text-[#48c96f]" /> Loading conversation...
                        </div>
                    ) : (
                        <>
                            <div className="h-[56vh] overflow-y-auto bg-slate-50/60 p-5">
                                {messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
                                            <MessageCircle size={28} />
                                        </div>
                                        <p className="font-black text-slate-800">No messages yet</p>
                                        <p className="mt-1 text-sm text-slate-500">Send a friendly message to start the conversation.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((message) => {
                                            const senderId = message.sender?._id || message.sender;
                                            const mine = String(senderId) === String(getUserId(user));
                                            return (
                                                <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                        mine
                                                            ? "bg-[#48c96f] text-white"
                                                            : "border border-slate-200 bg-white text-slate-700"
                                                    }`}>
                                                        <p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed">{message.text}</p>
                                                        <p className={`mt-1 text-[10px] font-bold ${mine ? "text-white/70" : "text-slate-400"}`}>
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={bottomRef} />
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-100 p-4">
                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type your message..."
                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#48c96f] focus:bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!text.trim() || sending}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#3db65e] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    <span className="hidden sm:inline">Send</span>
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
