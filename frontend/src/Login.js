import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

/* ── Shared dark theme CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #070711; font-family: 'Inter','Segoe UI',sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background:#0a0a12; } ::-webkit-scrollbar-thumb { background:#7c4dff; border-radius:3px; }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(124,77,255,0.4);}50%{box-shadow:0 0 50px rgba(124,77,255,0.9);} }
  @keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(30px,-20px) scale(1.04);} }
  @keyframes spin { to{transform:rotate(360deg);} }
  .lg-fade { animation: fadeInUp 0.7s cubic-bezier(.16,1,.3,1) both; }
  .gradient-text {
    background: linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6);
    background-size:200% 200%; -webkit-background-clip:text;
    -webkit-text-fill-color:transparent; background-clip:text;
  }
  .dark-input {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:13px 16px; color:#e2e8f0; font-size:14px;
    outline:none; transition:border-color 0.25s, box-shadow 0.25s;
    font-family:'Inter',sans-serif;
  }
  .dark-input::placeholder { color:rgba(148,163,184,0.4); }
  .dark-input:focus { border-color:rgba(124,77,255,0.6); box-shadow:0 0 0 3px rgba(124,77,255,0.12); }
  .shimmer-btn {
    background: linear-gradient(135deg,#7c4dff,#3b82f6,#06b6d4);
    background-size:200% 200%;
    border:none; border-radius:100px; cursor:pointer; color:white;
    font-weight:700; font-family:'Inter',sans-serif;
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .shimmer-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 40px rgba(124,77,255,0.5); }
  .shimmer-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .role-badge {
    padding:4px 10px; border-radius:6px; font-size:9px;
    font-weight:800; letter-spacing:1.5px; text-transform:uppercase;
  }
`;

function Login({ onLogin }) {
    const API_BASE = "http://127.0.0.1:5000";
    const [creds, setCreds] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);

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

    return (
        <div style={{
            minHeight: "100vh", background: "#070711", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden",
            fontFamily: "'Inter',sans-serif"
        }}>
            <style>{CSS}</style>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            {/* Background orbs */}
            <div style={{
                position: "absolute", top: "-10%", left: "-10%", width: 500, height: 500,
                borderRadius: "50%", background: "radial-gradient(circle,rgba(124,77,255,0.15),transparent 70%)",
                animation: "orbFloat 10s ease-in-out infinite", pointerEvents: "none"
            }} />
            <div style={{
                position: "absolute", bottom: "-10%", right: "-5%", width: 400, height: 400,
                borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.12),transparent 70%)",
                animation: "orbFloat 13s ease-in-out infinite 2s", pointerEvents: "none"
            }} />

            {/* Particle dots */}
            {[...Array(20)].map((_, i) => (
                <div key={i} style={{
                    position: "absolute",
                    width: i % 3 === 0 ? 4 : 2, height: i % 3 === 0 ? 4 : 2, borderRadius: "50%",
                    background: ["#7c4dff", "#3b82f6", "#a78bfa", "#60a5fa"][i % 4],
                    top: `${8 + (i * 4.7) % 82}%`, left: `${5 + (i * 5.3) % 90}%`,
                    opacity: 0.3 + Math.random() * 0.4,
                    animation: `orbFloat ${3 + i * 0.4}s ease-in-out infinite alternate`, pointerEvents: "none",
                }} />
            ))}

            <div className="lg-fade" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                {/* Back link */}
                <Link to="/" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    color: "rgba(124,77,255,0.8)", fontSize: 13, fontWeight: 600, textDecoration: "none",
                    marginBottom: 28,
                    transition: "color 0.2s"
                }}
                    onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(124,77,255,0.8)"}>
                    ← Public Portal
                </Link>

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 900, color: "white", fontSize: 16,
                        boxShadow: "0 4px 20px rgba(124,77,255,0.5)",
                        animation: "pulseGlow 3s ease-in-out infinite"
                    }}>LG</div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
                            LoanGuard <span className="gradient-text">AI</span>
                        </div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                            color: "rgba(148,163,184,0.45)", marginTop: 2
                        }}>Admin MLOps Dashboard</div>
                    </div>
                </div>

                {/* Card */}
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 24, padding: 36,
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>Sign In</h2>
                    <p style={{ fontSize: 13, color: "rgba(148,163,184,0.55)", marginBottom: 28 }}>
                        Enter your organizational credentials.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                                color: "rgba(148,163,184,0.5)", display: "block", marginBottom: 8
                            }}>Username</label>
                            <input id="username" type="text"
                                value={creds.username}
                                onChange={e => setCreds({ ...creds, username: e.target.value })}
                                placeholder="sys_admin" required className="dark-input" />
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                                color: "rgba(148,163,184,0.5)", display: "block", marginBottom: 8
                            }}>Password</label>
                            <input id="password" type="password"
                                value={creds.password}
                                onChange={e => setCreds({ ...creds, password: e.target.value })}
                                placeholder="••••••••" required className="dark-input"
                                style={{ letterSpacing: 4, fontFamily: "monospace" }} />
                        </div>

                        <button type="submit" disabled={loading} className="shimmer-btn"
                            style={{ width: "100%", padding: "15px", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase" }}>
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                    <svg style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                                        <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : "🔐 Secure Login"}
                        </button>
                    </form>

                    {/* Role hints */}
                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                            color: "rgba(148,163,184,0.3)", textAlign: "center", marginBottom: 14
                        }}>
                            Dev Seed Credentials
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            {[
                                { role: "ADMIN", cred: "admin", pass: "password", bg: "rgba(124,77,255,0.1)", border: "rgba(124,77,255,0.2)", color: "#a78bfa" },
                                { role: "MANAGER", cred: "manager", pass: "manager123", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", color: "#60a5fa" },
                                { role: "OFFICER", cred: "officer", pass: "officer123", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", color: "#86efac" },
                            ].map(r => (
                                <div key={r.role} style={{
                                    background: r.bg, border: `1px solid ${r.border}`,
                                    borderRadius: 10, padding: "10px 8px", textAlign: "center"
                                }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: r.color, marginBottom: 4 }}>{r.role}</div>
                                    <div style={{ fontSize: 8.5, color: "rgba(148,163,184,0.5)", lineHeight: 1.6 }}>
                                        {r.cred}<br />{r.pass}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
