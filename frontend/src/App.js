import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import Home from './pages/Home';
import EligibilityChecker from './pages/EligibilityChecker';
import Analytics from './pages/Analytics';
import BatchUpload from './pages/BatchUpload';
import AdminPanel from './pages/AdminPanel';

const API_BASE = "http://127.0.0.1:5000";

const selectOptions = {
  Gender: ["Male", "Female"],
  Married: ["Yes", "No"],
  Dependents: ["0", "1", "2", "3+"],
  Education: ["Graduate", "Not Graduate"],
  Self_Employed: ["Yes", "No"],
  Credit_History: [{ label: "1 — Has Credit History", v: 1 }, { label: "0 — No Credit History", v: 0 }],
  Property_Area: ["Urban", "Semiurban", "Rural"],
};

const numericFields = ["ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term", "Credit_History"];

function Dashboard({ token, onLogout }) {
  // Decode role from JWT payload
  const decodeRole = (tok) => {
    try { return JSON.parse(atob(tok.split('.')[1])).role || 'OFFICER'; }
    catch { return 'OFFICER'; }
  };
  const decodeName = (tok) => {
    try { return JSON.parse(atob(tok.split('.')[1])).name || 'User'; }
    catch { return 'User'; }
  };
  const role = decodeRole(token);
  const userName = decodeName(token);

  const [formData, setFormData] = useState({
    ApplicantName: "",
    Gender: "Male", Married: "Yes", Dependents: "0",
    Education: "Graduate", Self_Employed: "No",
    ApplicantIncome: 5000, CoapplicantIncome: 0,
    LoanAmount: 120000, Loan_Amount_Term: 360,
    Credit_History: 1, Property_Area: "Urban",
  });

  const [result, setResult] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('predict');

  // Search & filter state
  const [search, setSearch] = useState("");
  const [filterPrediction, setFilterPrediction] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/applications/${appId}/status`, { status: newStatus }, authHeaders);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(`✅ Status updated to "${newStatus}"`);
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || "Failed to update status"}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: numericFields.includes(name) ? Number(value) : value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/predict`, formData, authHeaders);
      setResult(response.data);
      fetchApplications();
      fetchStats();
      toast.success("✅ Application evaluated successfully!");
    } catch (error) {
      if (error.response?.status === 401) onLogout();
      else toast.error(`❌ ${error.response?.data?.error || "Server error"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applications`, authHeaders);
      setApplications(res.data);
    } catch (e) {
      if (e.response?.status === 401) onLogout();
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`, authHeaders);
      setStats(res.data);
    } catch (e) {
      if (e.response?.status === 401) onLogout();
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const pieData = stats ? [
    { name: 'Approved', value: stats.approved, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
  ] : [];

  // Role-gated tabs
  const tabs = [
    { id: 'predict', label: '📋 Predict', roles: ['OFFICER', 'MANAGER', 'ADMIN'] },
    { id: 'analytics', label: '📊 Analytics', roles: ['MANAGER', 'ADMIN'] },
    { id: 'batch', label: '📂 Batch Upload', roles: ['MANAGER', 'ADMIN'] },
    { id: 'admin', label: '⚙️ Admin Panel', roles: ['ADMIN'] },
  ].filter(t => t.roles.includes(role));

  return (
    <div className="min-h-screen mesh-bg py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="glass-strong rounded-2xl px-6 py-4 mb-6 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/30">
              LG
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">LoanGuard MLOps</h1>
              <p className="text-white/30 text-xs">Loan Risk Prediction Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>{role} — {userName}</span>
            <Link to="/check" target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20 hover:border-indigo-500/40 px-3 py-1.5 rounded-xl">
              🔍 Eligibility
            </Link>
            <button
              onClick={() => { const p = window.__pwaInstallPrompt; if (p) { p.prompt(); p.userChoice.then(() => { window.__pwaInstallPrompt = null; }); } }}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-xl"
            >📲 Install</button>
            <button onClick={onLogout}
              className="text-xs font-bold text-white/30 hover:text-red-400 transition-colors border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-xl">
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in delay-100">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'glass border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && <Analytics token={token} />}

        {/* Tab: Batch Upload */}
        {activeTab === 'batch' && <BatchUpload token={token} />}

        {/* Tab: Admin Panel (ADMIN only) */}
        {activeTab === 'admin' && <AdminPanel token={token} />}

        {/* Tab: Predict */}
        {activeTab === 'predict' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 glass-strong rounded-2xl p-8 border border-white/10 card-shine">
                <h2 className="text-xl font-black text-white mb-6">📋 Application Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.keys(formData).map((key) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest mb-1.5">
                        {key === 'ApplicantName' ? 'Applicant Full Name'
                          : key === 'ApplicantIncome' ? 'Applicant Income (₹/mo)'
                            : key === 'CoapplicantIncome' ? 'Coapplicant Income (₹/mo)'
                              : key === 'LoanAmount' ? 'Loan Amount (₹)'
                                : key === 'Loan_Amount_Term' ? 'Loan Term (months)'
                                  : key.replace(/_/g, " ")}
                      </label>
                      {key === 'ApplicantName' ? (
                        <input type="text" name={key} value={formData[key]} onChange={handleChange}
                          placeholder="e.g. Ravi Kumar"
                          className="input-glow glass border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none transition-all" />
                      ) : key in selectOptions ? (
                        <select name={key} value={formData[key]} onChange={handleChange}
                          className="input-glow glass border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-all bg-transparent">
                          {key === "Credit_History"
                            ? selectOptions[key].map(o => <option key={o.v} value={o.v} className="bg-slate-800">{o.label}</option>)
                            : selectOptions[key].map(o => <option key={o} value={o} className="bg-slate-800">{o}</option>)}
                        </select>
                      ) : (
                        <input type="number" name={key} value={formData[key]} onChange={handleChange}
                          className="input-glow glass border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-all" />
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className="btn-glow mt-8 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-40 uppercase tracking-widest flex items-center justify-center gap-2">
                  {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Analyzing...</>) : "⚡ Predict Loan Risk"}
                </button>
              </div>

              {/* Result + Stats */}
              <div className="flex flex-col gap-5">
                {result && (
                  <div className={`animate-scale-in glass-strong rounded-2xl p-6 border ${result.prediction === 1 ? 'border-emerald-500/30' : 'border-red-500/30'
                    }`}>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Prediction Result</p>
                    <div className={`text-3xl font-black mb-2 ${result.prediction === 1 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                      {result.prediction === 1 ? '✅ Approved' : '❌ Rejected'}
                    </div>
                    <div className="h-2 rounded-full bg-white/10 mb-3">
                      <div className="h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(result.probability * 100).toFixed(0)}%`, background: result.prediction === 1 ? '#10b981' : '#ef4444' }} />
                    </div>
                    <p className="text-white/50 text-xs mb-1"><span className="font-bold text-white/70">Probability:</span> {(result.probability * 100).toFixed(1)}%</p>
                    <p className="text-white/50 text-xs"><span className="font-bold text-white/70">Risk:</span> {result.risk_level}</p>
                  </div>
                )}
                {stats && (
                  <div className="glass-strong rounded-2xl p-5 border border-white/10">
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Application Stats · <span className="text-white/50">{stats.total_applications} total</span></p>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e2132', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Application History */}
            <div className="mt-6 glass-strong rounded-2xl overflow-hidden border border-white/10">
              <div className="px-6 py-5 border-b border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">📋 Application History</h2>
                  <span className="text-sm text-gray-400">
                    {(() => {
                      const filtered = applications.filter(a => {
                        const q = search.toLowerCase();
                        const matchSearch = !q || String(a.id).includes(q) || (a.applicant_name || "").toLowerCase().includes(q) || (a.gender || "").toLowerCase().includes(q);
                        const matchPred = filterPrediction === "all" || String(a.prediction) === filterPrediction;
                        const matchRisk = filterRisk === "all" || (a.risk_level || "").toLowerCase().startsWith(filterRisk);
                        const matchStatus = filterStatus === "all" || (a.status || "Pending") === filterStatus;
                        return matchSearch && matchPred && matchRisk && matchStatus;
                      });
                      return `Showing ${filtered.length} of ${applications.length}`;
                    })()}
                  </span>
                </div>
                {/* Search + Filters */}
                <div className="flex flex-wrap gap-2">
                  <input type="text" placeholder="Search by name or ID..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="input-glow glass border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none transition-all w-48" />
                  <select value={filterPrediction} onChange={e => setFilterPrediction(e.target.value)}
                    className="glass border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none bg-transparent">
                    <option value="all" className="bg-slate-800">All Results</option>
                    <option value="1" className="bg-slate-800">Approved</option>
                    <option value="0" className="bg-slate-800">Rejected</option>
                  </select>
                  <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
                    className="glass border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none bg-transparent">
                    <option value="all" className="bg-slate-800">All Risk</option>
                    <option value="low" className="bg-slate-800">Low Risk</option>
                    <option value="medium" className="bg-slate-800">Medium Risk</option>
                    <option value="high" className="bg-slate-800">High Risk</option>
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="glass border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none bg-transparent">
                    <option value="all" className="bg-slate-800">All Statuses</option>
                    <option value="Pending" className="bg-slate-800">Pending</option>
                    <option value="Under Review" className="bg-slate-800">Under Review</option>
                    <option value="Approved" className="bg-slate-800">Approved</option>
                    <option value="Rejected" className="bg-slate-800">Rejected</option>
                  </select>
                  {(search || filterPrediction !== "all" || filterRisk !== "all" || filterStatus !== "all") && (
                    <button onClick={() => { setSearch(""); setFilterPrediction("all"); setFilterRisk("all"); setFilterStatus("all"); }}
                      className="text-xs text-white/30 hover:text-red-400 transition-colors px-2">✕ Clear</button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['ID', 'Name', 'Income', 'Result', 'Risk', 'Status', 'Report'].map(h => (
                        <th key={h} className="px-5 py-3 text-[10px] font-black text-white/30 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {applications
                      .filter(a => {
                        const q = search.toLowerCase();
                        const matchSearch = !q || String(a.id).includes(q) || (a.applicant_name || "").toLowerCase().includes(q) || (a.gender || "").toLowerCase().includes(q);
                        const matchPred = filterPrediction === "all" || String(a.prediction) === filterPrediction;
                        const matchRisk = filterRisk === "all" || (a.risk_level || "").toLowerCase().startsWith(filterRisk);
                        const matchStatus = filterStatus === "all" || (a.status || "Pending") === filterStatus;
                        return matchSearch && matchPred && matchRisk && matchStatus;
                      })
                      .map((app) => (
                        <tr key={app.id} className="table-row-hover">
                          <td className="px-5 py-3.5 text-white/40 font-mono text-xs">#{app.id}</td>
                          <td className="px-5 py-3.5 text-white font-semibold text-sm">{app.applicant_name || <span className="text-white/20 italic">—</span>}</td>
                          <td className="px-5 py-3.5 text-white/60 text-sm">₹{app.applicant_income?.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${app.prediction === 1 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/15 text-red-400 border border-red-500/20'
                              }`}>{app.prediction === 1 ? 'Approved' : 'Rejected'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold ${app.risk_level === 'Low Risk' ? 'text-emerald-400'
                                : app.risk_level === 'High Risk' ? 'text-red-400' : 'text-amber-400'
                              }`}>{app.risk_level}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {(role === 'MANAGER' || role === 'ADMIN') ? (
                              <select value={app.status || 'Pending'} onChange={e => updateStatus(app.id, e.target.value)}
                                className={`text-[10px] font-black px-2 py-1 rounded-lg border focus:outline-none bg-transparent ${(app.status || 'Pending') === 'Approved' ? 'text-emerald-400 border-emerald-500/30'
                                    : (app.status || 'Pending') === 'Rejected' ? 'text-red-400 border-red-500/30'
                                      : (app.status || 'Pending') === 'Under Review' ? 'text-blue-400 border-blue-500/30'
                                        : 'text-white/40 border-white/10'
                                  }`}>
                                {['Pending', 'Under Review', 'Approved', 'Rejected'].map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                              </select>
                            ) : (
                              <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${(app.status || 'Pending') === 'Approved' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                                  : (app.status || 'Pending') === 'Rejected' ? 'text-red-400 border-red-500/20 bg-red-500/10'
                                    : (app.status || 'Pending') === 'Under Review' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10'
                                      : 'text-white/30 border-white/10 bg-white/5'
                                }`}>{app.status || 'Pending'}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={async () => {
                              try {
                                const res = await axios.get(`${API_BASE}/report/${app.id}`, { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
                                const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                                const link = document.createElement("a");
                                link.href = url; link.setAttribute("download", `LoanGuard_Report_${app.id}.pdf`);
                                document.body.appendChild(link); link.click(); link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (e) { alert("Failed to download PDF."); }
                            }}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
                              📄 PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("lg_token"));
  const handleLogin = (t) => setToken(t);
  const handleLogout = () => { localStorage.removeItem("lg_token"); setToken(null); };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check" element={<EligibilityChecker />} />
        <Route path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/dashboard"
          element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
