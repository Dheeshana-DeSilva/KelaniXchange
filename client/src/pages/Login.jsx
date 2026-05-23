import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
    Mail, Lock, Eye, EyeOff, ArrowRight,
    AlertCircle, Loader2, ShoppingBag,
} from "lucide-react";
import { loginAsync, clearError } from "../features/auth/authSlice";
import logo from "../assets/X_logo.png";
import campusBg from "../assets/register_illustration.png";

/* ── validation ── */
const validators = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address",
    password: (v) => v.length >= 1 ? "" : "Password is required",
};

const INITIAL = { email: "", password: "" };

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
                {rightSlot && (
                    <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                        {rightSlot}
                    </span>
                )}
            </div>
            {touched && error && (
                <p style={{ fontSize: "10.5px", color: "#f87171", display: "flex", alignItems: "center", gap: "4px", margin: 0 }}>
                    <AlertCircle size={10} /> {error}
                </p>
            )}
        </div>
    );
}

const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse-ring { 0%{transform:scale(0.9);opacity:0.7} 50%{transform:scale(1.05);opacity:1} 100%{transform:scale(0.9);opacity:0.7} }
.login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; background:#060f1e; padding:20px; position:relative; overflow:hidden; }
.login-unified { animation:fadeSlideUp 0.5s ease both; display:flex; width:100%; max-width:820px; border-radius:24px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06); }
.login-left { display:none; position:relative; width:400px; flex-shrink:0; overflow:hidden; }
.login-right { flex:1; background:rgba(10,20,38,0.97); padding:36px 34px; display:flex; flex-direction:column; justify-content:center; }
.login-submit:hover .login-arrow { transform:translateX(4px); }
@media(min-width:768px) { .login-left { display:flex !important; } }
@media(max-width:767px) {
    .login-unified { flex-direction:column; max-width:440px; }
    .login-mobile-header { display:flex !important; }
}
`;

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error: apiError } = useSelector((state) => state.auth);

    const [form, setForm] = useState(INITIAL);
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const errors = {
        email: validators.email(form.email),
        password: validators.password(form.password),
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
        setTouched({ email: true, password: true });
        if (!isFormValid) return;
        const result = await dispatch(loginAsync({ email: form.email, password: form.password }));
        if (loginAsync.fulfilled.match(result)) {
            const loggedInUser = result.payload?.user;
            if (loggedInUser?.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        }
    };

    return (
        <>
            <style>{pageStyles}</style>
            <div className="login-page">

                {/* Background ambient orbs */}
                <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                    <div style={{ position: "absolute", top: "-15%", right: "-8%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(72,201,111,0.07) 0%, transparent 70%)" }} />
                    <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,164,196,0.05) 0%, transparent 70%)" }} />
                </div>

                {/* ══════ UNIFIED CARD ══════ */}
                <div className="login-unified" style={{ position: "relative", zIndex: 1 }}>

                    {/* ── Left: Campus Image + Branding ── */}
                    <div className="login-left">

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
                            justifyContent: "space-between",
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
                            <div style={{ textAlign: "left" }}>
                                <h1 style={{
                                    fontSize: "32px", fontWeight: 900, color: "#fff",
                                    lineHeight: 1.2, margin: "0 0 14px",
                                    letterSpacing: "-0.8px",
                                    textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                                }}>
                                    Welcome<br />back
                                </h1>

                                <p style={{
                                    color: "rgba(255,255,255,0.7)", fontSize: "14px",
                                    lineHeight: 1.65, margin: "0 0 28px",
                                    maxWidth: "300px", fontWeight: 500,
                                    textShadow: "0 1px 8px rgba(0,0,0,0.3)",
                                }}>
                                    Sign in to continue trading with fellow Kelaniya students you trust.
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

                            {/* Bottom: Subtle trust line */}
                            <p style={{
                                color: "rgba(255,255,255,0.4)", fontSize: "11px",
                                fontWeight: 600, margin: 0,
                                letterSpacing: "0.5px",
                            }}>
                                Trusted by 5,000+ Kelaniya students
                            </p>
                        </div>
                    </div>

                    {/* ── Right: Form ── */}
                    <div className="login-right">

                        {/* Mobile header (shown < 768px) */}
                        <div className="login-mobile-header" style={{ display: "none", flexDirection: "column", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                                <img src={logo} alt="KX" style={{ width: 24, height: 24, objectFit: "contain" }} />
                                <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff" }}>Kelani<span style={{ color: "#48c96f" }}>Xchange</span></span>
                            </Link>
                        </div>

                        {/* Header */}
                        <div style={{ marginBottom: "26px" }}>
                            <h2 style={{ color: "#f8fafc", fontSize: "22px", fontWeight: 900, margin: "0 0 5px", letterSpacing: "-0.4px" }}>Sign in to your account</h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "12.5px", fontWeight: 500 }}>
                                Don't have an account?{" "}
                                <Link to="/register" style={{ color: "#48c96f", fontWeight: 700, textDecoration: "none" }}>Create one</Link>
                            </p>
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 13px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px" }}>
                                <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                                <p style={{ color: "#fca5a5", fontSize: "12px", fontWeight: 500, margin: 0 }}>{apiError}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form id="login-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "13px" }}>

                            <InputField
                                id="email" label="Email Address" type="email"
                                icon={Mail} value={form.email}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.email} touched={touched.email}
                                placeholder="you@example.com" autoComplete="email"
                            />

                            <div>
                                <InputField
                                    id="password" label="Password"
                                    type={showPassword ? "text" : "password"}
                                    icon={Lock} value={form.password}
                                    onChange={handleChange} onBlur={handleBlur}
                                    error={errors.password} touched={touched.password}
                                    placeholder="Enter your password" autoComplete="current-password"
                                    rightSlot={
                                        <button type="button" onClick={() => setShowPassword(s => !s)} style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }} aria-label="Toggle password visibility">
                                            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    }
                                />
                                {/* Forgot password */}
                                <div style={{ textAlign: "right", marginTop: "6px" }}>
                                    <span
                                        style={{ fontSize: "11.5px", color: "#48c96f", fontWeight: 600, cursor: "pointer" }}
                                        onClick={() => {/* TODO: forgot password flow */}}
                                    >
                                        Forgot password?
                                    </span>
                                </div>
                            </div>

                            <button
                                id="login-submit-btn" type="submit" disabled={isLoading} className="login-submit"
                                style={{
                                    width: "100%", background: "linear-gradient(135deg, #48c96f, #15945a)",
                                    border: "none", borderRadius: "11px", padding: "12px", color: "#fff",
                                    fontSize: "13px", fontWeight: 700,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.65 : 1,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    boxShadow: "0 4px 18px rgba(72,201,111,0.3)",
                                    transition: "all 0.25s", fontFamily: "inherit",
                                    marginTop: "4px",
                                }}
                                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(72,201,111,0.4)"; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(72,201,111,0.3)"; }}
                            >
                                {isLoading ? (
                                    <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</>
                                ) : (
                                    <>Sign In <ArrowRight size={14} className="login-arrow" style={{ transition: "transform 0.2s" }} /></>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            <span style={{ color: "#334155", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
                            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        </div>

                        <Link
                            to="/register"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box", padding: "11px", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12.5px", fontWeight: 600, textDecoration: "none", transition: "all 0.2s", background: "rgba(255,255,255,0.02)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#f1f5f9"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}
                        >
                            Create a new account
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}