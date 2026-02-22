import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
            toast.success("✅ Logged in successfully!");
        } catch (err) {
            toast.error("❌ " + (err.response?.data?.error || "Login failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">LoanGuard</h1>
                    <p className="text-indigo-300 text-sm mt-1">MLOps Dashboard — Secure Access</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Sign in to continue</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-2">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={creds.username}
                                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                                placeholder="admin"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-2">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={creds.password}
                                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-xl hover:from-indigo-500 hover:to-blue-500 transition-all shadow-xl uppercase tracking-widest mt-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 active:scale-95"}`}
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>
                    <p className="text-white/30 text-[10px] text-center mt-6 uppercase tracking-widest">
                        Default: admin / password
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
