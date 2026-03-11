import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
    USER_CREATED: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    USER_UPDATED: { bg: "rgba(245,158,11,0.1)", text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
    USER_DELETED: { bg: "rgba(239,68,68,0.1)", text: "#fca5a5", border: "rgba(239,68,68,0.2)" },
};

const card = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };
const td = { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12, color: "rgba(148,163,184,0.8)", verticalAlign: "middle" };
const thTd = { padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "rgba(148,163,184,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" };

/* ── Add / Edit User Modal ── */
function UserModal({ open, onClose, onSave, editUser, currentUser }) {
    const empty = { name: "", username: "", password: "", email: "", role: "OFFICER" };
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(editUser
                ? { name: editUser.name || "", username: editUser.username || "", password: "", email: editUser.email || "", role: editUser.role || "OFFICER" }
                : empty);
            setShowPwd(false);
        }
    }, [open, editUser]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${currentUser.token}` };
            if (editUser) {
                // Edit mode — only send changed fields
                const payload = {};
                if (form.name) payload.name = form.name;
                if (form.password) payload.password = form.password;
                if (form.email) payload.email = form.email;
                if (form.role) payload.role = form.role;
                await axios.put(`${API_BASE}/admin/users/${editUser.username}`, payload, { headers });
                toast.success(`✅ User "${editUser.username}" updated`);
            } else {
                // Create mode
                const res = await axios.post(`${API_BASE}/admin/users`, form, { headers });
                const msg = res.data.email_sent
                    ? `✅ User created! Credentials emailed to ${form.email}.`
                    : `✅ User "${form.username}" created successfully.`;
                toast.success(msg);
            }
            onSave();
            onClose();
        } catch (err) {
            toast.error("❌ " + (err.response?.data?.error || "Request failed"));
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
        padding: "10px 14px", color: "#e2e8f0", fontSize: 13,
        outline: "none", fontFamily: "'Inter',sans-serif",
        transition: "border-color 0.2s",
    };
    const labelStyle = {
        fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
        color: "rgba(148,163,184,0.4)", display: "block", marginBottom: 8,
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={onClose}>
            <div style={{
                background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24, padding: 36, width: "100%", maxWidth: 480,
                boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
                            {editUser ? "Edit User" : "Add New User"}
                        </h3>
                        <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
                            {editUser ? "Update user details or reset password" : "Create a new system user and send credentials via email"}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "rgba(148,163,184,0.6)",
                        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Name */}
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma" required style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "rgba(124,77,255,0.5)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                    </div>

                    {/* Username */}
                    <div>
                        <label style={labelStyle}>Username {editUser ? "(read-only)" : "*"}</label>
                        <input type="text" value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                            placeholder="e.g. rahul_sharma" required={!editUser}
                            readOnly={!!editUser}
                            style={{ ...inputStyle, ...(editUser ? { opacity: 0.4, cursor: "not-allowed" } : {}) }}
                            onFocus={e => { if (!editUser) e.target.style.borderColor = "rgba(124,77,255,0.5)"; }}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Email Address {!editUser && "(credentials will be emailed)"}</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="rahul@company.com" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "rgba(124,77,255,0.5)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                        {!editUser && form.email && (
                            <div style={{ marginTop: 6, fontSize: 10, color: "rgba(34,197,94,0.7)", fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                                📧 Credentials will be sent to this email address
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label style={labelStyle}>
                            {editUser ? "New Password (leave blank to keep current)" : "Password *"}
                        </label>
                        <div style={{ position: "relative" }}>
                            <input type={showPwd ? "text" : "password"} value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder={editUser ? "New password (optional)" : "Minimum 6 characters"}
                                required={!editUser}
                                style={{ ...inputStyle, paddingRight: 44 }}
                                onFocus={e => e.target.style.borderColor = "rgba(124,77,255,0.5)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                style={{
                                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "rgba(148,163,184,0.4)", fontSize: 14
                                }}>
                                {showPwd ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label style={labelStyle}>Role *</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {["ADMIN", "MANAGER", "OFFICER"].map(r => (
                                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                                    style={{
                                        padding: "10px 0", borderRadius: 10, cursor: "pointer",
                                        border: `1px solid ${form.role === r ? ROLE_COLORS[r].border : "rgba(255,255,255,0.07)"}`,
                                        background: form.role === r ? ROLE_COLORS[r].bg : "rgba(255,255,255,0.02)",
                                        color: form.role === r ? ROLE_COLORS[r].text : "rgba(148,163,184,0.4)",
                                        fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                                        transition: "all 0.2s",
                                    }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        marginTop: 8, padding: "14px",
                        background: loading ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#7c4dff,#3b82f6)",
                        border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
                        color: "white", fontWeight: 700, fontSize: 13, letterSpacing: 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        boxShadow: loading ? "none" : "0 8px 30px rgba(124,77,255,0.4)",
                        transition: "all 0.2s",
                    }}>
                        {loading ? (
                            <>
                                <span style={{
                                    width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)",
                                    borderTop: "2px solid white", borderRadius: "50%", display: "inline-block",
                                    animation: "spin 1s linear infinite"
                                }} />
                                {editUser ? "Updating..." : "Creating User..."}
                            </>
                        ) : editUser ? "💾 Save Changes" : "➕ Create User" + (form.email ? " & Send Email" : "")}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ── Main AdminPanel ── */
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

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Leads state
    const [leads, setLeads] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(false);
    const [leadsFilter, setLeadsFilter] = useState("ALL");
    const [expandedLead, setExpandedLead] = useState(null);
    const [leadDocs, setLeadDocs] = useState({});
    const [rejectModal, setRejectModal] = useState(null); // { lead_id, doc_id }
    const [rejectReason, setRejectReason] = useState("");
    const [docActionLoading, setDocActionLoading] = useState(null);

    const fetchLeads = async (filter = leadsFilter) => {
        setLeadsLoading(true);
        try {
            const params = filter !== "ALL" ? `?status=${filter}` : "";
            const res = await axios.get(`${API_BASE}/admin/leads${params}`, { headers });
            setLeads(res.data.leads || []);
        } catch { }
        finally { setLeadsLoading(false); }
    };

    const fetchLeadDocs = async (leadId) => {
        try {
            const res = await axios.get(`${API_BASE}/admin/leads/${leadId}/documents`, { headers });
            setLeadDocs(prev => ({ ...prev, [leadId]: res.data.documents || [] }));
        } catch { }
    };

    const handleDocAction = async (leadId, docId, action, reason = "") => {
        setDocActionLoading(`${docId}-${action}`);
        try {
            await axios.post(
                `${API_BASE}/admin/leads/${leadId}/documents/${docId}/verify`,
                { action, reason },
                { headers }
            );
            toast.success(`✅ Document ${action.toLowerCase()} successfully!`);
            fetchLeadDocs(leadId);
            fetchLeads(leadsFilter);
            setRejectModal(null); setRejectReason("");
        } catch (e) {
            toast.error(e.response?.data?.error || "Action failed");
        } finally { setDocActionLoading(null); }
    };

    const handleLeadStatus = async (leadId, status, notes = "") => {
        try {
            await axios.patch(`${API_BASE}/admin/leads/${leadId}/status`, { status, notes }, { headers });
            toast.success(`✅ Lead status updated to ${status}`);
            fetchLeads(leadsFilter);
        } catch (e) { toast.error(e.response?.data?.error || "Update failed"); }
    };

    // Decode current user from token
    const currentUsername = (() => {
        try { return JSON.parse(atob(token.split(".")[1])).sub; } catch { return ""; }
    })();

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchUsers(); fetchAudit(); fetchModelInfo(); fetchDrift(); }, []);

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

    const handleDeleteUser = async (username) => {
        if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_BASE}/admin/users/${username}`, { headers });
            toast.success(`🗑️ User "${username}" deleted`);
            fetchUsers();
        } catch (err) {
            toast.error("❌ " + (err.response?.data?.error || "Delete failed"));
        }
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
        { id: "leads", label: "Leads & Verification", icon: "📁", badge: leads.filter(l => l.status === "NEW" || l.status === "DOCS_SUBMITTED").length },
    ];

    return (
        <>
            {/* CSS for spin */}
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

            {/* Add/Edit Modal */}
            <UserModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditUser(null); }}
                onSave={fetchUsers}
                editUser={editUser}
                currentUser={{ token }}
            />

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
                        <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
                            Manage users, audit logs, and model settings
                        </p>
                    </div>
                    {tab === "users" && (
                        <button onClick={() => { setEditUser(null); setModalOpen(true); }}
                            style={{
                                padding: "11px 24px", background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                                border: "none", borderRadius: 100, color: "white", fontWeight: 700, fontSize: 13,
                                cursor: "pointer", letterSpacing: 0.5,
                                boxShadow: "0 4px 20px rgba(124,77,255,0.4)",
                                display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = ""}>
                            ➕ Add User
                        </button>
                    )}
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
                            transition: "all 0.2s", fontFamily: "inherit",
                        }}>
                            <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
                            {t.badge > 0 && (
                                <span style={{
                                    background: "#ef4444", color: "white",
                                    borderRadius: 100, padding: "1px 7px", fontSize: 9, fontWeight: 800
                                }}>{t.badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={card}>

                    {/* ── Users Tab ── */}
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
                                            {["ID", "Name", "Email", "Role", "Status", "Actions"].map(h => (
                                                <th key={h} style={thTd}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u, i) => (
                                            <tr key={u.username}
                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                                onMouseLeave={e => e.currentTarget.style.background = ""}>
                                                <td style={{ ...td, fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.35)" }}>
                                                    #{String(u.id || i + 1).padStart(3, "0")}
                                                </td>
                                                <td style={{ ...td, fontWeight: 700, color: "#f1f5f9" }}>{u.name}</td>
                                                <td style={{ ...td, color: "rgba(148,163,184,0.5)", fontSize: 11 }}>
                                                    {u.email || <span style={{ opacity: 0.3 }}>—</span>}
                                                </td>
                                                <td style={td}>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: 1,
                                                        background: ROLE_COLORS[u.role]?.bg || "rgba(255,255,255,0.06)",
                                                        color: ROLE_COLORS[u.role]?.text || "#e2e8f0",
                                                        border: `1px solid ${ROLE_COLORS[u.role]?.border || "rgba(255,255,255,0.1)"}`,
                                                    }}>{u.role}</span>
                                                </td>
                                                <td style={td}>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                                                        background: u.is_active !== false ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                                                        color: u.is_active !== false ? "#86efac" : "#fca5a5",
                                                        border: `1px solid ${u.is_active !== false ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`
                                                    }}>
                                                        {u.is_active !== false ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td style={td}>
                                                    <div style={{
                                                        display: "flex", gap: 8
                                                    }}>
                                                        <button onClick={() => { setEditUser(u); setModalOpen(true); }}
                                                            style={{
                                                                padding: "5px 14px", background: "rgba(124,77,255,0.12)",
                                                                border: "1px solid rgba(124,77,255,0.25)", borderRadius: 8,
                                                                color: "#a78bfa", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,77,255,0.22)"}
                                                            onMouseLeave={e => e.currentTarget.style.background = "rgba(124,77,255,0.12)"}>
                                                            ✏️ Edit
                                                        </button>
                                                        {u.username !== currentUsername && (
                                                            <button onClick={() => handleDeleteUser(u.username)}
                                                                style={{
                                                                    padding: "5px 14px", background: "rgba(239,68,68,0.08)",
                                                                    border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8,
                                                                    color: "#fca5a5", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
                                                                onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}>
                                                                🗑️ Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan="6" style={{
                                                padding: "48px", textAlign: "center",
                                                color: "rgba(148,163,184,0.3)", fontSize: 13
                                            }}>
                                                No users found. Click "+ Add User" to create one.
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Roles Tab ── */}
                    {tab === "roles" && (
                        <div style={{ padding: 48, textAlign: "center" }}>
                            <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 14 }}>🛡️</div>
                            <p style={{ color: "rgba(148,163,184,0.4)", fontSize: 13 }}>
                                Role definitions are immutable and managed via configuration.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 32 }}>
                                {[
                                    { role: "ADMIN", desc: "Full system access: users, model, analytics", color: "#a78bfa", bg: "rgba(124,77,255,0.1)" },
                                    { role: "MANAGER", desc: "Analytics, batch processing, status management", color: "#fde68a", bg: "rgba(245,158,11,0.08)" },
                                    { role: "OFFICER", desc: "Loan predictions and application review only", color: "#86efac", bg: "rgba(34,197,94,0.08)" },
                                ].map(r => (
                                    <div key={r.role} style={{
                                        background: r.bg, border: `1px solid ${r.color}30`,
                                        borderRadius: 16, padding: "20px 24px", maxWidth: 200, textAlign: "center"
                                    }}>
                                        <div style={{ color: r.color, fontWeight: 800, fontSize: 12, letterSpacing: 2, marginBottom: 10 }}>{r.role}</div>
                                        <div style={{ color: "rgba(148,163,184,0.5)", fontSize: 11, lineHeight: 1.6 }}>{r.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Audit Tab ── */}
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
                                    Loading audit trail...
                                </div>
                            ) : audit.length === 0 ? (
                                <div style={{ padding: "48px", textAlign: "center", color: "rgba(148,163,184,0.3)", fontSize: 13 }}>
                                    No audit entries yet.
                                </div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>{["ID", "Event", "User", "Details", "Timestamp"].map(h => (
                                                <th key={h} style={thTd}>{h}</th>
                                            ))}</tr>
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
                                                            background: (EVENT_BADGE[log.event_type] || EVENT_BADGE.LOGIN).bg,
                                                            color: (EVENT_BADGE[log.event_type] || EVENT_BADGE.LOGIN).text,
                                                            border: `1px solid ${(EVENT_BADGE[log.event_type] || EVENT_BADGE.LOGIN).border}`,
                                                        }}>{log.event_type}</span>
                                                    </td>
                                                    <td style={{ ...td, fontWeight: 700, color: "#f1f5f9" }}>{log.username}</td>
                                                    <td style={{ ...td, fontFamily: "monospace", fontSize: 10, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

                    {/* ── Model Tab ── */}
                    {tab === "model" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 20 }}>
                            {/* Model Info */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 4 }}>🧠 Current ML Model</div>
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
                                            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "rgba(148,163,184,0.35)" }}>{m.label}</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: m.color }}>{m.val}</span>
                                        </div>
                                    ))}
                                </div>
                                {drift?.accuracy_7d && (
                                    <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 12 }}>Live Drift Monitor</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%", borderRadius: 4, background: drift.drift_detected ? "#ef4444" : "#22c55e",
                                                    width: `${(drift.accuracy_7d * 100).toFixed(0)}%`, transition: "width 1s ease"
                                                }} />
                                            </div>
                                            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: drift.drift_detected ? "#fca5a5" : "#86efac" }}>
                                                {(drift.accuracy_7d * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        {drift.drift_detected && (
                                            <div style={{
                                                marginTop: 12, padding: "8px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)",
                                                border: "1px solid rgba(239,68,68,0.2)", fontSize: 10, fontWeight: 700, color: "#fca5a5"
                                            }}>
                                                ⚠️ Model degradation detected. Retrain recommended.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Retrain */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 4 }}>🔁 Automated Retraining</div>
                                <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginBottom: 20 }}>Trigger a pipeline to rebuild the model.</p>
                                <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#60a5fa", textTransform: "uppercase", marginBottom: 10 }}>Pipeline Steps</div>
                                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                                        {["Pulls latest 10k apps from Supabase", "Fits new RandomForest with tuning", "Validates F1/Accuracy ≥ 80%", "Hot-swaps model without downtime"].map((s, i) => (
                                            <li key={i} style={{ fontSize: 11, color: "rgba(96,165,250,0.8)", display: "flex", gap: 10 }}>
                                                <span style={{ color: "rgba(96,165,250,0.4)", fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button onClick={handleRetrain} disabled={retraining} style={{
                                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                                    cursor: retraining ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
                                    background: retraining ? "rgba(255,255,255,0.04)" : drift?.drift_detected ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#7c4dff,#3b82f6)",
                                    color: retraining ? "rgba(148,163,184,0.3)" : "white",
                                    boxShadow: retraining ? "none" : drift?.drift_detected ? "0 8px 30px rgba(239,68,68,0.4)" : "0 8px 30px rgba(124,77,255,0.4)",
                                    transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit",
                                }}>
                                    {retraining ? (<><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />Running Pipeline...</>) : drift?.drift_detected ? "⚠️ Force Retrain Now" : "Commit Retrain Pipeline"}
                                </button>
                                {retrainError && <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#fca5a5" }}>❌ {retrainError}</div>}
                                {retrainResult && (
                                    <div style={{ marginTop: 14, padding: "16px", borderRadius: 12, background: retrainResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${retrainResult.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: retrainResult.success ? "#86efac" : "#fca5a5", marginBottom: 12 }}>{retrainResult.success ? "✅ Pipeline Completed" : "❌ Pipeline Failed"}</div>
                                        {retrainResult.accuracy != null && (
                                            <div style={{ display: "flex", gap: 24 }}>
                                                {[{ label: "New Accuracy", val: `${(retrainResult.accuracy * 100).toFixed(1)}%` }, { label: "New F1", val: `${(retrainResult.f1 * 100).toFixed(1)}%` }].map(m => (
                                                    <div key={m.label}>
                                                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
                                                        <div style={{ fontSize: 22, fontWeight: 900, color: "#86efac" }}>{m.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Leads & Verification Tab ── */}
                    {tab === "leads" && (() => {
                        if (leads.length === 0 && !leadsLoading) fetchLeads("ALL");
                        const LEAD_STATUSES = ["ALL", "NEW", "CONTACTED", "DOCS_SUBMITTED", "VERIFIED", "REJECTED"];
                        const STATUS_COLOR = {
                            NEW: { bg: "rgba(124,77,255,0.12)", text: "#a78bfa", border: "rgba(124,77,255,0.25)" },
                            CONTACTED: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
                            DOCS_SUBMITTED: { bg: "rgba(245,158,11,0.1)", text: "#fde68a", border: "rgba(245,158,11,0.2)" },
                            VERIFIED: { bg: "rgba(34,197,94,0.1)", text: "#86efac", border: "rgba(34,197,94,0.2)" },
                            REJECTED: { bg: "rgba(239,68,68,0.1)", text: "#fca5a5", border: "rgba(239,68,68,0.2)" },
                        };
                        const sc = (s) => STATUS_COLOR[s] || { bg: "rgba(255,255,255,0.06)", text: "#e2e8f0", border: "rgba(255,255,255,0.1)" };

                        return (
                            <div>
                                {/* Reject reason modal */}
                                {rejectModal && (
                                    <div style={{
                                        position: "fixed", inset: 0, zIndex: 2000,
                                        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <div style={{
                                            background: "#0f0f1a", border: "1px solid rgba(239,68,68,0.3)",
                                            borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw",
                                        }}>
                                            <h3 style={{ color: "#fca5a5", fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                                                Reject Document
                                            </h3>
                                            <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 12, marginBottom: 20 }}>
                                                Please provide a clear reason. This will be sent to the applicant by email.
                                            </p>
                                            <textarea
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                placeholder="e.g. Document is blurry / not matching name / expired document..."
                                                rows={4}
                                                style={{
                                                    width: "100%", padding: "12px 16px",
                                                    background: "rgba(255,255,255,0.04)",
                                                    border: "1px solid rgba(239,68,68,0.25)",
                                                    borderRadius: 12, color: "#e2e8f0", fontSize: 13,
                                                    fontFamily: "inherit", outline: "none", resize: "vertical",
                                                }}
                                            />
                                            <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "flex-end" }}>
                                                <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                                                    style={{
                                                        padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                                                        background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.7)",
                                                        cursor: "pointer", fontSize: 12, fontWeight: 700
                                                    }}>Cancel</button>
                                                <button
                                                    disabled={!rejectReason.trim() || !!docActionLoading}
                                                    onClick={() => handleDocAction(rejectModal.lead_id, rejectModal.doc_id, "REJECTED", rejectReason)}
                                                    style={{
                                                        padding: "9px 20px", borderRadius: 10,
                                                        background: rejectReason.trim() ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.05)",
                                                        border: "1px solid rgba(239,68,68,0.3)",
                                                        color: rejectReason.trim() ? "#fca5a5" : "rgba(239,68,68,0.3)",
                                                        cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                                                        fontSize: 12, fontWeight: 800,
                                                    }}>Confirm Rejection</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Status filter strip */}
                                <div style={{
                                    padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
                                    background: "rgba(255,255,255,0.015)"
                                }}>
                                    {LEAD_STATUSES.map(s => (
                                        <button key={s}
                                            onClick={() => { setLeadsFilter(s); fetchLeads(s); setExpandedLead(null); }}
                                            style={{
                                                padding: "5px 14px", borderRadius: 100, fontSize: 10,
                                                fontWeight: 800, letterSpacing: 1, cursor: "pointer",
                                                border: leadsFilter === s
                                                    ? `1px solid ${sc(s).border || "rgba(124,77,255,0.35)"}`
                                                    : "1px solid rgba(255,255,255,0.07)",
                                                background: leadsFilter === s
                                                    ? (sc(s).bg || "rgba(124,77,255,0.12)")
                                                    : "rgba(255,255,255,0.03)",
                                                color: leadsFilter === s
                                                    ? (sc(s).text || "#a78bfa")
                                                    : "rgba(148,163,184,0.4)",
                                                transition: "all 0.15s", fontFamily: "inherit",
                                            }}>
                                            {s}
                                        </button>
                                    ))}
                                    <button onClick={() => { fetchLeads(leadsFilter); }} title="Refresh"
                                        style={{
                                            marginLeft: "auto", padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                                            color: "rgba(148,163,184,0.4)", fontSize: 14
                                        }}>↻</button>
                                </div>

                                {/* Leads table */}
                                {leadsLoading ? (
                                    <div style={{ padding: 48, textAlign: "center", color: "rgba(124,77,255,0.5)", fontSize: 13 }}>Loading leads...</div>
                                ) : leads.length === 0 ? (
                                    <div style={{ padding: 48, textAlign: "center", color: "rgba(148,163,184,0.3)", fontSize: 13 }}>
                                        No leads found for this filter.
                                    </div>
                                ) : (
                                    <div>
                                        {leads.map(lead => (
                                            <div key={lead.id}>
                                                {/* Lead row */}
                                                <div
                                                    onClick={() => {
                                                        if (expandedLead === lead.id) { setExpandedLead(null); }
                                                        else { setExpandedLead(lead.id); fetchLeadDocs(lead.id); }
                                                    }}
                                                    style={{
                                                        padding: "14px 20px",
                                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                        display: "grid",
                                                        gridTemplateColumns: "28px 1fr 1fr 1fr auto auto",
                                                        gap: 12, alignItems: "center",
                                                        cursor: "pointer", transition: "background 0.15s",
                                                        background: expandedLead === lead.id ? "rgba(124,77,255,0.06)" : "",
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = expandedLead === lead.id ? "rgba(124,77,255,0.06)" : ""}
                                                >
                                                    <span style={{ fontSize: 13, color: "rgba(148,163,184,0.3)" }}>
                                                        {expandedLead === lead.id ? "▼" : "▶"}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>
                                                            {lead.applicant_name || "—"}
                                                        </div>
                                                        <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 2 }}>
                                                            {new Date(lead.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#60a5fa" }}>{lead.email}</div>
                                                    <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>{lead.phone}</div>
                                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                        {(() => {
                                                            const c = sc(lead.status); return (
                                                                <span style={{
                                                                    padding: "3px 10px", borderRadius: 20, fontSize: 9,
                                                                    fontWeight: 800, letterSpacing: 1, background: c.bg,
                                                                    color: c.text, border: `1px solid ${c.border}`
                                                                }}>
                                                                    {lead.status}
                                                                </span>
                                                            );
                                                        })()}
                                                        {Number(lead.doc_count) > 0 && (
                                                            <span style={{
                                                                padding: "3px 10px", borderRadius: 20, fontSize: 9,
                                                                fontWeight: 800, background: "rgba(255,255,255,0.06)",
                                                                color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.08)"
                                                            }}>
                                                                {lead.doc_count} doc{lead.doc_count > 1 ? "s" : ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        {lead.status === "NEW" && (
                                                            <button
                                                                onClick={e => { e.stopPropagation(); handleLeadStatus(lead.id, "CONTACTED"); }}
                                                                style={{
                                                                    padding: "5px 12px", fontSize: 10, fontWeight: 700,
                                                                    background: "rgba(59,130,246,0.1)",
                                                                    border: "1px solid rgba(59,130,246,0.25)",
                                                                    borderRadius: 8, color: "#60a5fa", cursor: "pointer"
                                                                }}>
                                                                Mark Contacted
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded documents row */}
                                                {expandedLead === lead.id && (
                                                    <div style={{
                                                        padding: "16px 24px 20px 60px",
                                                        background: "rgba(124,77,255,0.03)",
                                                        borderBottom: "1px solid rgba(124,77,255,0.1)",
                                                    }}>
                                                        <div style={{
                                                            fontSize: 9, fontWeight: 800, letterSpacing: 2,
                                                            textTransform: "uppercase", color: "rgba(148,163,184,0.3)", marginBottom: 12
                                                        }}>
                                                            Submitted Documents
                                                        </div>
                                                        {!(leadDocs[lead.id]?.length) ? (
                                                            <div style={{ fontSize: 12, color: "rgba(148,163,184,0.35)", fontStyle: "italic" }}>
                                                                No documents uploaded yet.
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                                {(leadDocs[lead.id] || []).map(doc => (
                                                                    <div key={doc.id} style={{
                                                                        display: "flex", alignItems: "center",
                                                                        gap: 12, padding: "10px 16px",
                                                                        background: doc.status === "VERIFIED" ? "rgba(34,197,94,0.06)"
                                                                            : doc.status === "REJECTED" ? "rgba(239,68,68,0.06)"
                                                                                : "rgba(255,255,255,0.02)",
                                                                        border: `1px solid ${doc.status === "VERIFIED" ? "rgba(34,197,94,0.2)"
                                                                                : doc.status === "REJECTED" ? "rgba(239,68,68,0.2)"
                                                                                    : "rgba(255,255,255,0.06)"
                                                                            }`,
                                                                        borderRadius: 10,
                                                                    }}>
                                                                        <span style={{ fontSize: 18 }}>
                                                                            {doc.status === "VERIFIED" ? "✅" : doc.status === "REJECTED" ? "❌" : "📄"}
                                                                        </span>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>
                                                                                {doc.doc_type}
                                                                            </div>
                                                                            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 2 }}>
                                                                                {doc.filename}
                                                                                {doc.rejection_reason && (
                                                                                    <span style={{ color: "#fca5a5", marginLeft: 8 }}>
                                                                                        — {doc.rejection_reason}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                                            <a href={`${"http://127.0.0.1:5000"}/uploads/${doc.file_path}`}
                                                                                target="_blank" rel="noreferrer"
                                                                                style={{
                                                                                    padding: "5px 12px", fontSize: 10, fontWeight: 700,
                                                                                    background: "rgba(255,255,255,0.05)",
                                                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                                                    borderRadius: 8, color: "rgba(148,163,184,0.7)",
                                                                                    textDecoration: "none"
                                                                                }}>👁️ View</a>
                                                                            {doc.status === "PENDING" && (
                                                                                <>
                                                                                    <button
                                                                                        disabled={!!docActionLoading}
                                                                                        onClick={() => handleDocAction(lead.id, doc.id, "VERIFIED")}
                                                                                        style={{
                                                                                            padding: "5px 12px", fontSize: 10, fontWeight: 700,
                                                                                            background: "rgba(34,197,94,0.12)",
                                                                                            border: "1px solid rgba(34,197,94,0.25)",
                                                                                            borderRadius: 8, color: "#86efac",
                                                                                            cursor: "pointer"
                                                                                        }}>
                                                                                        {docActionLoading === `${doc.id}-VERIFIED` ? "..." : "✅ Approve"}
                                                                                    </button>
                                                                                    <button
                                                                                        disabled={!!docActionLoading}
                                                                                        onClick={() => setRejectModal({ lead_id: lead.id, doc_id: doc.id })}
                                                                                        style={{
                                                                                            padding: "5px 12px", fontSize: 10, fontWeight: 700,
                                                                                            background: "rgba(239,68,68,0.1)",
                                                                                            border: "1px solid rgba(239,68,68,0.2)",
                                                                                            borderRadius: 8, color: "#fca5a5",
                                                                                            cursor: "pointer"
                                                                                        }}>
                                                                                        ❌ Reject
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* AI result summary */}
                                                        {lead.ai_result && (
                                                            <div style={{
                                                                marginTop: 12, padding: "10px 14px",
                                                                background: "rgba(255,255,255,0.02)",
                                                                border: "1px solid rgba(255,255,255,0.06)",
                                                                borderRadius: 10, display: "flex", gap: 20
                                                            }}>
                                                                <div style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: 2,
                                                                    textTransform: "uppercase", color: "rgba(148,163,184,0.3)",
                                                                    display: "flex", flexDirection: "column", gap: 4
                                                                }}>
                                                                    <span>AI Verdict</span>
                                                                    <span style={{ color: lead.ai_result.prediction === 1 ? "#86efac" : "#fde68a", fontSize: 11, fontWeight: 700 }}>
                                                                        {lead.ai_result.prediction === 1 ? "✅ Likely Approved" : "⚠️ Needs Review"}
                                                                    </span>
                                                                </div>
                                                                <div style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: 2,
                                                                    textTransform: "uppercase", color: "rgba(148,163,184,0.3)",
                                                                    display: "flex", flexDirection: "column", gap: 4
                                                                }}>
                                                                    <span>Risk Level</span>
                                                                    <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700 }}>
                                                                        {lead.ai_result.risk_level || "—"}
                                                                    </span>
                                                                </div>
                                                                <div style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: 2,
                                                                    textTransform: "uppercase", color: "rgba(148,163,184,0.3)",
                                                                    display: "flex", flexDirection: "column", gap: 4
                                                                }}>
                                                                    <span>Probability</span>
                                                                    <span style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700 }}>
                                                                        {lead.ai_result.probability != null ? `${(lead.ai_result.probability * 100).toFixed(1)}%` : "—"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                </div >
            </div >
        </>
    );
}
