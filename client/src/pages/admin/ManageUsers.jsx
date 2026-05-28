import React, { useState, useEffect } from "react";
import {
    Search, Loader2, XCircle, Plus, Trash2, X,
    Shield, ShieldOff, Ban, CheckCircle, UserCog, ChevronDown
} from "lucide-react";
import {
    getAllUsers, addUser, deleteUser,
    suspendUser, unsuspendUser,
    updateUserRole, updateUserStatus,
} from "../../services/adminService";
import { useConfirm } from "../../components/ui/AlertProvider";

/* ─── helpers ─── */
const ROLES = ["USER", "SELLER", "ADMIN"];
const STATUSES = ["active", "blocked", "deactivated"];

const statusBadge = (user) => {
    if (user.accountStatus === "blocked" || user.isSuspended)
        return { label: "Blocked", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" };
    if (user.accountStatus === "deactivated")
        return { label: "Deactivated", cls: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" };
    return { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
};

const roleBadge = (role) =>
    role === "ADMIN"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : role === "SELLER"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

const avatarGradient = (username) => {
    const colors = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-indigo-600",
        "from-emerald-500 to-teal-600",
        "from-rose-500 to-pink-600",
        "from-amber-500 to-orange-600",
    ];
    const idx = (username?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
};

/* ─── Field component ─── */
const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40 focus:ring-1 focus:ring-[#48c96f]/10 transition-colors";

/* ════════════════════════════════════════════ */
const ManageUsers = () => {
    const { confirmAction } = useConfirm();
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    /* Add modal */
    const [showAddModal, setShowAddModal] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: "", username: "", email: "", password: "", role: "USER" });

    /* Edit role modal */
    const [editRoleModal, setEditRoleModal] = useState(null); // user object
    const [editRole, setEditRole] = useState("USER");

    /* Edit status modal */
    const [editStatusModal, setEditStatusModal] = useState(null); // user object
    const [editStatus, setEditStatus] = useState("active");

    /* ── data ── */
    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        let result = users;
        if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
        if (statusFilter !== "all") {
            result = result.filter((u) => {
                if (statusFilter === "active") return !u.isSuspended && u.accountStatus !== "deactivated";
                if (statusFilter === "blocked") return u.isSuspended || u.accountStatus === "blocked";
                if (statusFilter === "deactivated") return u.accountStatus === "deactivated";
                return true;
            });
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((u) =>
                u.username?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.fullName?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, roleFilter, statusFilter, users]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data.users || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load users");
        } finally { setLoading(false); }
    };

    /* ── actions ── */
    const handleToggleSuspend = async (user) => {
        setActionLoading(user._id + "-suspend");
        try {
            if (user.isSuspended) await unsuspendUser(user._id);
            else await suspendUser(user._id);
            await fetchUsers();
        } catch (err) { alert(err?.response?.data?.message || "Action failed"); }
        finally { setActionLoading(null); }
    };

    const handleDeleteUser = async (user) => {
        const confirmed = await confirmAction({
            title: "Delete user?",
            message: `Permanently delete "${user.username}"? This cannot be undone.`,
            confirmText: "Delete user",
        });
        if (!confirmed) return;
        setActionLoading(user._id + "-delete");
        try {
            await deleteUser(user._id);
            await fetchUsers();
        } catch (err) { alert(err?.response?.data?.message || "Failed to delete user"); }
        finally { setActionLoading(null); }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            await addUser(newUser);
            setShowAddModal(false);
            setNewUser({ fullName: "", username: "", email: "", password: "", role: "USER" });
            await fetchUsers();
        } catch (err) { alert(err?.response?.data?.message || "Failed to add user"); }
        finally { setAddLoading(false); }
    };

    const handleSaveRole = async (e) => {
        e.preventDefault();
        if (!editRoleModal) return;
        setActionLoading(editRoleModal._id + "-role");
        try {
            await updateUserRole(editRoleModal._id, editRole);
            setEditRoleModal(null);
            await fetchUsers();
        } catch (err) { alert(err?.response?.data?.message || "Failed to update role"); }
        finally { setActionLoading(null); }
    };

    const handleSaveStatus = async (e) => {
        e.preventDefault();
        if (!editStatusModal) return;
        setActionLoading(editStatusModal._id + "-status");
        try {
            await updateUserStatus(editStatusModal._id, editStatus);
            setEditStatusModal(null);
            await fetchUsers();
        } catch (err) { alert(err?.response?.data?.message || "Failed to update status"); }
        finally { setActionLoading(null); }
    };

    /* ── render guards ── */
    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#48c96f]" size={32} /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><XCircle className="text-rose-400 mb-3" size={40} /><p className="text-slate-500 font-semibold">{error}</p></div>;

    /* ════════════════ JSX ════════════════ */
    return (
        <div>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Users</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {users.length} registered user{users.length !== 1 ? "s" : ""}
                        {filtered.length !== users.length && ` · ${filtered.length} shown`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Role filter */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2.5 text-sm text-slate-700 font-medium outline-none focus:border-[#48c96f]/40 cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="USER">User</option>
                            <option value="SELLER">Seller</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2.5 text-sm text-slate-700 font-medium outline-none focus:border-[#48c96f]/40 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                            <option value="deactivated">Deactivated</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative min-w-[200px]">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#48c96f]/40"
                        />
                    </div>

                    {/* Add User */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#48c96f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3db65e] transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add User
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h, i) => (
                                    <th key={i} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${i === 5 ? "text-right" : ""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((u) => {
                                const sb = statusBadge(u);
                                const isAdmin = u.role === "ADMIN";
                                return (
                                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarGradient(u.username)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                                    {u.username?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 leading-tight">{u.fullName || u.username}</p>
                                                    <p className="text-xs text-slate-400">@{u.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${roleBadge(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${sb.cls}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${sb.dot}`} />
                                                {sb.label}
                                            </span>
                                        </td>
                                        {/* Joined */}
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Edit Role */}
                                                <button
                                                    onClick={() => { setEditRoleModal(u); setEditRole(u.role); }}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                    title="Change role"
                                                >
                                                    <UserCog size={13} /> Role
                                                </button>

                                                {!isAdmin && (
                                                    <>
                                                        {/* Block/Unblock */}
                                                        <button
                                                            onClick={() => handleToggleSuspend(u)}
                                                            disabled={actionLoading === u._id + "-suspend"}
                                                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                                                                u.isSuspended
                                                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                                                                    : "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200"
                                                            }`}
                                                            title={u.isSuspended ? "Unblock user" : "Block user"}
                                                        >
                                                            {actionLoading === u._id + "-suspend" ? (
                                                                <Loader2 size={13} className="animate-spin" />
                                                            ) : u.isSuspended ? (
                                                                <CheckCircle size={13} />
                                                            ) : (
                                                                <Ban size={13} />
                                                            )}
                                                            {u.isSuspended ? "Unblock" : "Block"}
                                                        </button>

                                                        {/* Account Status */}
                                                        <button
                                                            onClick={() => { setEditStatusModal(u); setEditStatus(u.accountStatus || "active"); }}
                                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                                                            title="Set account status"
                                                        >
                                                            <Shield size={13} /> Status
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={actionLoading === u._id + "-delete"}
                                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                                                            title="Delete user"
                                                        >
                                                            {actionLoading === u._id + "-delete" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <p className="text-slate-500 text-sm">No users found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* ════ Add User Modal ════ */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800">Add New User</h3>
                            <button onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <Field label="Full Name">
                                <input required type="text" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className={inputCls} placeholder="John Doe" />
                            </Field>
                            <Field label="Username">
                                <input required type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className={inputCls} placeholder="johndoe" />
                            </Field>
                            <Field label="Email">
                                <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className={inputCls} placeholder="john@example.com" />
                            </Field>
                            <Field label="Password">
                                <input required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={inputCls} placeholder="••••••••" />
                            </Field>
                            <Field label="Role">
                                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className={inputCls}>
                                    <option value="USER">User</option>
                                    <option value="SELLER">Seller</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </Field>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={addLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#48c96f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3db65e] disabled:opacity-50">
                                    {addLoading && <Loader2 size={15} className="animate-spin" />} Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ Edit Role Modal ════ */}
            {editRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditRoleModal(null)} />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-black text-slate-800">Change User Role</h3>
                                <p className="text-xs text-slate-400 mt-0.5">@{editRoleModal.username}</p>
                            </div>
                            <button onClick={() => setEditRoleModal(null)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRole} className="p-6 space-y-4">
                            <Field label="Select Role">
                                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className={inputCls}>
                                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </Field>
                            <p className="text-xs text-slate-400">
                                ⚠️ Granting ADMIN role gives full control over the platform. Use with caution.
                            </p>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setEditRoleModal(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={actionLoading === editRoleModal._id + "-role"} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                                    {actionLoading === editRoleModal._id + "-role" && <Loader2 size={15} className="animate-spin" />} Save Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ Edit Status Modal ════ */}
            {editStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditStatusModal(null)} />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-black text-slate-800">Set Account Status</h3>
                                <p className="text-xs text-slate-400 mt-0.5">@{editStatusModal.username}</p>
                            </div>
                            <button onClick={() => setEditStatusModal(null)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
                            <div className="space-y-2">
                                {STATUSES.map((s) => (
                                    <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${editStatus === s ? "border-[#48c96f]/40 bg-[#48c96f]/5" : "border-slate-200 hover:bg-slate-50"}`}>
                                        <input type="radio" name="status" value={s} checked={editStatus === s} onChange={() => setEditStatus(s)} className="accent-[#48c96f]" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 capitalize">{s}</p>
                                            <p className="text-xs text-slate-400">
                                                {s === "active" && "User can log in and use all features"}
                                                {s === "blocked" && "User cannot create listings, chat, or place orders"}
                                                {s === "deactivated" && "Account is soft-disabled but data is kept"}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setEditStatusModal(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={actionLoading === editStatusModal._id + "-status"} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                                    {actionLoading === editStatusModal._id + "-status" && <Loader2 size={15} className="animate-spin" />} Apply Status
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
