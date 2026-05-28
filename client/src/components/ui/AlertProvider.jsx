import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, Trash2, X } from "lucide-react";

const AlertContext = createContext(null);
const ConfirmContext = createContext(null);

const errorWords = [
    "failed",
    "error",
    "invalid",
    "cannot",
    "please",
    "required",
    "not authorized",
    "maximum",
    "select",
];

const successWords = [
    "success",
    "successfully",
    "submitted",
    "updated",
    "deleted",
    "added",
    "published",
    "placed",
    "sent",
];

const styles = {
    success: {
        Icon: CheckCircle2,
        wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: "text-emerald-600",
        close: "text-emerald-700 hover:bg-emerald-100",
    },
    error: {
        Icon: AlertCircle,
        wrapper: "border-rose-200 bg-rose-50 text-rose-800",
        icon: "text-rose-600",
        close: "text-rose-700 hover:bg-rose-100",
    },
    info: {
        Icon: Info,
        wrapper: "border-slate-200 bg-white text-slate-800",
        icon: "text-slate-600",
        close: "text-slate-600 hover:bg-slate-100",
    },
};

const getAlertType = (message) => {
    const text = String(message || "").toLowerCase();
    if (successWords.some((word) => text.includes(word))) return "success";
    if (errorWords.some((word) => text.includes(word))) return "error";
    return "info";
};

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);
    const [confirmation, setConfirmation] = useState(null);
    const timers = useRef(new Map());
    const confirmationResolver = useRef(null);

    const dismissAlert = useCallback((id) => {
        setAlerts((current) => current.filter((alert) => alert.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const showAlert = useCallback((message, type) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const nextAlert = {
            id,
            message: String(message || "Something happened."),
            type: type || getAlertType(message),
        };

        setAlerts((current) => [...current.slice(-3), nextAlert]);
        const timer = setTimeout(() => dismissAlert(id), 4200);
        timers.current.set(id, timer);
    }, [dismissAlert]);

    const confirmAction = useCallback((options = {}) => {
        const config = typeof options === "string" ? { message: options } : options;

        return new Promise((resolve) => {
            confirmationResolver.current = resolve;
            setConfirmation({
                title: config.title || "Confirm delete",
                message: config.message || "This action cannot be undone.",
                confirmText: config.confirmText || "Delete",
                cancelText: config.cancelText || "Cancel",
                destructive: config.destructive !== false,
            });
        });
    }, []);

    const closeConfirmation = useCallback((result) => {
        if (confirmationResolver.current) {
            confirmationResolver.current(result);
            confirmationResolver.current = null;
        }
        setConfirmation(null);
    }, []);

    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (message) => showAlert(message);

        return () => {
            window.alert = originalAlert;
            timers.current.forEach((timer) => clearTimeout(timer));
            timers.current.clear();
            if (confirmationResolver.current) {
                confirmationResolver.current(false);
                confirmationResolver.current = null;
            }
        };
    }, [showAlert]);

    const value = useMemo(() => ({
        showAlert,
        showSuccess: (message) => showAlert(message, "success"),
        showError: (message) => showAlert(message, "error"),
        showInfo: (message) => showAlert(message, "info"),
    }), [showAlert]);

    const confirmValue = useMemo(() => ({ confirmAction }), [confirmAction]);

    return (
        <AlertContext.Provider value={value}>
            <ConfirmContext.Provider value={confirmValue}>
                {children}
            </ConfirmContext.Provider>
            <div className="fixed right-4 top-4 z-[1000] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
                {alerts.map((alert) => {
                    const typeStyles = styles[alert.type] || styles.info;
                    const Icon = typeStyles.Icon;

                    return (
                        <div
                            key={alert.id}
                            role="status"
                            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl shadow-slate-900/10 backdrop-blur ${typeStyles.wrapper}`}
                        >
                            <Icon size={20} className={`mt-0.5 shrink-0 ${typeStyles.icon}`} />
                            <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{alert.message}</p>
                            <button
                                type="button"
                                onClick={() => dismissAlert(alert.id)}
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${typeStyles.close}`}
                                aria-label="Dismiss alert"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
            {confirmation && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => closeConfirmation(false)}
                        aria-label="Cancel confirmation"
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
                        <div className="flex items-start gap-4">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                confirmation.destructive ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700"
                            }`}>
                                <Trash2 size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-black text-slate-900">{confirmation.title}</h2>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{confirmation.message}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => closeConfirmation(false)}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                            >
                                {confirmation.cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() => closeConfirmation(true)}
                                className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-black text-white ${
                                    confirmation.destructive ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-slate-800"
                                }`}
                            >
                                {confirmation.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlerts must be used inside AlertProvider");
    }
    return context;
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used inside AlertProvider");
    }
    return context;
}
