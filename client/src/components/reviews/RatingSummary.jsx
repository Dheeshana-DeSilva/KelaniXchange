import { Star } from "lucide-react";

export default function RatingSummary({ summary, className = "" }) {
    const average = Number(summary?.averageRating || 0);
    const total = Number(summary?.totalReviews || 0);

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ${className}`}>
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {total > 0 ? `${average.toFixed(1)}/5` : "No ratings yet"}
            {total > 0 && <span className="font-bold text-amber-600">({total})</span>}
        </div>
    );
}
