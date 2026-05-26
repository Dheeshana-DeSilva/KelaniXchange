import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    ArrowLeft, ArrowRightLeft, Bell, CheckCheck, Loader2, MessageCircle,
    PackageCheck, ShoppingBag, Trash2, WalletCards
} from "lucide-react";
import {
    deleteAllNotifications,
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

const typeMeta = {
    exchange_request: { icon: ArrowRightLeft, color: "text-sky-600", bg: "bg-sky-50", label: "Exchange" },
    exchange_accepted: { icon: ArrowRightLeft, color: "text-emerald-600", bg: "bg-emerald-50", label: "Exchange" },
    exchange_rejected: { icon: ArrowRightLeft, color: "text-rose-600", bg: "bg-rose-50", label: "Exchange" },
    chat_message: { icon: MessageCircle, color: "text-indigo-600", bg: "bg-indigo-50", label: "Message" },
    order_placed: { icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50", label: "Order" },
    order_received: { icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50", label: "Sale" },
    order_updated: { icon: PackageCheck, color: "text-amber-600", bg: "bg-amber-50", label: "Order" },
    order_cancelled: { icon: PackageCheck, color: "text-rose-600", bg: "bg-rose-50", label: "Order" },
    payment_updated: { icon: WalletCards, color: "text-cyan-600", bg: "bg-cyan-50", label: "Payment" },
    system: { icon: Bell, color: "text-slate-600", bg: "bg-slate-50", label: "System" },
};

const notificationTarget = (notification) => {
    if (notification.type?.startsWith("exchange")) return "/exchanges";
    if (notification.type === "chat_message") return `/chats/${notification.relatedId}`;
    if (notification.type === "order_received") return "/sales";
    if (notification.type?.startsWith("order") || notification.type === "payment_updated") return "/orders";
    return "/notifications";
};

export default function Notifications() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) loadNotifications();
    }, [isAuthenticated]);

    const grouped = useMemo(() => notifications, [notifications]);

    const handleOpen = async (notification) => {
        try {
            if (!notification.isRead) {
                setActionLoading(notification._id);
                await markNotificationAsRead(notification._id);
                window.dispatchEvent(new Event("kx:notifications-updated"));
            }
            navigate(notificationTarget(notification));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update notification.");
        } finally {
            setActionLoading("");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setActionLoading("all");
            await markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
            setUnreadCount(0);
            window.dispatchEvent(new Event("kx:notifications-updated"));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to mark notifications as read.");
        } finally {
            setActionLoading("");
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        try {
            setActionLoading(notificationId);
            await deleteNotification(notificationId);
            setNotifications((prev) => {
                const deleted = prev.find((item) => item._id === notificationId);
                if (deleted && !deleted.isRead) {
                    setUnreadCount((count) => Math.max(0, count - 1));
                }
                return prev.filter((item) => item._id !== notificationId);
            });
            window.dispatchEvent(new Event("kx:notifications-updated"));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete notification.");
        } finally {
            setActionLoading("");
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm("Delete all notifications?")) return;
        try {
            setActionLoading("delete-all");
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            window.dispatchEvent(new Event("kx:notifications-updated"));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete notifications.");
        } finally {
            setActionLoading("");
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
                                Notifications <Bell size={24} className="text-[#48c96f]" />
                            </h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You are all caught up."}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                disabled={unreadCount === 0 || actionLoading === "all"}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionLoading === "all" ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
                                Mark all read
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAll}
                                disabled={notifications.length === 0 || actionLoading === "delete-all"}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionLoading === "delete-all" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Delete all
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16 text-sm font-bold text-slate-500">
                            <Loader2 size={20} className="animate-spin text-[#48c96f]" /> Loading notifications...
                        </div>
                    ) : grouped.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Bell size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">No notifications yet</h2>
                            <p className="mt-1 text-sm text-slate-500">Order, exchange, and message updates will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {grouped.map((notification) => {
                                const meta = typeMeta[notification.type] || typeMeta.system;
                                const Icon = meta.icon;
                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleOpen(notification)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") handleOpen(notification);
                                        }}
                                        className={`w-full rounded-2xl border p-4 text-left transition-colors hover:border-[#48c96f]/40 hover:bg-emerald-50/30 ${
                                            notification.isRead ? "border-slate-100 bg-white" : "border-[#48c96f]/30 bg-[#48c96f]/5"
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-black text-slate-900">{notification.title}</h3>
                                                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-[#48c96f]" />}
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                                        {meta.label}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-slate-600">{notification.message}</p>
                                                <p className="mt-2 text-xs font-bold text-slate-400">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(e, notification._id)}
                                                disabled={actionLoading === notification._id}
                                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                title="Delete notification"
                                            >
                                                {actionLoading === notification._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                            </button>
                                        </div>
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
