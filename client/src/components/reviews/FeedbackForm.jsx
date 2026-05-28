import { useState } from "react";
import { Loader2, Star } from "lucide-react";

export default function FeedbackForm({ compact = false, onSubmit }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);
            await onSubmit({ rating, comment });
            setComment("");
            setRating(5);
        } catch {
            // The caller shows the actual error alert.
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 ${compact ? "space-y-3" : "space-y-4"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#15945a]">Rate seller</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">Share feedback for this completed transaction.</p>
                </div>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="rounded-lg p-0.5 text-amber-400 transition-transform hover:scale-110"
                            aria-label={`${value} star rating`}
                        >
                            <Star size={18} className={value <= rating ? "fill-amber-400" : "fill-none text-slate-300"} />
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={compact ? 2 : 3}
                maxLength={500}
                placeholder="Good seller. Item was exactly as described."
                className="w-full resize-none rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#48c96f]"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#48c96f] px-4 py-2.5 text-xs font-black text-white hover:bg-[#3db65e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                    Submit Review
                </button>
            </div>
        </form>
    );
}
