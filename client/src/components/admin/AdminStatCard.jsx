import React from "react";

const AdminStatCard = ({ icon: Icon, label, value, trend, trendLabel, color = "#48c96f" }) => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-black/5 group">
            {/* Glow accent */}
            <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: color }}
            />

            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        {label}
                    </p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">
                        {value ?? "—"}
                    </p>
                    {trendLabel && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <span
                                className={`text-xs font-bold ${
                                    trend === "up"
                                        ? "text-emerald-500"
                                        : trend === "down"
                                        ? "text-rose-500"
                                        : "text-slate-500"
                                }`}
                            >
                                {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {trendLabel}
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100"
                    style={{ background: `${color}10` }}
                >
                    <Icon size={22} style={{ color }} />
                </div>
            </div>
        </div>
    );
};

export default AdminStatCard;
