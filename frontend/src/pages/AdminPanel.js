import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const ROLE_BADGE = {
    ADMIN: "bg-red-500/20 text-red-300 border border-red-500/30",
    MANAGER: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    OFFICER: "bg-green-500/20 text-green-300 border border-green-500/30",
};

export default function AdminPanel({ token }) {
    const [users, setUsers] = useState([]);
    const [audit, setAudit] = useState([]);
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
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/users`, { headers });
            setUsers(res.data.users || []);
        } catch (e) {
            setError(e.response?.data?.error || "Failed to load users");
        }
    };

    const fetchAudit = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/audit`, { headers });
            setAudit(res.data || []);
        } catch (e) {
            // non-fatal — audit table may not exist yet
        } finally {
            setLoading(false);
        }
    };

    const handleRetrain = async () => {
        setRetraining(true);
        setRetrainResult(null);
        setRetrainError(null);
        try {
            const res = await axios.post(`${API_BASE}/admin/retrain`, {}, { headers });
            setRetrainResult(res.data);
        } catch (e) {
            setRetrainError(e.response?.data?.error || "Retrain request failed");
        } finally {
            setRetraining(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">⚙️ Admin Panel</h2>
                <p className="text-gray-500 text-sm">Manage users and review the immutable audit trail.</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: "users", label: "👥 Users & Roles" },
                    { id: "audit", label: "🗒️ Audit Log" },
                    { id: "retrain", label: "🔁 Retrain Model" },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all -mb-px border ${tab === t.id
                            ? "bg-white border-gray-200 border-b-white text-indigo-700 shadow-sm"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Users tab */}
            {tab === "users" && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-700">System Users</h3>
                        <span className="text-xs text-gray-400">{users.length} users</span>
                    </div>
                    {error && (
                        <div className="px-8 py-4 text-red-500 text-sm">{error}</div>
                    )}
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Username</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Access Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u) => (
                                <tr key={u.username} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-700 font-mono text-sm">{u.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{u.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_BADGE[u.role] || ""}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {u.role === "ADMIN" && "Full Access"}
                                        {u.role === "MANAGER" && "Analytics, Batch, Reports"}
                                        {u.role === "OFFICER" && "Predict Only"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Audit Log tab */}
            {tab === "audit" && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-700">Audit Log</h3>
                        <span className="text-xs text-gray-400 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                            🔒 Append-only — immutable
                        </span>
                    </div>
                    {loading ? (
                        <div className="px-8 py-8 text-gray-400 text-sm text-center">Loading audit log...</div>
                    ) : audit.length === 0 ? (
                        <div className="px-8 py-8 text-gray-400 text-sm text-center">
                            No audit entries yet. The audit_log table needs to be created in PostgreSQL.
                            <pre className="mt-4 text-left text-xs bg-gray-50 p-4 rounded-lg border">
                                {`CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50),
  username VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);`}
                            </pre>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Event</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {audit.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-400 text-xs font-mono">#{log.id}</td>
                                            <td className="px-6 py-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${log.event_type === "LOGIN"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : log.event_type === "PREDICT"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {log.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 text-sm">{log.username}</td>
                                            <td className="px-6 py-3 text-gray-500 text-xs font-mono">
                                                {typeof log.details === "object"
                                                    ? JSON.stringify(log.details)
                                                    : log.details}
                                            </td>
                                            <td className="px-6 py-3 text-gray-400 text-xs">
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
            {/* Retrain Model tab */}
            {tab === "retrain" && (
                <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-700 mb-1">🔁 Model Retraining</h3>
                        <p className="text-sm text-gray-400">Triggers a full retrain of the ML model using the current dataset. Takes ~5–10 seconds. The new model is saved and immediately used for predictions.</p>
                    </div>

                    <button
                        onClick={handleRetrain}
                        disabled={retraining}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black px-8 py-3 rounded-xl hover:from-indigo-500 hover:to-blue-500 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {retraining ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Retraining...
                            </span>
                        ) : "Retrain Now"}
                    </button>

                    {retrainError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-600 text-sm">
                            ❌ {retrainError}
                        </div>
                    )}

                    {retrainResult && (
                        <div className={`rounded-xl border px-6 py-5 space-y-4 ${retrainResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                            <p className={`font-bold text-lg ${retrainResult.success ? "text-green-700" : "text-red-600"}`}>
                                {retrainResult.success ? "✅ Retraining Successful" : "❌ Retraining Failed"}
                            </p>
                            {retrainResult.accuracy != null && (
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accuracy</p>
                                        <p className="text-2xl font-black text-indigo-700">{(retrainResult.accuracy * 100).toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">F1 Score</p>
                                        <p className="text-2xl font-black text-indigo-700">{(retrainResult.f1 * 100).toFixed(2)}%</p>
                                    </div>
                                </div>
                            )}
                            <details className="mt-2">
                                <summary className="text-xs font-bold text-gray-400 cursor-pointer hover:text-gray-600">View output log</summary>
                                <pre className="mt-2 text-xs bg-gray-100 rounded-lg p-4 overflow-auto max-h-48 text-gray-600 whitespace-pre-wrap">{retrainResult.output}</pre>
                            </details>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
