import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="w-full max-w-md relative animate-scale-in">
                {/* Back link */}
                <Link to="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-semibold transition-colors mb-8">
                    ← Back to Home
                </Link>

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl mb-5 shadow-xl shadow-blue-200 animate-pulse-ring">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-blue-900 tracking-tight">LoanGuard</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">MLOps Dashboard — Secure Access</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-blue-100 border border-blue-100">
                    <h2 className="text-2xl font-black text-blue-900 mb-1">Sign In</h2>
                    <p className="text-slate-400 text-sm mb-8">Enter your credentials to access the dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="animate-fade-in-up delay-100">
                            <label className="text-xs font-bold text-blue-700 uppercase tracking-widest block mb-2">Username</label>
                            <input
                                id="username" type="text"
                                value={creds.username}
                                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                                placeholder="e.g. admin"
                                required
                                className="input-glow w-full rounded-xl px-4 py-3.5 text-sm font-medium"
                            />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <label className="text-xs font-bold text-blue-700 uppercase tracking-widest block mb-2">Password</label>
                            <input
                                id="password" type="password"
                                value={creds.password}
                                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                className="input-glow w-full rounded-xl px-4 py-3.5 text-sm font-medium"
                            />
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-glow animate-fade-in-up delay-300 w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest mt-2 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Authenticating...
                                </>
                            ) : "Sign In →"}
                        </button>
                    </form>

                    {/* Role hints */}
                    <div className="mt-8 pt-6 border-t border-blue-50">
                        <p className="text-slate-300 text-[10px] text-center uppercase tracking-widest mb-3">Demo Accounts</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { role: "ADMIN", cred: "admin / password", color: "text-red-600 bg-red-50 border-red-100" },
                                { role: "MANAGER", cred: "manager / manager123", color: "text-blue-600 bg-blue-50 border-blue-100" },
                                { role: "OFFICER", cred: "officer / officer123", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                            ].map(r => (
                                <div key={r.role} className={`rounded-xl px-2 py-2 border text-[9px] font-bold ${r.color}`}>
                                    <div className="mb-0.5">{r.role}</div>
                                    <div className="font-normal opacity-70 break-all">{r.cred}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-slate-400 text-center text-xs mt-6">
                    Looking to check eligibility?{" "}
                    <Link to="/check" className="text-blue-600 hover:text-blue-800 transition-colors font-semibold">
                        No login required →
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
