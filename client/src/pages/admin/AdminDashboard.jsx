import React, { useState, useEffect } from "react";
import {
    Users, Package, AlertTriangle, ArrowLeftRight, CheckCircle,
    XCircle, Loader2, ShoppingCart, CreditCard, HelpCircle
} from "lucide-react";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { getDashboardStats } from "../../services/adminService";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data.stats);
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[#48c96f]" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <XCircle className="text-rose-400 mb-3" size={40} />
                <p className="text-slate-300 font-semibold">{error}</p>
            </div>
        );
    }

    const cards = [
        {
            icon: Users,
            label: "Total Users",
            value: stats?.totalUsers ?? 0,
            color: "#6366f1",
        },
        {
            icon: Package,
            label: "Total Listings",
            value: stats?.totalListings ?? 0,
            color: "#48c96f",
        },
        {
            icon: CheckCircle,
            label: "Available Listings",
            value: stats?.availableListings ?? 0,
            color: "#22d3ee",
        },
        {
            icon: XCircle,
            label: "Removed Listings",
            value: stats?.removedListings ?? 0,
            color: "#f43f5e",
        },
        {
            icon: AlertTriangle,
            label: "Total Reports",
            value: stats?.totalReports ?? 0,
            trendLabel: `${stats?.pendingReports ?? 0} pending`,
            trend: stats?.pendingReports > 0 ? "up" : null,
            color: "#f59e0b",
        },
        {
            icon: ArrowLeftRight,
            label: "Exchange Requests",
            value: stats?.totalExchangeRequests ?? 0,
            color: "#a78bfa",
        },
        {
            icon: ShoppingCart,
            label: "Total Orders",
            value: stats?.totalOrders ?? 0,
            trendLabel: `${stats?.pendingOrders ?? 0} pending`,
            trend: stats?.pendingOrders > 0 ? "up" : null,
            color: "#0ea5e9",
        },
        {
            icon: CreditCard,
            label: "Payments",
            value: stats?.totalPayments ?? 0,
            trendLabel: `${stats?.pendingPayments ?? 0} pending`,
            trend: stats?.pendingPayments > 0 ? "up" : null,
            color: "#14b8a6",
        },
        {
            icon: HelpCircle,
            label: "Lost & Found",
            value: stats?.totalLostFoundPosts ?? 0,
            trendLabel: `${stats?.openLostFoundPosts ?? 0} open`,
            color: "#f97316",
        },
    ];

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Overview of your platform's activity and statistics.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <AdminStatCard key={card.label} {...card} />
                ))}
            </div>

            {/* Quick Info */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                    <a
                        href="/admin/users"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                        <Users size={18} className="text-indigo-500" />
                        Manage Users
                    </a>
                    <a
                        href="/admin/listings"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                        <Package size={18} className="text-emerald-500" />
                        Manage Listings
                    </a>
                    <a
                        href="/admin/reports"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                        <AlertTriangle size={18} className="text-amber-500" />
                        View Reports
                    </a>
                    <a
                        href="/admin/orders"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                        <ShoppingCart size={18} className="text-sky-500" />
                        Manage Orders
                    </a>
                    <a
                        href="/admin/payments"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                        <CreditCard size={18} className="text-teal-500" />
                        Verify Payments
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
