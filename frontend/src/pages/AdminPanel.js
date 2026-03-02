import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const ROLE_BADGE = {
    ADMIN: "bg-blue-50 text-blue-700",
    MANAGER: "bg-amber-50 text-amber-700",
    OFFICER: "bg-emerald-50 text-emerald-700",
};

export default function AdminPanel({ token }) {
    const [users, setUsers] = useState([]);
    const [audit, setAudit] = useState([]);
    const [modelInfo, setModelInfo] = useState(null);
    const [drift, setDrift] = useState(null);
    const [tab, setTab] = useState("users");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Retrain state
    const [retraining, setRetraining] = useState(false);
    const [retrainResult, setRetrainResult] = useState(null);
    const [retrainError, setRetrainError] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchUsers();
        fetchAudit();
        fetchModelInfo();
        fetchDrift();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/users`, { headers });
            setUsers(res.data.users || []);
        } catch (e) { setError(e.response?.data?.error || "Failed to load users"); }
    };

    const fetchAudit = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/audit`, { headers });
            setAudit(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    };

    const fetchModelInfo = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/model-info`, { headers });
            setModelInfo(res.data);
        } catch (e) { }
    };

    const fetchDrift = async () => {
        try {
            const res = await axios.get(`${API_BASE}/drift-status`, { headers });
            setDrift(res.data);
        } catch (e) { }
    };

    const handleRetrain = async () => {
        setRetraining(true);
        setRetrainResult(null);
        setRetrainError(null);
        try {
            const res = await axios.post(`${API_BASE}/admin/retrain`, {}, { headers });
            setRetrainResult(res.data);
            fetchModelInfo();
            fetchDrift();
            fetchAudit();
        } catch (e) {
            setRetrainError(e.response?.data?.error || "Retrain request failed");
        } finally {
            setRetraining(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                    Manage Users
                </h2>
                <div className="flex items-center gap-4">
                    <button className="btn-primary text-xs shadow-none">
                        + Add User
                    </button>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2">
                {[
                    { id: "users", label: "Users", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                    { id: "roles", label: "Roles", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
                    { id: "audit", label: "Audit Logs", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
                    { id: "model", label: "Model Settings", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg border transition-all ${tab === t.id
                            ? "bg-white border-slate-200 text-brand-dark shadow-sm"
                            : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 hover:text-brand-dark"
                            }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Content Windows */}
            <div className="premium-card overflow-hidden">
                {/* Users tab */}
                {tab === "users" && (
                    <div className="animate-fade-in flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <svg className="w-4 h-4 absolute left-3 top-1/2 -mt-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input type="text" placeholder="Search name or ID..." className="premium-input pl-9 py-2 text-xs bg-white w-56" />
                                </div>
                                <select className="premium-select py-2 text-xs w-36 bg-white">
                                    <option value="all">Report</option>
                                </select>
                                <select className="premium-select py-2 text-xs w-36 bg-white">
                                    <option value="all">Last Login</option>
                                </select>
                            </div>
                            <button className="btn-secondary py-2 text-xs flex items-center gap-2 px-4 shadow-sm border-slate-200">
                                Filters <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                        {error && <div className="px-6 py-4 text-red-500 text-xs bg-red-50 font-bold border-b border-red-100">{error}</div>}
                        <div className="overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Last Login</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={u.username}>
                                            <td className="text-slate-400 font-mono text-[10px]">#01{i + 1}</td>
                                            <td className="font-bold text-xs">{u.name}</td>
                                            <td className="text-slate-500 text-xs">{u.username}@loanguard.co</td>
                                            <td>
                                                <span className={`px-2.5 py-1 rounded inline-flex text-[10px] font-bold tracking-widest ${ROLE_BADGE[u.role] || ""}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="text-slate-500 text-xs font-mono">20-03-2026</td>
                                            <td><span className="badge badge-approved">Active</span></td>
                                            <td>
                                                <button className="text-[10px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan="7" className="text-center py-8 text-slate-400 text-xs">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Roles tab (mock) */}
                {tab === "roles" && (
                    <div className="animate-fade-in p-8 text-center bg-slate-50">
                        <p className="text-slate-500 text-sm">Role definitions are currently immutable and managed via configuration.</p>
                    </div>
                )}

                {/* Audit Log tab */}
                {tab === "audit" && (
                    <div className="animate-fade-in flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded border border-indigo-100 uppercase tracking-widest">
                                    🔒 Immutable Ledger
                                </span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="px-8 py-12 text-blue-400 text-sm font-bold text-center animate-pulse">Loading secure audit trail...</div>
                        ) : audit.length === 0 ? (
                            <div className="px-8 py-12 text-slate-400 text-xs text-center">
                                No audit entries yet. Perform some actions to populate the log.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Event</th>
                                            <th>User</th>
                                            <th>Details</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {audit.map((log) => (
                                            <tr key={log.id}>
                                                <td className="text-slate-400 font-mono text-[10px]">#{String(log.id).padStart(4, '0')}</td>
                                                <td>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${log.event_type === "LOGIN" ? "bg-slate-100 text-slate-600" :
                                                        log.event_type === "PREDICT" ? "bg-emerald-50 text-emerald-600" :
                                                            log.event_type === "RETRAIN" ? "bg-purple-50 text-purple-600" :
                                                                "bg-slate-50 text-slate-600"
                                                        }`}>
                                                        {log.event_type}
                                                    </span>
                                                </td>
                                                <td className="font-bold text-brand-dark">{log.username}</td>
                                                <td className="text-slate-500 font-mono text-[10px]">
                                                    {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                                                </td>
                                                <td className="text-slate-500 font-medium">
                                                    {new Date(log.created_at).toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Model Management Tab */}
                {tab === "model" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 animate-fade-in bg-slate-50">
                        {/* Model Info Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h3 className="font-bold text-base text-brand-dark mb-1 flex items-center gap-2">🧠 Current ML Model</h3>
                            <p className="text-xs text-slate-500 mb-6">Production serving model metadata and health.</p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Version</span>
                                    <span className="text-xs font-black text-brand-blue font-mono">v{modelInfo?.version || "1.0.0"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trained On</span>
                                    <span className="text-xs font-bold text-brand-dark">{modelInfo?.trained_at || "Unknown"}</span>
                                </div>
                                {modelInfo?.accuracy && (
                                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Baseline Accuracy</span>
                                        <span className="text-xs font-black text-emerald-700">{(modelInfo.accuracy * 100).toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>

                            {drift && drift.accuracy_7d && (
                                <div className="mt-6 border-t border-slate-100 pt-5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Drift Monitor (7-Day Avg)</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 rounded-full ${drift.drift_detected ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${(drift.accuracy_7d * 100).toFixed(0)}%` }} />
                                        </div>
                                        <span className="text-xs font-black text-slate-700">{(drift.accuracy_7d * 100).toFixed(1)}%</span>
                                    </div>
                                    {drift.drift_detected && (
                                        <p className="text-[10px] font-bold text-red-500 mt-3 bg-red-50 p-2 rounded uppercase tracking-widest animate-pulse border border-red-100">⚠️ Model degradation detected. Retrain recommended.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Retrain Action Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h3 className="font-bold text-base text-brand-dark mb-1 flex items-center gap-2">🔁 Automated Retraining</h3>
                            <p className="text-xs text-slate-500 mb-6">Trigger a pipeline to drop/rebuild the model.</p>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 relative overflow-hidden">
                                <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">What happens?</h4>
                                <ul className="text-[10px] text-blue-800 space-y-2 font-medium">
                                    <li className="flex gap-2"><span>1.</span> Pulls latest 10k approved/rejected apps from PG</li>
                                    <li className="flex gap-2"><span>2.</span> Fits new RandomForest with hyperparameter tuning</li>
                                    <li className="flex gap-2"><span>3.</span> Validates F1/Accuracy meets baseline &gt; 80%</li>
                                    <li className="flex gap-2"><span>4.</span> Hot-swaps model in memory without downtime</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleRetrain}
                                disabled={retraining}
                                className={`w-full py-3 rounded-lg text-xs transition-all uppercase tracking-widest font-bold flex items-center justify-center gap-2 ${retraining ? "bg-slate-200 text-slate-500 cursor-not-allowed" :
                                    drift?.drift_detected ? "bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-md" :
                                        "bg-brand-dark text-white hover:bg-slate-800 shadow-sm"
                                    }`}
                            >
                                {retraining ? (
                                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Running Pipeline...</>
                                ) : drift?.drift_detected ? "⚠️ Force Retrain Now" : "Commit Retrain Pipeline"}
                            </button>

                            {retrainError && (
                                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-[10px] font-bold">
                                    ❌ {retrainError}
                                </div>
                            )}

                            {retrainResult && (
                                <div className={`mt-4 rounded-lg border p-4 space-y-3 animate-slide-up ${retrainResult.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                                    <p className={`font-bold text-[10px] uppercase tracking-widest ${retrainResult.success ? "text-emerald-700" : "text-red-600"}`}>
                                        {retrainResult.success ? "✅ Pipeline Completed" : "❌ Pipeline Failed"}
                                    </p>
                                    {retrainResult.accuracy != null && (
                                        <div className="flex gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Accuracy</p>
                                                <p className="text-lg font-black text-emerald-600">{(retrainResult.accuracy * 100).toFixed(1)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New F1 Score</p>
                                                <p className="text-lg font-black text-emerald-600">{(retrainResult.f1 * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
