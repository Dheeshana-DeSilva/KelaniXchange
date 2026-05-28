import React, { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Bell,
    CalendarDays,
    CheckCircle,
    Loader2,
    Megaphone,
    Search,
    Send,
    Star,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";
import {
    createAdminNotification,
    deleteAdminNotification,
    getAdminNotifications,
    getAllUsers,
} from "../../services/adminService";
import { useConfirm } from "../../components/ui/AlertProvider";

const TYPES = [
    { value: "system", label: "System" },
    { value: "payment", label: "Payment" },
    { value: "order", label: "Order" },
    { value: "listing", label: "Listing" },
    { value: "report", label: "Report" },
    { value: "lost_found", label: "Lost and Found" },
    { value: "warning", label: "User warning" },
    { value: "role_update", label: "Role update" },
];

const emptyForm = {
    title: "",
    message: "",
    type: "system",
    targetType: "all",
    userId: "",
    isImportant: false,
};

const StatCard = ({ icon: Icon, label, value, tone = "emerald" }) => {
    const tones = {
        emerald: "bg-emerald-50 text-emerald-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-700",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{value ?? 0}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
};

const ManageNotifications = () => {
    const { confirmAction } = useConfirm();
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [typeFilter, setTypeFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");

    const loadNotifications = async () => {
        try {
            const data = await getAdminNotifications();
            setNotifications(data.notifications || []);
            setStats(data.stats || {});
            setError("");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data.users || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load users");
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        loadUsers();
    }, []);

    const filteredNotifications = useMemo(() => {
        let result = notifications;

        if (typeFilter !== "all") {
            result = result.filter((item) => item.type === typeFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((item) =>
                item.title?.toLowerCase().includes(q) ||
                item.message?.toLowerCase().includes(q) ||
                item.target?.toLowerCase().includes(q) ||
                item.sentBy?.username?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [notifications, search, typeFilter]);

    const selectedUserOptions = users.filter((user) => !user.isSuspended && user.accountStatus !== "deactivated");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.targetType === "user" && !form.userId) {
            alert("Please select a user");
            return;
        }

        setSubmitting(true);
        try {
            await createAdminNotification(form);
            setForm(emptyForm);
            await loadNotifications();
            window.dispatchEvent(new Event("kx:notifications-updated"));
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to send notification");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (notification) => {
        const confirmed = await confirmAction({
            title: "Delete notification?",
            message: `Delete "${notification.title}" for all targeted users?`,
            confirmText: "Delete notification",
        });
        if (!confirmed) return;

        setActionLoading(notification._id);
        try {
            await deleteAdminNotification(notification._id);
            await loadNotifications();
            window.dispatchEvent(new Event("kx:notifications-updated"));
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to delete notification");
        } finally {
            setActionLoading("");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#48c96f]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800">Notifications</h1>
                <p className="mt-1 text-sm text-slate-500">Send and manage important platform updates.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Bell} label="Total Notifications" value={stats.totalNotifications} />
                <StatCard icon={CalendarDays} label="Sent Today" value={stats.sentToday} tone="blue" />
                <StatCard icon={Star} label="Important" value={stats.importantNotifications} tone="amber" />
                <StatCard icon={AlertTriangle} label="Unread by Users" value={stats.unreadByUsers} tone="rose" />
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Megaphone size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900">Create Notification</h2>
                        <p className="text-sm text-slate-500">Send to all users or one selected user.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#48c96f]/50"
                            placeholder="System maintenance tonight"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Notification type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#48c96f]/50"
                        >
                            {TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="lg:col-span-2">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
                        <textarea
                            value={form.message}
                            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                            className="min-h-[110px] w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#48c96f]/50"
                            placeholder="Write the notification message users should receive."
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Target users</label>
                        <select
                            value={form.targetType}
                            onChange={(e) => setForm((prev) => ({ ...prev, targetType: e.target.value, userId: "" }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#48c96f]/50"
                        >
                            <option value="all">All users</option>
                            <option value="user">One selected user</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Selected user</label>
                        <select
                            value={form.userId}
                            onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
                            disabled={form.targetType !== "user" || usersLoading}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#48c96f]/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="">{usersLoading ? "Loading users..." : "Select a user"}</option>
                            {selectedUserOptions.map((user) => (
                                <option key={user._id} value={user._id}>
                                    @{user.username} - {user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.isImportant}
                            onChange={(e) => setForm((prev) => ({ ...prev, isImportant: e.target.checked }))}
                            className="h-4 w-4 accent-[#48c96f]"
                        />
                        Mark as important
                    </label>

                    <div className="flex justify-end lg:col-span-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#15945a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                            Send Notification
                        </button>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setTypeFilter("all")}
                            className={`rounded-xl px-3 py-2 text-xs font-black ${typeFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            All
                        </button>
                        {TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setTypeFilter(type.value)}
                                className={`rounded-xl px-3 py-2 text-xs font-black ${typeFilter === type.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#48c96f]/50"
                            placeholder="Search notifications"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                {["Title", "Message", "Type", "Target", "Sent By", "Date", "Status", "Action"].map((heading, index) => (
                                    <th key={heading} className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${index === 7 ? "text-right" : ""}`}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredNotifications.map((notification) => (
                                <tr key={notification._id} className="align-top hover:bg-slate-50">
                                    <td className="min-w-[220px] px-5 py-4">
                                        <div className="flex items-start gap-2">
                                            {notification.isImportant && <Star className="mt-0.5 shrink-0 fill-amber-400 text-amber-400" size={15} />}
                                            <p className="text-sm font-black text-slate-900">{notification.title}</p>
                                        </div>
                                    </td>
                                    <td className="min-w-[300px] max-w-[420px] px-5 py-4 text-sm leading-6 text-slate-600">
                                        {notification.message}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
                                            {TYPES.find((type) => type.value === notification.type)?.label || notification.type}
                                        </span>
                                    </td>
                                    <td className="min-w-[150px] px-5 py-4 text-sm font-semibold text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Users size={15} className="text-slate-400" />
                                            <span>{notification.target}</span>
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                                                {notification.recipientCount}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {notification.sentBy?.username ? `@${notification.sentBy.username}` : "Admin"}
                                    </td>
                                    <td className="min-w-[160px] px-5 py-4 text-sm text-slate-500">
                                        {new Date(notification.date).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${notification.unreadCount > 0 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                                            {notification.unreadCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                            {notification.unreadCount > 0 ? `${notification.unreadCount} unread` : "Read"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(notification)}
                                            disabled={actionLoading === notification._id}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                            title="Delete notification"
                                        >
                                            {actionLoading === notification._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredNotifications.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <XCircle size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No notifications found.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ManageNotifications;
