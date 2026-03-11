import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./Login";
import Home from "./pages/Home";
import EligibilityChecker from "./pages/EligibilityChecker";
import Analytics from "./pages/Analytics";
import BatchUpload from "./pages/BatchUpload";
import AdminPanel from "./pages/AdminPanel";
import LoanChatBot from "./components/LoanChatBot";

const API_BASE = "http://127.0.0.1:5000";

const selectOptions = {
  Gender: ["Male", "Female"], Married: ["Yes", "No"],
  Dependents: ["0", "1", "2", "3+"], Education: ["Graduate", "Not Graduate"],
  Self_Employed: ["Yes", "No"],
  Credit_History: [
    { label: "1 — Has Credit History", v: 1 },
    { label: "0 — No Credit History", v: 0 },
  ],
  Property_Area: ["Urban", "Semiurban", "Rural"],
};

const numericFields = ["ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term", "Credit_History"];

/* ── Global dark dashboard CSS ── */
const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  body { background:#070711; font-family:'Inter','Segoe UI',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0a0a12;} ::-webkit-scrollbar-thumb{background:#7c4dff;border-radius:2px;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes pulseGlow{0%,100%{box-shadow:0 0 16px rgba(124,77,255,0.35);}50%{box-shadow:0 0 36px rgba(124,77,255,0.7);}}
  .dash-fade{animation:fadeIn 0.5s cubic-bezier(.16,1,.3,1) both;}
  .gradient-text{background:linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

  /* Dark inputs / selects */
  .d-input,.d-select{
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
    border-radius:10px;padding:9px 12px;color:#e2e8f0;font-size:12px;
    outline:none;width:100%;font-family:'Inter',sans-serif;transition:border-color 0.2s;
  }
  .d-input::placeholder{color:rgba(148,163,184,0.35);}
  .d-input:focus,.d-select:focus{border-color:rgba(124,77,255,0.5);box-shadow:0 0 0 2px rgba(124,77,255,0.1);}
  .d-select{appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(148,163,184,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 10px center;background-size:13px;cursor:pointer;
  }
  .d-select option{background:#1a1a2e;color:#e2e8f0;}
  .d-status-select{
    appearance:none;background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:8px;padding:5px 26px 5px 10px;color:#e2e8f0;font-size:11px;font-weight:600;
    outline:none;font-family:'Inter',sans-serif;cursor:pointer;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(148,163,184,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 6px center;background-size:11px;
  }
  .d-status-select option{background:#1a1a2e;color:#e2e8f0;}

  /* Sidebar nav */
  .sb-nav{
    width:100%;display:flex;align-items:center;gap:12px;padding:11px 16px;
    background:transparent;border:none;border-radius:12px;cursor:pointer;
    color:rgba(148,163,184,0.55);font-size:13px;font-weight:600;text-align:left;
    transition:all 0.2s;font-family:'Inter',sans-serif;
  }
  .sb-nav:hover{background:rgba(255,255,255,0.04);color:rgba(148,163,184,0.85);}
  .sb-nav.active{background:rgba(124,77,255,0.15);color:#c4b5fd;border:1px solid rgba(124,77,255,0.25);}
  .sb-nav.active svg{color:#a78bfa;}

  /* Table */
  .dtable{width:100%;border-collapse:collapse;min-width:600px;}
  .dtable th{padding:10px 14px;text-align:left;font-size:9px;font-weight:800;letter-spacing:2px;
    text-transform:uppercase;color:rgba(148,163,184,0.35);
    border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.015);}
  .dtable td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,0.04);
    font-size:12px;color:rgba(148,163,184,0.8);vertical-align:middle;}
  .dtable tr:hover td{background:rgba(255,255,255,0.02);}

  /* Risk badges */
  .rb-low{background:rgba(34,197,94,0.1);color:#86efac;border:1px solid rgba(34,197,94,0.2);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .rb-high{background:rgba(239,68,68,0.1);color:#fca5a5;border:1px solid rgba(239,68,68,0.2);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .rb-med{background:rgba(245,158,11,0.1);color:#fde68a;border:1px solid rgba(245,158,11,0.2);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .sb-approved{background:rgba(34,197,94,0.1);color:#86efac;border:1px solid rgba(34,197,94,0.2);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .sb-rejected{background:rgba(239,68,68,0.1);color:#fca5a5;border:1px solid rgba(239,68,68,0.2);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .sb-pending{background:rgba(148,163,184,0.1);color:rgba(148,163,184,0.7);border:1px solid rgba(148,163,184,0.15);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .sb-review{background:rgba(245,158,11,0.1);color:#fde68a;border:1px solid rgba(245,158,11,0.2);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
`;

function Dashboard({ token, onLogout }) {
  const decodeRole = (tok) => {
    try { return JSON.parse(atob(tok.split(".")[1])).role || "OFFICER"; }
    catch { return "OFFICER"; }
  };
  const decodeName = (tok) => {
    try { return JSON.parse(atob(tok.split(".")[1])).name || "User"; }
    catch { return "User"; }
  };
  const role = decodeRole(token);
  const userName = decodeName(token);

  const [formData, setFormData] = useState({
    ApplicantName: "", Gender: "Male", Married: "Yes", Dependents: "0",
    Education: "Graduate", Self_Employed: "No",
    ApplicantIncome: 5000, CoapplicantIncome: 0,
    LoanAmount: 120000, Loan_Amount_Term: 360,
    Credit_History: 1, Property_Area: "Urban",
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("predict");
  const [search, setSearch] = useState("");
  const [filterPrediction, setFilterPrediction] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/applications/${appId}/status`, { status: newStatus }, authHeaders);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (e) { toast.error(e.response?.data?.error || "Failed to update status"); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numVal = numericFields.includes(name) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: numVal }));
    let err = "";
    if (name === "ApplicantName" && !value.trim()) err = "Name is required.";
    else if (name === "ApplicantIncome" && numVal <= 0) err = "Must be > 0.";
    else if (name === "LoanAmount" && numVal <= 0) err = "Must be > 0.";
    else if (name === "Loan_Amount_Term" && (numVal < 12 || numVal > 360)) err = "Input 12 to 360 months.";
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/predict`, formData, authHeaders);
      setResult(response.data); fetchApplications(); fetchStats();
      toast.success("Application evaluated successfully!");
    } catch (error) {
      if (error.response?.status === 401) onLogout();
      else toast.error(error.response?.data?.error || "Server error");
    } finally { setLoading(false); }
  };

  const fetchApplications = async () => {
    try { const res = await axios.get(`${API_BASE}/applications`, authHeaders); setApplications(res.data); }
    catch (e) { if (e.response?.status === 401) onLogout(); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`, authHeaders);
      const driftRes = await axios.get(`${API_BASE}/drift-status`, authHeaders).catch(() => ({}));
      const auditRes = await axios.get(`${API_BASE}/audit`, authHeaders).catch(() => []);
      setStats({
        total_applications: res.data?.total_applications ?? 0,
        approved: res.data?.approved ?? 0,
        rejected: res.data?.rejected ?? 0,
        modelAccuracy7d: driftRes.data?.accuracy_7d ?? null,
        audit_count: Array.isArray(auditRes.data) ? auditRes.data.length : Array.isArray(auditRes) ? auditRes.length : 0,
      });
    } catch (e) { if (e.response?.status === 401) onLogout(); }
  };

  useEffect(() => { fetchApplications(); fetchStats(); }, []);

  const pieData = stats ? [
    { name: "Approved", value: stats.approved, color: "#22c55e" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" },
  ] : [];

  const tabs = [
    { id: "predict", label: "Dashboard", icon: "📊", roles: ["OFFICER", "MANAGER", "ADMIN"] },
    { id: "analytics", label: "Analytics", icon: "📈", roles: ["MANAGER", "ADMIN"] },
    { id: "batch", label: "Batch Processing", icon: "⚡", roles: ["MANAGER", "ADMIN"] },
    { id: "admin", label: "User Management", icon: "🛡️", roles: ["ADMIN"] },
  ].filter(t => t.roles.includes(role));

  const ROLE_COLOR = { ADMIN: "#a78bfa", MANAGER: "#fde68a", OFFICER: "#86efac" };

  const panelCard = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
  };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden", background: "#070711",
      fontFamily: "'Inter',sans-serif", color: "#e2e8f0", position: "relative"
    }}>
      <style>{DASH_CSS}</style>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "rgba(10,10,20,0.9)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        transition: "width 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{
          height: 64, display: "flex", alignItems: "center", gap: 12,
          padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "white", fontSize: 13, flexShrink: 0,
            animation: "pulseGlow 3s ease-in-out infinite"
          }}>LG</div>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
            LoanGuard <span className="gradient-text">AI</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`sb-nav ${activeTab === t.id ? "active" : ""}`}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ whiteSpace: "nowrap" }}>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={onLogout} className="sb-nav" style={{ color: "rgba(239,68,68,0.6)" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(239,68,68,0.9)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(239,68,68,0.6)"}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <header style={{
          height: 64, flexShrink: 0,
          background: "rgba(10,10,20,0.85)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: "rgba(148,163,184,0.5)", cursor: "pointer", padding: 4 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 100, padding: "6px 16px 6px 6px"
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 12, color: "white", flexShrink: 0
              }}>
                {userName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>{userName}</div>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                  color: ROLE_COLOR[role] || "#e2e8f0", textTransform: "uppercase", marginTop: 2
                }}>{role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }} className="dash-fade">

            {activeTab === "analytics" && <Analytics token={token} />}
            {activeTab === "batch" && <BatchUpload token={token} />}
            {activeTab === "admin" && <AdminPanel token={token} />}

            {activeTab === "predict" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Link to="/check" target="_blank" style={{
                    padding: "8px 18px", background: "rgba(124,77,255,0.1)",
                    border: "1px solid rgba(124,77,255,0.25)", borderRadius: 100,
                    color: "#a78bfa", fontSize: 12, fontWeight: 700, textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,77,255,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,77,255,0.1)"; }}>
                    🔗 Test Public Portal
                  </Link>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                  {[
                    { label: "Total Applications", val: stats?.total_applications?.toLocaleString() || "—", icon: "📁", color: "#a78bfa" },
                    { label: "Model Accuracy (7d)", val: stats?.modelAccuracy7d != null ? `${(stats.modelAccuracy7d * 100).toFixed(1)}%` : "—", icon: "🎯", color: "#22c55e" },
                    { label: "Audit Records", val: stats?.audit_count?.toLocaleString() || "—", icon: "📋", color: "#60a5fa" },
                    null,
                  ].map((s, i) => s ? (
                    <div key={i} style={{ ...panelCard, padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                          color: "rgba(148,163,184,0.35)"
                        }}>{s.label}</span>
                        <span style={{ fontSize: 18 }}>{s.icon}</span>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {s.val}
                      </div>
                    </div>
                  ) : (
                    <div key={i} style={{
                      ...panelCard, padding: "18px 20px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                      onClick={() => setActiveTab("admin")}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,77,255,0.3)"; e.currentTarget.style.background = "rgba(124,77,255,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}>
                      <span style={{ color: "rgba(124,77,255,0.7)", fontSize: 13, fontWeight: 700 }}>
                        🛡️ Manage Users →
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stats Pie + Form + Table */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
                  {/* Left column: Form + Result */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Approval Pie */}
                    {stats && (stats.approved > 0 || stats.rejected > 0) && (
                      <div style={{ ...panelCard, padding: 20 }}>
                        <div style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(148,163,184,0.35)",
                          textTransform: "uppercase", marginBottom: 14
                        }}>Approval Ratio</div>
                        <ResponsiveContainer width="100%" height={140}>
                          <PieChart>
                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                              innerRadius={38} outerRadius={60} paddingAngle={4}>
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#e2e8f0" }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                          {pieData.map(d => (
                            <div key={d.name} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "rgba(148,163,184,0.4)", letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{d.name}</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: d.color, fontFamily: "'Space Grotesk',sans-serif" }}>{d.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Applicant Form */}
                    <div style={{ ...panelCard, padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Applicant Details</div>
                      <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginBottom: 18 }}>
                        Perform an on-the-spot prediction scan.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Object.keys(formData).map(key => (
                          <div key={key}>
                            <label style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                              color: "rgba(148,163,184,0.4)", display: "block", marginBottom: 7
                            }}>
                              {key === "ApplicantIncome" ? "Monthly Income (₹)" : key === "CoapplicantIncome" ? "Co-app Income (₹)" :
                                key === "LoanAmount" ? "Loan Amount (₹)" : key === "Loan_Amount_Term" ? "Term (months)" : key.replace(/_/g, " ")}
                            </label>
                            {key === "ApplicantName" ? (
                              <input type="text" name={key} value={formData[key]} onChange={handleChange}
                                placeholder="e.g. John Doe" className="d-input"
                                style={errors[key] ? { borderColor: "rgba(239,68,68,0.4)" } : {}} />
                            ) : key in selectOptions ? (
                              <select name={key} value={formData[key]} onChange={handleChange} className="d-select">
                                {key === "Credit_History"
                                  ? selectOptions[key].map(o => <option key={o.v} value={o.v}>{o.label}</option>)
                                  : selectOptions[key].map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : (
                              <input type="number" name={key} value={formData[key]} onChange={handleChange}
                                className="d-input"
                                style={errors[key] ? { borderColor: "rgba(239,68,68,0.4)" } : {}} />
                            )}
                            {errors[key] && <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 600, marginTop: 4 }}>{errors[key]}</div>}
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSubmit}
                        disabled={loading || Object.values(errors).some(e => e)}
                        style={{
                          width: "100%", marginTop: 16, padding: "13px", border: "none",
                          borderRadius: 12, fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
                          cursor: loading || Object.values(errors).some(e => e) ? "not-allowed" : "pointer",
                          background: loading || Object.values(errors).some(e => e)
                            ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#7c4dff,#3b82f6)",
                          color: loading || Object.values(errors).some(e => e) ? "rgba(148,163,184,0.3)" : "white",
                          boxShadow: loading || Object.values(errors).some(e => e) ? "none" : "0 6px 24px rgba(124,77,255,0.4)",
                          transition: "all 0.2s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        }}>
                        {loading ? (
                          <>
                            <span style={{
                              width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)",
                              borderTop: "2px solid white", borderRadius: "50%", display: "inline-block",
                              animation: "spin 1s linear infinite"
                            }} />
                            Analyzing...
                          </>
                        ) : "⚡ Evaluate Applicant →"}
                      </button>

                      {/* Mini result */}
                      {result && (
                        <div style={{
                          marginTop: 16, padding: 16, borderRadius: 14,
                          background: result.prediction === 1 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                          border: `1px solid ${result.prediction === 1 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                        }}>
                          <div style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                            color: "rgba(148,163,184,0.4)", marginBottom: 6
                          }}>Prediction</div>
                          <div style={{
                            fontSize: 22, fontWeight: 900, marginBottom: 10,
                            color: result.prediction === 1 ? "#4ade80" : "#f87171"
                          }}>
                            {result.prediction === 1 ? "✅ Approved" : "❌ Rejected"}
                          </div>
                          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                            <div style={{
                              height: "100%", borderRadius: 4,
                              width: `${(result.probability * 100).toFixed(0)}%`,
                              background: result.prediction === 1 ? "#22c55e" : "#ef4444",
                              transition: "width 1s ease"
                            }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(148,163,184,0.5)", fontWeight: 700 }}>
                            <span>Confidence: {(result.probability * 100).toFixed(1)}%</span>
                            <span>{result.risk_level}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Applications Table */}
                  <div style={{ ...panelCard, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* Filters */}
                    <div style={{
                      padding: 14, borderBottom: "1px solid rgba(255,255,255,0.05)",
                      display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
                      background: "rgba(255,255,255,0.01)"
                    }}>
                      <input type="text" placeholder="🔍  Search..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="d-input" style={{ flex: 1, minWidth: 150, maxWidth: 200 }} />
                      <select value={filterPrediction} onChange={e => setFilterPrediction(e.target.value)} className="d-select" style={{ width: 110 }}>
                        <option value="all">Result</option>
                        <option value="1">Approved</option>
                        <option value="0">Rejected</option>
                      </select>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="d-select" style={{ width: 130 }}>
                        <option value="all">Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="d-select" style={{ width: 110 }}>
                        <option value="all">Risk</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button onClick={() => { setSearch(""); setFilterPrediction("all"); setFilterStatus("all"); setFilterRisk("all"); }}
                        style={{
                          padding: "8px 14px", background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
                          color: "rgba(148,163,184,0.6)", fontSize: 11, fontWeight: 700, cursor: "pointer"
                        }}>
                        Reset
                      </button>
                    </div>

                    {/* Table */}
                    <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
                      <table className="dtable">
                        <thead>
                          <tr>
                            <th>ID</th><th>Name</th><th>Income</th><th>Risk</th><th>Status</th><th>Report</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.filter(a => {
                            const q = search.toLowerCase();
                            const matchSearch = !q || String(a.id).includes(q) || (a.applicant_name || "").toLowerCase().includes(q);
                            const matchPred = filterPrediction === "all" || String(a.prediction) === filterPrediction;
                            const matchStatus = filterStatus === "all" || (a.status || "Pending") === filterStatus;
                            const matchRisk = filterRisk === "all" || (a.risk_level || "").toLowerCase().startsWith(filterRisk);
                            return matchSearch && matchPred && matchStatus && matchRisk;
                          }).map(app => (
                            <tr key={app.id}>
                              <td style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.35)" }}>
                                #{String(app.id).padStart(3, "0")}
                              </td>
                              <td style={{ fontWeight: 700, color: "#f1f5f9" }}>{app.applicant_name || "—"}</td>
                              <td style={{ fontFamily: "monospace", fontSize: 11 }}>
                                ₹{app.applicant_income?.toLocaleString()}
                              </td>
                              <td>
                                <span className={
                                  app.risk_level === "Low Risk" ? "rb-low" :
                                    app.risk_level === "High Risk" ? "rb-high" : "rb-med"}>
                                  {app.risk_level || "N/A"}
                                </span>
                              </td>
                              <td>
                                {role === "MANAGER" || role === "ADMIN" ? (
                                  <select value={app.status || "Pending"}
                                    onChange={e => updateStatus(app.id, e.target.value)}
                                    className="d-status-select"
                                    style={{
                                      background: (app.status || "Pending") === "Approved" ? "rgba(34,197,94,0.1)" :
                                        (app.status || "Pending") === "Rejected" ? "rgba(239,68,68,0.1)" :
                                          (app.status || "Pending") === "Under Review" ? "rgba(245,158,11,0.1)" : "rgba(148,163,184,0.08)",
                                      color: (app.status || "Pending") === "Approved" ? "#86efac" :
                                        (app.status || "Pending") === "Rejected" ? "#fca5a5" :
                                          (app.status || "Pending") === "Under Review" ? "#fde68a" : "rgba(148,163,184,0.6)",
                                    }}>
                                    {["Pending", "Under Review", "Approved", "Rejected"].map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className={
                                    app.status === "Approved" ? "sb-approved" :
                                      app.status === "Rejected" ? "sb-rejected" :
                                        app.status === "Under Review" ? "sb-review" : "sb-pending"}>
                                    {app.status || "Pending"}
                                  </span>
                                )}
                              </td>
                              <td>
                                <button onClick={async () => {
                                  try {
                                    const res = await axios.get(`${API_BASE}/report/${app.id}`, {
                                      headers: { Authorization: `Bearer ${token}` }, responseType: "blob"
                                    });
                                    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                                    const link = document.createElement("a");
                                    link.href = url; link.setAttribute("download", `LoanGuard_Report_${app.id}.pdf`);
                                    document.body.appendChild(link); link.click(); link.remove();
                                    window.URL.revokeObjectURL(url);
                                  } catch (e) { alert("Failed to download PDF."); }
                                }} style={{
                                  padding: "5px 12px", background: "rgba(59,130,246,0.1)",
                                  border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8,
                                  color: "#60a5fa", fontSize: 10, fontWeight: 700, cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.2)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}>
                                  PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                          {applications.length === 0 && (
                            <tr>
                              <td colSpan="6" style={{
                                textAlign: "center", padding: "48px 0",
                                color: "rgba(148,163,184,0.3)", fontSize: 13
                              }}>
                                No applications found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <LoanChatBot />
    </div>
  );
}

function getValidToken() {
  const t = localStorage.getItem("lg_token");
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem("lg_token");
      return null;
    }
    return t;
  } catch {
    localStorage.removeItem("lg_token");
    return null;
  }
}

function App() {
  const [token, setToken] = useState(getValidToken);
  const handleLogin = (t) => setToken(t);
  const handleLogout = () => { localStorage.removeItem("lg_token"); setToken(null); };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && token) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`http://127.0.0.1:5000/refresh`, {}, { headers: { Authorization: `Bearer ${token}` } });
            const newToken = res.data.token;
            localStorage.setItem("lg_token", newToken); setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) { localStorage.removeItem("lg_token"); setToken(null); return Promise.reject(refreshError); }
        }
        if (error.response?.status === 401) { localStorage.removeItem("lg_token"); setToken(null); }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const timeToExpiry = payload.exp * 1000 - Date.now();
      const refreshTime = timeToExpiry - 5 * 60 * 1000;
      if (refreshTime > 0) {
        const timer = setTimeout(async () => {
          try {
            const res = await axios.post(`http://127.0.0.1:5000/refresh`, {}, { headers: { Authorization: `Bearer ${token}` } });
            const newToken = res.data.token;
            localStorage.setItem("lg_token", newToken); setToken(newToken);
          } catch (e) { handleLogout(); }
        }, refreshTime);
        return () => clearTimeout(timer);
      }
    } catch (e) { }
  }, [token]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check" element={<EligibilityChecker />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
