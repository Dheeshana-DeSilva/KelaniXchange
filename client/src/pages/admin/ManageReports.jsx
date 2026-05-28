import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { CheckCircle, Clock, ExternalLink, Eye, Loader2, XCircle } from "lucide-react";
import { getAllReports, updateReportStatus } from "../../services/adminService";

const ManageReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await getAllReports();
            setReports(data.reports || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        setActionLoading(id);
        try {
            await updateReportStatus(id, status);
            const data = await getAllReports();
            setReports(data.reports || []);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed");
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status) => {
        if (status === "pending") return { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
        if (status === "reviewed") return { cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Eye };
        return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle };
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return "Price not set";
        return `Rs. ${Number(price).toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#48c96f]" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <XCircle className="mb-3 text-rose-400" size={40} />
                <p className="font-semibold text-slate-500">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-800">Reports</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                {["Reported Listing", "Reported By", "Report Details", "Status", "Date", "Actions"].map((heading, index) => (
                                    <th
                                        key={heading}
                                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${index === 5 ? "text-right" : ""}`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report) => {
                                const badge = statusBadge(report.status);
                                const Icon = badge.icon;
                                const listing = report.reportedListing;

                                return (
                                    <tr key={report._id} className="align-top transition-colors hover:bg-slate-50">
                                        <td className="min-w-[260px] px-6 py-5">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {listing?.title || "Deleted Listing"}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span>{listing?.category || "Unknown category"}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                <span>{formatPrice(listing?.price)}</span>
                                            </div>
                                            {listing?.seller && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Seller: <span className="font-semibold text-slate-700">@{listing.seller.username}</span>
                                                </p>
                                            )}
                                            {listing?.status && (
                                                <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                                                    {listing.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="min-w-[190px] px-6 py-5">
                                            <p className="text-sm font-semibold text-slate-700">
                                                {report.reportedBy?.username ? `@${report.reportedBy.username}` : "-"}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {report.reportedBy?.email || "No email"}
                                            </p>
                                        </td>
                                        <td className="min-w-[320px] max-w-[420px] px-6 py-5">
                                            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                                                {report.reason || "No reason provided"}
                                            </span>
                                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                                {report.description?.trim() || "No extra details were provided by the reporter."}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.cls}`}>
                                                <Icon size={12} /> {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {listing?._id && (
                                                <Link
                                                    to={`/marketplace/${listing._id}`}
                                                    className="mb-3 inline-flex items-center justify-end gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-[#48c96f]/40 hover:text-[#0d8f43]"
                                                >
                                                    View Listing <ExternalLink size={12} />
                                                </Link>
                                            )}
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report._id, e.target.value)}
                                                disabled={actionLoading === report._id}
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
                {reports.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-slate-500">No reports found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReports;
