import React, { useState, useEffect } from "react";
import { Loader2, XCircle, CheckCircle, Clock, Eye } from "lucide-react";
import { getAllReports, updateReportStatus } from "../../services/adminService";

const ManageReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        try {
            const data = await getAllReports();
            setReports(data.reports || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load reports");
        } finally { setLoading(false); }
    };

    const handleStatusChange = async (id, status) => {
        setActionLoading(id);
        try {
            await updateReportStatus(id, status);
            const data = await getAllReports();
            setReports(data.reports || []);
        } catch (err) { alert(err?.response?.data?.message || "Failed"); }
        finally { setActionLoading(null); }
    };

    const statusBadge = (s) => {
        if (s === "pending") return { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
        if (s === "reviewed") return { cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Eye };
        return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle };
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#48c96f]" size={32} /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><XCircle className="text-rose-400 mb-3" size={40} /><p className="text-slate-500 font-semibold">{error}</p></div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reports</h1>
                <p className="text-sm text-slate-500 mt-1">{reports.length} report{reports.length !== 1 ? "s" : ""} submitted</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-slate-200">
                            {["Reported Listing","Reported By","Reason","Status","Date","Actions"].map((h,i)=><th key={i} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${i===5?"text-right":""}`}>{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((r) => {
                                const badge = statusBadge(r.status);
                                const Icon = badge.icon;
                                return (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-800">{r.reportedListing?.title || "Deleted Listing"}</p>
                                            <p className="text-xs text-slate-500">{r.reportedListing?.category}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{r.reportedBy?.username || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">{r.reason || "—"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${badge.cls}`}>
                                                <Icon size={12} /> {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={r.status}
                                                onChange={(e) => handleStatusChange(r._id, e.target.value)}
                                                disabled={actionLoading === r._id}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#48c96f]/40 disabled:opacity-50"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {reports.length === 0 && <div className="py-16 text-center"><p className="text-slate-500 text-sm">No reports found.</p></div>}
            </div>
        </div>
    );
};

export default ManageReports;
