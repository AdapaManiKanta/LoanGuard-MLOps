import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

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
        <div className="min-h-screen bg-brand-light font-sans text-brand-textMain flex items-center justify-center p-4 relative overflow-hidden">
            <ToastContainer position="top-right" autoClose={3000} theme="light" />

            <div className="w-full max-w-[400px] relative animate-scale-in">
                {/* Back link */}
                <Link to="/" className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-800 text-xs font-bold transition-colors mb-6">
                    ← Public Portal
                </Link>

                {/* Logo */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue rounded-lg border border-blue-400 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                        LG
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-brand-dark tracking-tight leading-none">LoanGuard</h1>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Admin MLOps Dashboard</p>
                    </div>
                </div>

                {/* Card */}
                <div className="premium-card p-8">
                    <h2 className="text-xl font-bold text-brand-dark mb-1">Sign In</h2>
                    <p className="text-slate-400 text-xs mb-6">Enter your organizational credentials.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="animate-fade-in-up delay-100">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Username</label>
                            <input
                                id="username" type="text"
                                value={creds.username}
                                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                                placeholder="sys_admin"
                                required
                                className="premium-input bg-slate-50 text-sm"
                            />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
                            <input
                                id="password" type="password"
                                value={creds.password}
                                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                className="premium-input bg-slate-50 text-sm tracking-widest font-mono"
                            />
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full py-4 text-xs mt-2 flex items-center justify-center gap-2 uppercase tracking-widest">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Authenticating
                                </>
                            ) : "Secure Login"}
                        </button>
                    </form>

                    {/* Role hints */}
                    <div className="mt-8 pt-5 border-t border-slate-100">
                        <p className="text-slate-400 text-[9px] text-center uppercase tracking-widest mb-3">Dev Seed Credentials</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { role: "ADMIN", cred: "admin", pass: "password", color: "text-blue-600 bg-blue-50 border-blue-100" },
                                { role: "MANAGER", cred: "manager", pass: "manager123", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                                { role: "OFFICER", cred: "officer", pass: "officer123", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                            ].map(r => (
                                <div key={r.role} className={`rounded p-2 border text-[9px] font-bold ${r.color}`}>
                                    <div className="mb-1 uppercase">{r.role}</div>
                                    <div className="font-normal opacity-80 break-all">{r.cred} / {r.pass}</div>
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
