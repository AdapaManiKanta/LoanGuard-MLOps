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
        </div>
    );
}
