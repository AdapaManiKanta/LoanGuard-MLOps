import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const ROLE_COLORS = {
    ADMIN: { bg: "rgba(124,77,255,0.12)", text: "#a78bfa", border: "rgba(124,77,255,0.25)" },
    MANAGER: { bg: "rgba(245,158,11,0.1)", text: "#fde68a", border: "rgba(245,158,11,0.2)" },
    OFFICER: { bg: "rgba(34,197,94,0.1)", text: "#86efac", border: "rgba(34,197,94,0.2)" },
};

const EVENT_BADGE = {
    LOGIN: { bg: "rgba(148,163,184,0.1)", text: "rgba(148,163,184,0.8)", border: "rgba(148,163,184,0.15)" },
    PREDICT: { bg: "rgba(34,197,94,0.1)", text: "#86efac", border: "rgba(34,197,94,0.2)" },
    RETRAIN: { bg: "rgba(124,77,255,0.12)", text: "#a78bfa", border: "rgba(124,77,255,0.25)" },
};

const card = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
};

const td = {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    fontSize: 12, color: "rgba(148,163,184,0.8)",
    verticalAlign: "middle",
};

export default function AdminPanel({ token }) {
    const [users, setUsers] = useState([]);
    const [audit, setAudit] = useState([]);
    const [modelInfo, setModelInfo] = useState(null);
    const [drift, setDrift] = useState(null);
    const [tab, setTab] = useState("users");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [retraining, setRetraining] = useState(false);
    const [retrainResult, setRetrainResult] = useState(null);
    const [retrainError, setRetrainError] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchUsers(); fetchAudit(); fetchModelInfo(); fetchDrift();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/users`, { headers });
            setUsers(res.data.users || []);
        } catch (e) { setError(e.response?.data?.error || "Failed to load users"); }
    };
    const fetchAudit = async () => {
        setLoading(true);
        try { const res = await axios.get(`${API_BASE}/audit`, { headers }); setAudit(res.data || []); }
        catch (e) { } finally { setLoading(false); }
    };
    const fetchModelInfo = async () => {
        try { const res = await axios.get(`${API_BASE}/admin/model-info`, { headers }); setModelInfo(res.data); }
        catch (e) { }
    };
    const fetchDrift = async () => {
        try { const res = await axios.get(`${API_BASE}/drift-status`, { headers }); setDrift(res.data); }
        catch (e) { }
    };
    const handleRetrain = async () => {
        setRetraining(true); setRetrainResult(null); setRetrainError(null);
        try {
            const res = await axios.post(`${API_BASE}/admin/retrain`, {}, { headers });
            setRetrainResult(res.data); fetchModelInfo(); fetchDrift(); fetchAudit();
        } catch (e) { setRetrainError(e.response?.data?.error || "Retrain request failed"); }
        finally { setRetraining(false); }
    };

    const TABS = [
        { id: "users", label: "Users", icon: "👥" },
        { id: "roles", label: "Roles", icon: "🛡️" },
        { id: "audit", label: "Audit Logs", icon: "📋" },
        { id: "model", label: "Model Settings", icon: "🧠" },
    ];

    const theadTh = {
        padding: "10px 16px", textAlign: "left",
        fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
        color: "rgba(148,163,184,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{
                paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>
                        Admin Panel
                    </h2>
                    <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>Manage users, audit logs, and model settings</p>
                </div>
                <button style={{
                    padding: "10px 22px", background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                    border: "none", borderRadius: 100, color: "white", fontWeight: 700, fontSize: 12,
                    cursor: "pointer", letterSpacing: 1,
                    boxShadow: "0 4px 20px rgba(124,77,255,0.4)"
                }}>
                    + Add User
                </button>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 8 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
                        border: tab === t.id ? "1px solid rgba(124,77,255,0.35)" : "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        background: tab === t.id ? "rgba(124,77,255,0.12)" : "rgba(255,255,255,0.03)",
                        color: tab === t.id ? "#a78bfa" : "rgba(148,163,184,0.55)",
                        transition: "all 0.2s",
                    }}>
                        <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={card}>
                {/* Users */}
                {tab === "users" && (
                    <div>
                        <div style={{
                            padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "rgba(255,255,255,0.015)"
                        }}>
                            <input type="text" placeholder="🔍  Search users..."
                                style={{
                                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 10, padding: "8px 14px", color: "#e2e8f0", fontSize: 12,
                                    outline: "none", width: 220, fontFamily: "inherit"
                                }} />
                        </div>
                        {error && <div style={{
                            padding: "12px 20px", fontSize: 12, color: "#fca5a5",
                            background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.12)"
                        }}>{error}</div>}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        {["ID", "Name", "Email", "Role", "Last Login", "Status", "Actions"].map(h => (
                                            <th key={h} style={theadTh}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={u.username} style={{ transition: "background 0.2s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                            onMouseLeave={e => e.currentTarget.style.background = ""}>
                                            <td style={{ ...td, fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.35)" }}>
                                                #01{i + 1}
                                            </td>
                                            <td style={{ ...td, fontWeight: 700, color: "#f1f5f9" }}>{u.name}</td>
                                            <td style={{ ...td, color: "rgba(148,163,184,0.5)" }}>{u.username}@loanguard.co</td>
                                            <td style={td}>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: 1,
                                                    background: ROLE_COLORS[u.role]?.bg || "rgba(255,255,255,0.06)",
                                                    color: ROLE_COLORS[u.role]?.text || "#e2e8f0",
                                                    border: `1px solid ${ROLE_COLORS[u.role]?.border || "rgba(255,255,255,0.1)"}`,
                                                }}>{u.role}</span>
                                            </td>
                                            <td style={{ ...td, fontFamily: "monospace", fontSize: 10 }}>20-03-2026</td>
                                            <td style={td}>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                                                    background: "rgba(34,197,94,0.1)", color: "#86efac",
                                                    border: "1px solid rgba(34,197,94,0.2)"
                                                }}>Active</span>
                                            </td>
                                            <td style={td}>
                                                <button style={{
                                                    padding: "5px 14px", background: "rgba(124,77,255,0.12)",
                                                    border: "1px solid rgba(124,77,255,0.25)", borderRadius: 8,
                                                    color: "#a78bfa", fontSize: 10, fontWeight: 700, cursor: "pointer",
                                                    transition: "all 0.2s"
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,77,255,0.22)"; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,77,255,0.12)"; }}>
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan="7" style={{
                                            padding: "40px", textAlign: "center",
                                            color: "rgba(148,163,184,0.3)", fontSize: 13
                                        }}>No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Roles */}
                {tab === "roles" && (
                    <div style={{ padding: 48, textAlign: "center" }}>
                        <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 14 }}>🛡️</div>
                        <p style={{ color: "rgba(148,163,184,0.4)", fontSize: 13 }}>
                            Role definitions are immutable and managed via configuration.
                        </p>
                    </div>
                )}

                {/* Audit */}
                {tab === "audit" && (
                    <div>
                        <div style={{
                            padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.015)"
                        }}>
                            <span style={{
                                padding: "4px 12px", borderRadius: 100,
                                background: "rgba(124,77,255,0.1)", border: "1px solid rgba(124,77,255,0.2)",
                                fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#a78bfa"
                            }}>
                                🔒 Immutable Ledger
                            </span>
                        </div>
                        {loading ? (
                            <div style={{ padding: "48px", textAlign: "center", color: "rgba(124,77,255,0.5)", fontSize: 13, fontWeight: 600 }}>
                                Loading secure audit trail...
                            </div>
                        ) : audit.length === 0 ? (
                            <div style={{ padding: "48px", textAlign: "center", color: "rgba(148,163,184,0.3)", fontSize: 13 }}>
                                No audit entries yet.
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {["ID", "Event", "User", "Details", "Timestamp"].map(h => (
                                                <th key={h} style={theadTh}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {audit.map(log => (
                                            <tr key={log.id}
                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                                onMouseLeave={e => e.currentTarget.style.background = ""}>
                                                <td style={{ ...td, fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.3)" }}>
                                                    #{String(log.id).padStart(4, "0")}
                                                </td>
                                                <td style={td}>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: 100, fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                                                        ...(EVENT_BADGE[log.event_type] || { bg: "rgba(148,163,184,0.1)", text: "rgba(148,163,184,0.7)", border: "rgba(148,163,184,0.1)" }),
                                                        background: (EVENT_BADGE[log.event_type] || {}).bg,
                                                        color: (EVENT_BADGE[log.event_type] || {}).text,
                                                        border: `1px solid ${(EVENT_BADGE[log.event_type] || {}).border}`,
                                                    }}>{log.event_type}</span>
                                                </td>
                                                <td style={{ ...td, fontWeight: 700, color: "#f1f5f9" }}>{log.username}</td>
                                                <td style={{
                                                    ...td, fontFamily: "monospace", fontSize: 10, maxWidth: 240,
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                                }}>
                                                    {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                                                </td>
                                                <td style={{ ...td, fontSize: 11, whiteSpace: "nowrap" }}>
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

                {/* Model Settings */}
                {tab === "model" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 20 }}>
                        {/* Model Info */}
                        <div style={{
                            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 16, padding: 24
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 4, display: "flex", gap: 8, alignItems: "center" }}>
                                🧠 Current ML Model
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginBottom: 20 }}>Production serving model metadata.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    { label: "Version", val: `v${modelInfo?.version || "1.0.0"}`, color: "#a78bfa" },
                                    { label: "Trained On", val: modelInfo?.trained_at || "Unknown", color: "#e2e8f0" },
                                    modelInfo?.accuracy && { label: "Baseline Accuracy", val: `${(modelInfo.accuracy * 100).toFixed(1)}%`, color: "#86efac" },
                                ].filter(Boolean).map(m => (
                                    <div key={m.label} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                                        borderRadius: 10, padding: "10px 14px"
                                    }}>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                                            color: "rgba(148,163,184,0.35)"
                                        }}>{m.label}</span>
                                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: m.color }}>{m.val}</span>
                                    </div>
                                ))}
                            </div>

                            {drift?.accuracy_7d && (
                                <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{
                                        fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(148,163,184,0.35)",
                                        textTransform: "uppercase", marginBottom: 12
                                    }}>Live Drift Monitor (7-Day)</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%", borderRadius: 4,
                                                background: drift.drift_detected ? "#ef4444" : "#22c55e",
                                                width: `${(drift.accuracy_7d * 100).toFixed(0)}%`, transition: "width 1s ease"
                                            }} />
                                        </div>
                                        <span style={{
                                            fontFamily: "monospace", fontSize: 12, fontWeight: 800,
                                            color: drift.drift_detected ? "#fca5a5" : "#86efac"
                                        }}>
                                            {(drift.accuracy_7d * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    {drift.drift_detected && (
                                        <div style={{
                                            marginTop: 12, padding: "8px 14px", borderRadius: 10,
                                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                                            fontSize: 10, fontWeight: 700, color: "#fca5a5", letterSpacing: 1
                                        }}>
                                            ⚠️ Model degradation detected. Retrain recommended.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Retrain */}
                        <div style={{
                            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 16, padding: 24
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 4, display: "flex", gap: 8, alignItems: "center" }}>
                                🔁 Automated Retraining
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginBottom: 20 }}>
                                Trigger a pipeline to rebuild the model.
                            </p>

                            <div style={{
                                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                                borderRadius: 12, padding: 16, marginBottom: 20
                            }}>
                                <div style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#60a5fa",
                                    textTransform: "uppercase", marginBottom: 10
                                }}>Pipeline Steps</div>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                                    {[
                                        "Pulls latest 10k apps from Supabase",
                                        "Fits new RandomForest with tuning",
                                        "Validates F1/Accuracy ≥ 80%",
                                        "Hot-swaps model without downtime",
                                    ].map((s, i) => (
                                        <li key={i} style={{ fontSize: 11, color: "rgba(96,165,250,0.8)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                                            <span style={{ color: "rgba(96,165,250,0.4)", fontWeight: 700, minWidth: 18 }}>{i + 1}.</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button onClick={handleRetrain} disabled={retraining} style={{
                                width: "100%", padding: "14px", borderRadius: 12,
                                border: "none", cursor: retraining ? "not-allowed" : "pointer",
                                fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
                                background: retraining ? "rgba(255,255,255,0.04)" :
                                    drift?.drift_detected ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#7c4dff,#3b82f6)",
                                color: retraining ? "rgba(148,163,184,0.3)" : "white",
                                boxShadow: retraining ? "none" : drift?.drift_detected ? "0 8px 30px rgba(239,68,68,0.4)" : "0 8px 30px rgba(124,77,255,0.4)",
                                transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            }}>
                                {retraining ? (
                                    <>
                                        <span style={{
                                            width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)",
                                            borderTop: "2px solid white", borderRadius: "50%", display: "inline-block",
                                            animation: "spin 1s linear infinite"
                                        }} />
                                        Running Pipeline...
                                    </>
                                ) : drift?.drift_detected ? "⚠️ Force Retrain Now" : "Commit Retrain Pipeline"}
                            </button>

                            {retrainError && (
                                <div style={{
                                    marginTop: 14, padding: "12px 16px",
                                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                                    borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#fca5a5"
                                }}>
                                    ❌ {retrainError}
                                </div>
                            )}

                            {retrainResult && (
                                <div style={{
                                    marginTop: 14, padding: "16px", borderRadius: 12,
                                    background: retrainResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                                    border: `1px solid ${retrainResult.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                                }}>
                                    <div style={{
                                        fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                                        color: retrainResult.success ? "#86efac" : "#fca5a5", marginBottom: 12
                                    }}>
                                        {retrainResult.success ? "✅ Pipeline Completed" : "❌ Pipeline Failed"}
                                    </div>
                                    {retrainResult.accuracy != null && (
                                        <div style={{ display: "flex", gap: 24 }}>
                                            {[
                                                { label: "New Accuracy", val: `${(retrainResult.accuracy * 100).toFixed(1)}%` },
                                                { label: "New F1 Score", val: `${(retrainResult.f1 * 100).toFixed(1)}%` },
                                            ].map(m => (
                                                <div key={m.label}>
                                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
                                                    <div style={{ fontSize: 22, fontWeight: 900, color: "#86efac", fontFamily: "'Space Grotesk',sans-serif" }}>{m.val}</div>
                                                </div>
                                            ))}
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
