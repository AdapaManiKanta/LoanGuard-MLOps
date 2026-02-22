import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const ROLE_BADGE = {
    ADMIN: "bg-red-100 text-red-700 border border-red-200",
    MANAGER: "bg-blue-100 text-blue-700 border border-blue-200",
    OFFICER: "bg-emerald-100 text-emerald-700 border border-emerald-200",
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
            fetchModelInfo(); // Refresh model info after retraining
            fetchDrift();     // Refresh drift after retraining
            fetchAudit();     // Refresh audit log to show the RETRAIN event
        } catch (e) {
            setRetrainError(e.response?.data?.error || "Retrain request failed");
        } finally {
            setRetraining(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-blue-900 mb-1 flex items-center gap-2">
                        <span>⚙️</span> Admin Panel
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Manage users, security audits, and ML models.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Serving</p>
                        <p className="text-sm font-black text-emerald-600 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            ONLINE
                        </p>
                    </div>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-px">
                {[
                    { id: "users", label: "👥 Users & Roles" },
                    { id: "audit", label: "🗒️ Audit Log" },
                    { id: "model", label: "🧠 Model Management" },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-6 py-3 text-sm font-bold rounded-t-2xl transition-all border-t border-l border-r ${tab === t.id
                            ? "bg-white border-blue-100 text-blue-700 shadow-sm relative top-px"
                            : "bg-transparent border-transparent text-slate-400 hover:text-blue-600 hover:bg-white/50"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Users tab */}
            {tab === "users" && (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50 animate-fade-in">
                    <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-blue-900">System Users</h3>
                        <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-200">
                            {users.length} users
                        </span>
                    </div>
                    {error && <div className="px-8 py-4 text-red-500 text-sm bg-red-50 font-medium">{error}</div>}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Username</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Access Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((u) => (
                                    <tr key={u.username} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-blue-900 font-mono text-xs font-bold">{u.username}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium text-sm">{u.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${ROLE_BADGE[u.role] || ""}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                                            {u.role === "ADMIN" && "Full System Access"}
                                            {u.role === "MANAGER" && "Analytics, Batch & Reports"}
                                            {u.role === "OFFICER" && "Predict & View Allowed"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Audit Log tab */}
            {tab === "audit" && (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50 animate-fade-in">
                    <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-blue-900">Security Audit Log</h3>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg uppercase tracking-widest">
                            🔒 Append-only / Immutable
                        </span>
                    </div>
                    {loading ? (
                        <div className="px-8 py-12 text-blue-400 text-sm font-bold text-center animate-pulse">Loading secure audit trail...</div>
                    ) : audit.length === 0 ? (
                        <div className="px-8 py-12 text-slate-400 text-sm text-center">
                            No audit entries yet. Perform some actions to populate the log.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Event</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">User</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Details</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs">
                                    {audit.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-slate-400 font-mono">#{log.id.toString().padStart(4, '0')}</td>
                                            <td className="px-6 py-3">
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md border tracking-widest ${log.event_type === "LOGIN" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                    log.event_type === "PREDICT" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                        log.event_type === "RETRAIN" ? "bg-purple-50 text-purple-600 border-purple-200" :
                                                            "bg-slate-50 text-slate-600 border-slate-200"
                                                    }`}>
                                                    {log.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-blue-900 font-bold">{log.username}</td>
                                            <td className="px-6 py-3 text-slate-500 font-mono">
                                                {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                                            </td>
                                            <td className="px-6 py-3 text-slate-400 font-medium">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">

                    {/* Model Info Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 flex flex-col justify-between">
                        <div>
                            <h3 className="font-black text-lg text-blue-900 mb-1 flex items-center gap-2">🧠 Current ML Model</h3>
                            <p className="text-xs font-medium text-slate-500 mb-6">Production serving model metadata and health.</p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Version</span>
                                    <span className="text-sm font-black text-blue-700 font-mono">v{modelInfo?.version || "1.0.0"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trained On</span>
                                    <span className="text-sm font-black text-slate-700">{modelInfo?.trained_at || "Unknown"}</span>
                                </div>
                                {modelInfo?.accuracy && (
                                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Baseline Accuracy</span>
                                        <span className="text-sm font-black text-emerald-700">{(modelInfo.accuracy * 100).toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {drift && drift.accuracy_7d && (
                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Drift Monitor (7-Day Avg)</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                        <div className={`h-full transition-all duration-1000 rounded-full ${drift.drift_detected ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${(drift.accuracy_7d * 100).toFixed(0)}%` }} />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">{(drift.accuracy_7d * 100).toFixed(1)}%</span>
                                </div>
                                {drift.drift_detected && (
                                    <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-widest animate-pulse">⚠️ Model degradation detected. Retrain recommended.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Retrain Action Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-50">
                        <h3 className="font-black text-lg text-blue-900 mb-1 flex items-center gap-2">🔁 Automated Retraining</h3>
                        <p className="text-xs font-medium text-slate-500 mb-6">Trigger a pipeline to drop/rebuild the model with the latest curated DB applications.</p>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-bl-full pointer-events-none" />
                            <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">What happens?</h4>
                            <ul className="text-xs text-blue-800 space-y-2 font-medium">
                                <li className="flex gap-2"><span>1.</span> Pulls latest 10k approved/rejected apps from PG</li>
                                <li className="flex gap-2"><span>2.</span> Fits new RandomForest with hyperparameter tuning</li>
                                <li className="flex gap-2"><span>3.</span> Validates F1/Accuracy meets baseline &gt; 80%</li>
                                <li className="flex gap-2"><span>4.</span> Hot-swaps model in memory without downtime</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleRetrain}
                            disabled={retraining}
                            className={`w-full btn-glow text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${retraining ? "bg-slate-400 cursor-not-allowed shadow-none" :
                                drift?.drift_detected ? "bg-gradient-to-r from-red-600 to-amber-500 shadow-red-200 animate-pulse" :
                                    "bg-gradient-to-r from-blue-700 to-blue-500 shadow-blue-200"
                                }`}
                        >
                            {retraining ? (
                                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Running Pipeline...</>
                            ) : drift?.drift_detected ? "⚠️ Force Retrain Now" : "Commit Retrain Pipeline"}
                        </button>

                        {retrainError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-xs font-bold animate-shake">
                                ❌ {retrainError}
                            </div>
                        )}

                        {retrainResult && (
                            <div className={`mt-4 rounded-xl border p-4 space-y-3 animate-slide-up ${retrainResult.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                                <p className={`font-bold text-sm ${retrainResult.success ? "text-emerald-700" : "text-red-600"}`}>
                                    {retrainResult.success ? "✅ Pipeline Completed Successfully" : "❌ Pipeline Failed"}
                                </p>
                                {retrainResult.accuracy != null && (
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Accuracy</p>
                                            <p className="text-xl font-black text-emerald-600">{(retrainResult.accuracy * 100).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New F1 Score</p>
                                            <p className="text-xl font-black text-emerald-600">{(retrainResult.f1 * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
