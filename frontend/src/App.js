import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
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

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-900 mb-1">LoanGuard MLOps</h1>
            <p className="text-gray-600">Advanced Loan Risk Prediction & Management Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-200'
              : role === 'MANAGER' ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-green-50 text-green-600 border-green-200'
              }`}>{role} — {userName}</span>
            <Link
              to="/check"
              target="_blank"
              className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors border border-indigo-200 px-4 py-2 rounded-lg"
            >
              🔍 Eligibility Checker
            </Link>
            <button
              onClick={() => {
                const prompt = window.__pwaInstallPrompt;
                if (prompt) { prompt.prompt(); prompt.userChoice.then(() => { window.__pwaInstallPrompt = null; }); }
                else alert("Open in Chrome/Edge on desktop or Android to get the Install prompt.");
              }}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors border border-emerald-200 hover:border-emerald-400 px-4 py-2 rounded-lg"
              title="Install LoanGuard as an app"
            >
              📲 Install App
            </button>
            <button
              onClick={onLogout}
              className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all -mb-px border ${activeTab === tab.id
                ? "bg-white border-gray-200 border-b-white text-indigo-700 shadow-sm"
                : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
            >
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
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Application Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(formData).map((key) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-600 mb-1">
                        {key === 'ApplicantIncome' ? 'Applicant Income (₹/mo)'
                          : key === 'CoapplicantIncome' ? 'Coapplicant Income (₹/mo)'
                            : key === 'LoanAmount' ? 'Loan Amount (₹)'
                              : key === 'Loan_Amount_Term' ? 'Loan Term (months)'
                                : key.replace(/_/g, " ")}
                      </label>
                      {key in selectOptions ? (
                        <select
                          name={key}
                          value={formData[key]}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        >
                          {key === "Credit_History"
                            ? selectOptions[key].map(o => <option key={o.v} value={o.v}>{o.label}</option>)
                            : selectOptions[key].map(o => <option key={o} value={o}>{o}</option>)
                          }
                        </select>
                      ) : (
                        <input
                          type="number"
                          name={key}
                          value={formData[key]}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-xl hover:from-indigo-500 hover:to-blue-500 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {loading ? "Analyzing..." : "Predict Loan Risk"}
                </button>
              </div>

              {/* Result + Stats */}
              <div className="flex flex-col gap-6">
                {/* Result Card */}
                {result && (
                  <div className={`bg-white rounded-xl shadow-md p-8 border ${result.prediction === 1 ? 'border-green-200' : 'border-red-200'}`}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Prediction Result</h2>
                    <div className={`text-3xl font-black mb-2 ${result.prediction === 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.prediction === 1 ? '✅ Approved' : '❌ Rejected'}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-semibold">Probability:</span> {(result.probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      <span className="font-semibold">Risk Level:</span> {result.risk_level}
                    </p>

                    {result.shap_explanation && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Key Risk Factors</p>
                        <div className="space-y-2">
                          {Object.entries(result.shap_explanation).map(([feat, val]) => (
                            <div key={feat} className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{feat.replace(/_/g, " ")}</span>
                              <span className={`text-xs font-bold ${val > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {val > 0 ? "▲" : "▼"} {Math.abs(val).toFixed(3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats + Pie Chart */}
                {stats && (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Application Stats</h2>
                    <p className="text-sm text-gray-500 mb-4">Total: <span className="font-bold text-gray-800">{stats.total_applications}</span></p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Application History */}
            <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Application History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Gender</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Income</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Result</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Risk</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-700 font-medium">#{app.id}</td>
                        <td className="px-6 py-4 text-gray-600">{app.gender}</td>
                        <td className="px-6 py-4 text-gray-600">₹{app.applicant_income?.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.prediction === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {app.prediction === 1 ? 'Approved' : 'Rejected'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${app.risk_level === 'Low Risk' ? 'text-green-600' : app.risk_level === 'High Risk' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {app.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={async () => {
                              try {
                                const res = await axios.get(
                                  `${API_BASE}/report/${app.id}`,
                                  {
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: "blob",
                                  }
                                );
                                const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", `LoanGuard_Report_${app.id}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (e) {
                                alert("Failed to download PDF. Please try again.");
                              }
                            }}
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors underline-offset-2 hover:underline"
                          >
                            📄 PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("lg_token"));

  const handleLogin = (t) => setToken(t);

  const handleLogout = () => {
    localStorage.removeItem("lg_token");
    setToken(null);
    // toast works from ToastContainer inside Dashboard; for login page show nothing
  };

  return (
    <>
      <Routes>
        <Route path="/check" element={<EligibilityChecker />} />
        <Route
          path="/login"
          element={
            token
              ? <Navigate to="/" replace />
              : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/"
          element={
            token
              ? <Dashboard token={token} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
