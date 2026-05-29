import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
    User, AtSign, Mail, Lock, Eye, EyeOff, ArrowRight,
    CheckCircle2, AlertCircle, Loader2, ShoppingBag, Phone,
} from "lucide-react";
import { registerAsync, clearError } from "../features/auth/authSlice";
import logo from "../assets/X_logo.png";
import campusBg from "../assets/register_illustration.png";

/* ── validation ── */
const validators = {
    fullName: (v) => (v.trim().length >= 2 ? "" : "Full name must be at least 2 characters"),
    username: (v) => /^[a-z0-9_]{3,20}$/.test(v) ? "" : "3–20 chars, lowercase letters, numbers or underscores only",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address",
    phone: (v) => /^(?:0\d{9}|\+94\d{9})$/.test(v.replace(/\s+/g, "")) ? "" : "Enter a valid phone number",
    password: (v) => v.length >= 8 ? "" : "Password must be at least 8 characters",
    confirmPassword: (v, form) => v === form.password ? "" : "Passwords do not match",
};

const INITIAL = { fullName: "", username: "", email: "", phone: "", password: "", confirmPassword: "" };

function InputField({ id, label, type = "text", icon: Icon, value, onChange, onBlur, error, touched, rightSlot, placeholder, autoComplete }) {
    const isValid = touched && !error && value.length > 0;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label htmlFor={id} style={{ fontSize: "11.5px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.2px" }}>{label}</label>
            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: isValid ? "#48c96f" : touched && error ? "#f87171" : "#475569", pointerEvents: "none", display: "flex" }}>
                    <Icon size={14} strokeWidth={2} />
                </span>
                <input
                    id={id} name={id} type={type} value={value}
                    onChange={onChange} onBlur={onBlur}
                    placeholder={placeholder} autoComplete={autoComplete}
                    style={{
                        width: "100%", boxSizing: "border-box",
                        background: touched && error ? "rgba(239,68,68,0.06)" : isValid ? "rgba(72,201,111,0.06)" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${touched && error ? "rgba(239,68,68,0.4)" : isValid ? "rgba(72,201,111,0.4)" : "rgba(255,255,255,0.09)"}`,
                        borderRadius: "10px", padding: "9px 34px",
                        fontSize: "13px", color: "#f1f5f9",
                        outline: "none", transition: "all 0.2s", fontFamily: "inherit",
                    }}
                    onFocus={e => { e.target.style.borderColor = touched && error ? "rgba(239,68,68,0.6)" : "rgba(72,201,111,0.5)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlurCapture={e => { e.target.style.background = touched && error ? "rgba(239,68,68,0.06)" : isValid ? "rgba(72,201,111,0.06)" : "rgba(255,255,255,0.04)"; }}
                />
                <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                    {rightSlot ? rightSlot : isValid ? <CheckCircle2 size={13} color="#48c96f" /> : touched && error ? <AlertCircle size={13} color="#f87171" /> : null}
                </span>
            </div>
            {touched && error && (
                <p style={{ fontSize: "10.5px", color: "#f87171", display: "flex", alignItems: "center", gap: "4px", margin: 0 }}>
                    <AlertCircle size={10} /> {error}
                </p>
            )}
        </div>
    );
}

function StrengthBar({ password }) {
    if (!password) return null;
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)];
    const s = checks.filter(Boolean).length;
    const colors = ["#ef4444", "#fb923c", "#facc15", "#48c96f"];
    const labels = ["Weak", "Fair", "Good", "Strong"];
    return (
        <div style={{ marginTop: "3px" }}>
            <div style={{ display: "flex", gap: "3px", marginBottom: "2px" }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ height: "2px", flex: 1, borderRadius: "99px", background: i < s ? colors[s - 1] : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                ))}
            </div>
            <p style={{ fontSize: "10px", fontWeight: 600, color: colors[s - 1] ?? "transparent", margin: 0 }}>{labels[s - 1] ?? ""}</p>
        </div>
    );
}

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
.reg-page { min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; background:#060f1e; padding:20px; position:relative; overflow:hidden; }
.reg-unified { animation:fadeSlideUp 0.5s ease both; display:flex; width:100%; max-width:820px; border-radius:24px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06); }
.reg-left { display:none; position:relative; width:400px; flex-shrink:0; overflow:hidden; }
.reg-right { flex:1; background:rgba(10,20,38,0.97); padding:28px 30px; display:flex; flex-direction:column; justify-content:center; }
.reg-submit:hover .reg-arrow { transform:translateX(4px); }
@media(min-width:768px) { .reg-left { display:flex !important; } }
@media(max-width:767px) {
    .reg-unified { flex-direction:column; max-width:440px; }
    .reg-mobile-header { display:flex !important; }
}
`;

export default function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error: apiError } = useSelector((state) => state.auth);

    const [form, setForm] = useState(INITIAL);
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const errors = {
        fullName: validators.fullName(form.fullName),
        username: validators.username(form.username),
        email: validators.email(form.email),
        phone: validators.phone(form.phone),
        password: validators.password(form.password),
        confirmPassword: validators.confirmPassword(form.confirmPassword, form),
    };
    const isFormValid = Object.values(errors).every(e => e === "");

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        dispatch(clearError());
    };
    const handleBlur = e => setTouched(p => ({ ...p, [e.target.name]: true }));

    const handleSubmit = async e => {
        e.preventDefault();
        setTouched({ fullName: true, username: true, email: true, phone: true, password: true, confirmPassword: true });
        if (!isFormValid) return;
        const result = await dispatch(registerAsync({
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            phone: form.phone.replace(/\s+/g, ""),
            password: form.password,
        }));
        if (registerAsync.fulfilled.match(result)) {
            setSuccess(true);
            setTimeout(() => navigate("/marketplace"), 1800);
        }
    };

    if (success) return (
        <div style={{ minHeight: "100vh", background: "#060f1e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ margin: "0 auto 24px", width: 80, height: 80, borderRadius: "50%", background: "rgba(72,201,111,0.15)", border: "2px solid rgba(72,201,111,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={38} color="#48c96f" strokeWidth={1.5} />
                </div>
                <h2 style={{ color: "#fff", fontSize: "26px", fontWeight: 900, margin: "0 0 8px" }}>Welcome aboard! 🎉</h2>
                <p style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>Your account is ready. Redirecting to marketplace...</p>
            </div>
        </div>
    );

    return (
        <>
            <style>{pageStyles}</style>
            <div className="reg-page">

                {/* Background ambient orbs */}
                <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                    <div style={{ position: "absolute", top: "-15%", left: "-8%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(72,201,111,0.08) 0%, transparent 70%)" }} />
                    <div style={{ position: "absolute", bottom: "-15%", right: "-8%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,164,196,0.06) 0%, transparent 70%)" }} />
                </div>

                {/* ══════ UNIFIED CARD ══════ */}
                <div className="reg-unified" style={{ position: "relative", zIndex: 1 }}>

                    {/* ── Left: Campus Image + Branding ── */}
                    <div className="reg-left">

                        {/* Background image */}
                        <img
                            src={campusBg}
                            alt=""
                            style={{
                                position: "absolute", inset: 0,
                                width: "100%", height: "100%",
                                objectFit: "cover", objectPosition: "center",
                            }}
                        />

                        {/* Dark overlay with brand gradient */}
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(180deg, rgba(6,15,30,0.75) 0%, rgba(6,15,30,0.55) 40%, rgba(6,15,30,0.7) 70%, rgba(6,15,30,0.92) 100%)",
                        }} />

                        {/* Green accent gradient at bottom */}
                        <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                            background: "linear-gradient(to top, rgba(72,201,111,0.15) 0%, transparent 100%)",
                        }} />

                        {/* Content */}
                        <div style={{
                            position: "relative", zIndex: 2,
                            display: "flex", flexDirection: "column",
                            justifyContent: "flex-start",
                            height: "100%", padding: "36px 32px",
                        }}>

                            {/* Top: Logo inline with brand name */}
                            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: "12px",
                                    background: "rgba(255,255,255,0.12)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                                }}>
                                    <img src={logo} alt="KX" style={{ width: 24, height: 24, objectFit: "contain" }} />
                                </div>
                                <span style={{ fontSize: "20px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                                    Kelani<span style={{ color: "#48c96f" }}>Xchange</span>
                                </span>
                            </Link>

                            {/* Center: Hero text */}
                            <div style={{ textAlign: "left", marginTop: "auto", marginBottom: "auto" }}>
                                <h1 style={{
                                    fontSize: "32px", fontWeight: 900, color: "#fff",
                                    lineHeight: 1.2, margin: "0 0 14px",
                                    letterSpacing: "-0.8px",
                                    textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                                }}>
                                    Your campus<br />marketplace
                                </h1>

                                <p style={{
                                    color: "rgba(255,255,255,0.7)", fontSize: "14px",
                                    lineHeight: 1.65, margin: "0 0 28px",
                                    maxWidth: "300px", fontWeight: 500,
                                    textShadow: "0 1px 8px rgba(0,0,0,0.3)",
                                }}>
                                    Trade textbooks, electronics, and more with fellow Kelaniya students you trust.
                                </p>

                                {/* Explore Marketplace Button */}
                                <Link
                                    to="/marketplace"
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        padding: "12px 28px", borderRadius: "12px",
                                        background: "#48c96f",
                                        color: "#0a192f", fontSize: "13px", fontWeight: 700,
                                        letterSpacing: "0.3px",
                                        textDecoration: "none",
                                        boxShadow: "0 4px 20px rgba(72,201,111,0.35)",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#5dd97f"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(72,201,111,0.45)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "#48c96f"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(72,201,111,0.35)"; }}
                                >
                                    <ShoppingBag size={15} />
                                    Explore Marketplace
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* ── Right: Form ── */}
                    <div className="reg-right">

                        {/* Mobile header (shown < 768px) */}
                        <div className="reg-mobile-header" style={{ display: "none", flexDirection: "column", alignItems: "center", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                                <img src={logo} alt="KX" style={{ width: 24, height: 24, objectFit: "contain" }} />
                                <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff" }}>Kelani<span style={{ color: "#48c96f" }}>Xchange</span></span>
                            </Link>
                        </div>

                        {/* Header */}
                        <div style={{ marginBottom: "18px" }}>
                            <h2 style={{ color: "#f8fafc", fontSize: "20px", fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.3px" }}>Create your account</h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "12.5px", fontWeight: 500 }}>
                                Already have an account?{" "}
                                <Link to="/login" style={{ color: "#48c96f", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
                            </p>
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px" }}>
                                <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                                <p style={{ color: "#fca5a5", fontSize: "12px", fontWeight: 500, margin: 0 }}>{apiError}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form id="register-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <InputField id="fullName" label="Full Name" icon={User} value={form.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} touched={touched.fullName} placeholder="Your name" autoComplete="name" />
                                <InputField id="username" label="Username" icon={AtSign} value={form.username} onChange={handleChange} onBlur={handleBlur} error={errors.username} touched={touched.username} placeholder="username" autoComplete="username" />
                            </div>

                            <InputField id="email" label="Email Address" type="email" icon={Mail} value={form.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} placeholder="you@example.com" autoComplete="email" />

                            <InputField id="phone" label="Phone Number" type="tel" icon={Phone} value={form.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} touched={touched.phone} placeholder="0771234567" autoComplete="tel" />

                            <div>
                                <InputField
                                    id="password" label="Password"
                                    type={showPassword ? "text" : "password"}
                                    icon={Lock} value={form.password}
                                    onChange={handleChange} onBlur={handleBlur}
                                    error={errors.password} touched={touched.password}
                                    placeholder="Min. 8 characters" autoComplete="new-password"
                                    rightSlot={
                                        <button type="button" onClick={() => setShowPassword(s => !s)} style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }} aria-label="Toggle password">
                                            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    }
                                />
                                <StrengthBar password={form.password} />
                            </div>

                            <InputField
                                id="confirmPassword" label="Confirm Password"
                                type={showConfirm ? "text" : "password"}
                                icon={Lock} value={form.confirmPassword}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.confirmPassword} touched={touched.confirmPassword}
                                placeholder="Re-enter password" autoComplete="new-password"
                                rightSlot={
                                    <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }} aria-label="Toggle confirm password">
                                        {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>
                                }
                            />

                            <p style={{ color: "#334155", fontSize: "10.5px", margin: "1px 0 0", lineHeight: 1.5 }}>
                                By signing up, you agree to our{" "}
                                <span style={{ color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Terms</span>{" "}and{" "}
                                <span style={{ color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>.
                            </p>

                            <button
                                id="register-submit-btn" type="submit" disabled={isLoading} className="reg-submit"
                                style={{
                                    width: "100%", background: "linear-gradient(135deg, #48c96f, #15945a)",
                                    border: "none", borderRadius: "11px", padding: "11px", color: "#fff",
                                    fontSize: "13px", fontWeight: 700,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.65 : 1,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    boxShadow: "0 4px 18px rgba(72,201,111,0.3)",
                                    transition: "all 0.25s", fontFamily: "inherit",
                                }}
                                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(72,201,111,0.4)"; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(72,201,111,0.3)"; }}
                            >
                                {isLoading ? (
                                    <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</>
                                ) : (
                                    <>Create Account <ArrowRight size={14} className="reg-arrow" style={{ transition: "transform 0.2s" }} /></>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            <span style={{ color: "#334155", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        </div>

                        <Link
                            to="/login"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12.5px", fontWeight: 600, textDecoration: "none", transition: "all 0.2s", background: "rgba(255,255,255,0.02)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#f1f5f9"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}
                        >
                            Sign in to existing account
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
