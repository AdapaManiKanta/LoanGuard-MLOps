import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

/* ─ minimal canvas particle helper ─ */
function ParticleBg({ canvasRef }) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let raf;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener("resize", resize);

        const PTS = Array.from({ length: 55 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.8 + 0.5,
            color: ["rgba(124,77,255,", "rgba(59,130,246,", "rgba(167,139,250,"][Math.floor(Math.random() * 3)],
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            PTS.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + "0.6)"; ctx.fill();
            });
            PTS.forEach((a, i) => PTS.slice(i + 1).forEach(b => {
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 110) {
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(124,77,255,${(1 - d / 110) * 0.12})`; ctx.stroke();
                }
            }));
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
    }, [canvasRef]);
    return null;
}

/* ── shared CSS injected once ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  body { background:#070711; font-family:'Inter',sans-serif; }
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0a0a12;} ::-webkit-scrollbar-thumb{background:#7c4dff;border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes shimmer{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(124,77,255,0.3);}50%{box-shadow:0 0 45px rgba(124,77,255,0.7);}}
  @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
  .fade-up{animation:fadeUp 0.7s cubic-bezier(.16,1,.3,1) both;}
  .gradient-text{
    background:linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6);
    background-size:300% 300%; animation:shimmer 4s ease infinite;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .login-input{
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:12px; padding:13px 16px; color:#e2e8f0; font-size:14px;
    outline:none; transition:border-color 0.25s, box-shadow 0.25s; font-family:'Inter',sans-serif;
  }
  .login-input::placeholder{color:rgba(148,163,184,0.3);}
  .login-input:focus{border-color:rgba(124,77,255,0.6); box-shadow:0 0 0 3px rgba(124,77,255,0.1);}
  .login-btn{
    width:100%; padding:15px 0; border:none; border-radius:12px;
    background:linear-gradient(135deg,#7c4dff,#3b82f6,#06b6d4);
    background-size:200% 200%; animation:shimmer 4s ease infinite;
    color:white; font-weight:800; font-size:14px; letter-spacing:0.5px;
    cursor:pointer; font-family:'Inter',sans-serif;
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .login-btn:hover:not(:disabled){transform:translateY(-2px); box-shadow:0 12px 40px rgba(124,77,255,0.5);}
  .login-btn:disabled{opacity:0.5; cursor:not-allowed; animation:none;}
  .feature-pill{
    display:flex; align-items:center; gap:10px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
    border-radius:12px; padding:10px 14px; font-size:13px; color:rgba(148,163,184,0.8);
    transition:all 0.2s;
  }
  .feature-pill:hover{background:rgba(124,77,255,0.08); border-color:rgba(124,77,255,0.2);}
`;

function Login({ onLogin }) {
    const API_BASE = "http://127.0.0.1:5000";
    const [creds, setCreds] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const canvasRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/login`, creds);
            const token = res.data.token;
            localStorage.setItem("lg_token", token);
            onLogin(token);
            toast.success("✅ Welcome back!");
        } catch (err) {
            toast.error("❌ " + (err.response?.data?.error || "Login failed"));
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: "⚡", label: "Sub-second AI decision engine" },
        { icon: "🛡️", label: "Fraud detection & compliance" },
        { icon: "📊", label: "Real-time analytics dashboard" },
        { icon: "🔒", label: "Role-based access control" },
        { icon: "📄", label: "Automated PDF report generation" },
    ];

    return (
        <div style={{
            minHeight: "100vh", display: "flex", background: "#070711",
            fontFamily: "'Inter',sans-serif", color: "#e2e8f0", overflow: "hidden",
        }}>
            <style>{CSS}</style>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            {/* ── LEFT PANEL ── */}
            <div style={{
                flex: "0 0 55%", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg,#0d0d1a 0%,#100d20 60%,#0a0d1a 100%)",
                display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px",
            }}>
                {/* Particle canvas */}
                <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                <ParticleBg canvasRef={canvasRef} />

                {/* Gradient orbs */}
                <div style={{
                    position: "absolute", top: "-10%", left: "-5%", width: 400, height: 400,
                    borderRadius: "50%", background: "radial-gradient(circle,rgba(124,77,255,0.18),transparent 70%)",
                    pointerEvents: "none"
                }} />
                <div style={{
                    position: "absolute", bottom: "-8%", right: "-5%", width: 350, height: 350,
                    borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.12),transparent 70%)",
                    pointerEvents: "none"
                }} />

                {/* Content */}
                <div style={{ position: "relative", zIndex: 2 }} className="fade-up">
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 900, color: "white", fontSize: 18,
                            animation: "glow 3s ease-in-out infinite",
                        }}>LG</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1 }}>
                                LoanGuard <span className="gradient-text">AI</span>
                            </div>
                            <div style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
                                textTransform: "uppercase", color: "rgba(148,163,184,0.35)", marginTop: 3
                            }}>
                                MLOps Platform
                            </div>
                        </div>
                    </div>

                    {/* Hero copy */}
                    <div style={{ marginBottom: 48 }}>
                        <h1 style={{
                            fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900,
                            letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 16,
                        }}>
                            Smarter Decisions.<br />
                            <span className="gradient-text">Powered by AI.</span>
                        </h1>
                        <p style={{ fontSize: 15, color: "rgba(148,163,184,0.6)", lineHeight: 1.7, maxWidth: 380 }}>
                            Enterprise-grade loan risk assessment. Predict defaults, detect fraud,
                            and generate compliance reports — all in under a second.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {features.map((f, i) => (
                            <div key={i} className="feature-pill fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                                <span style={{ fontSize: 16 }}>{f.icon}</span>
                                <span>{f.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div style={{
                        display: "flex", gap: 32, marginTop: 44, paddingTop: 32,
                        borderTop: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        {[
                            { num: "98.4%", label: "Model Accuracy" },
                            { num: "< 200ms", label: "Inference Time" },
                            { num: "SOC-2", label: "Compliant" },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{
                                    fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif",
                                    background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                                }}>
                                    {s.num}
                                </div>
                                <div style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                                    color: "rgba(148,163,184,0.35)", marginTop: 4
                                }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{
                flex: "0 0 45%", display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center",
                padding: "48px 60px", background: "rgba(10,10,20,0.97)",
                borderLeft: "1px solid rgba(255,255,255,0.05)",
                position: "relative",
            }}>
                {/* Back link */}
                <div style={{ position: "absolute", top: 28, left: 32 }}>
                    <Link to="/" style={{
                        display: "flex", alignItems: "center", gap: 8,
                        color: "rgba(148,163,184,0.4)", fontSize: 12, fontWeight: 600, textDecoration: "none",
                        transition: "color 0.2s"
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.4)"}>
                        ← Public Portal
                    </Link>
                </div>

                <div style={{ width: "100%", maxWidth: 360 }} className="fade-up">
                    {/* Heading */}
                    <div style={{ marginBottom: 36 }}>
                        <div style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase",
                            color: "rgba(124,77,255,0.7)", marginBottom: 12,
                            display: "flex", alignItems: "center", gap: 8
                        }}>
                            <span style={{ width: 20, height: 1, background: "rgba(124,77,255,0.5)", display: "inline-block" }} />
                            Secure Access
                            <span style={{ width: 20, height: 1, background: "rgba(124,77,255,0.5)", display: "inline-block" }} />
                        </div>
                        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", marginBottom: 8 }}>
                            Welcome back
                        </h2>
                        <p style={{ fontSize: 13, color: "rgba(148,163,184,0.45)" }}>
                            Sign in to your LoanGuard AI workspace
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                                color: "rgba(148,163,184,0.45)", display: "block", marginBottom: 9
                            }}>
                                Username
                            </label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                                    fontSize: 15, pointerEvents: "none", opacity: 0.4
                                }}>👤</span>
                                <input id="username" type="text" className="login-input"
                                    style={{ paddingLeft: 40 }}
                                    value={creds.username}
                                    onChange={e => setCreds({ ...creds, username: e.target.value })}
                                    placeholder="Enter your username" required autoComplete="username" />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                                <label style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                                    color: "rgba(148,163,184,0.45)"
                                }}>Password</label>
                            </div>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                                    fontSize: 15, pointerEvents: "none", opacity: 0.4
                                }}>🔑</span>
                                <input id="password" type={showPwd ? "text" : "password"} className="login-input"
                                    style={{ paddingLeft: 40, paddingRight: 44 }}
                                    value={creds.password}
                                    onChange={e => setCreds({ ...creds, password: e.target.value })}
                                    placeholder="Enter your password" required autoComplete="current-password" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    style={{
                                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "rgba(148,163,184,0.4)", fontSize: 14, padding: 2
                                    }}>
                                    {showPwd ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                    <span style={{
                                        width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                                        borderTop: "2px solid white", borderRadius: "50%",
                                        animation: "spin 1s linear infinite", display: "inline-block"
                                    }} />
                                    Authenticating...
                                </span>
                            ) : "🔐 Sign In to Dashboard"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.25)", fontWeight: 700, letterSpacing: 1 }}>
                            DEFAULT CREDENTIALS
                        </span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                    </div>

                    {/* Seed creds */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[
                            { role: "ADMIN", cred: "admin", pass: "password", bg: "rgba(124,77,255,0.1)", border: "rgba(124,77,255,0.2)", color: "#a78bfa" },
                            { role: "MANAGER", cred: "manager", pass: "manager123", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", color: "#60a5fa" },
                            { role: "OFFICER", cred: "officer", pass: "officer123", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.18)", color: "#86efac" },
                        ].map(r => (
                            <button key={r.role} type="button"
                                onClick={() => setCreds({ username: r.cred, password: r.pass })}
                                style={{
                                    background: r.bg, border: `1px solid ${r.border}`, borderRadius: 10,
                                    padding: "10px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
                                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: r.color, marginBottom: 4 }}>
                                    {r.role}
                                </div>
                                <div style={{ fontSize: 8, color: "rgba(148,163,184,0.4)", lineHeight: 1.6 }}>
                                    {r.cred}<br />{r.pass}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p style={{
                    position: "absolute", bottom: 20, fontSize: 10,
                    color: "rgba(148,163,184,0.2)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase"
                }}>
                    LoanGuard AI — Secure MLOps Platform
                </p>
            </div>
        </div>
    );
}

export default Login;
