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
  Gender: ["Male", "Female"],
  Married: ["Yes", "No"],
  Dependents: ["0", "1", "2", "3+"],
  Education: ["Graduate", "Not Graduate"],
  Self_Employed: ["Yes", "No"],
  Credit_History: [
    { label: "1 — Has Credit History", v: 1 },
    { label: "0 — No Credit History", v: 0 },
  ],
  Property_Area: ["Urban", "Semiurban", "Rural"],
};

const numericFields = [
  "ApplicantIncome",
  "CoapplicantIncome",
  "LoanAmount",
  "Loan_Amount_Term",
  "Credit_History",
];

// Reusable icons
const IconPredict = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconAnalytics = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const IconBatch = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);
const IconAdmin = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    />
  </svg>
);

function Dashboard({ token, onLogout }) {
  // Decode role from JWT payload
  const decodeRole = (tok) => {
    try {
      return JSON.parse(atob(tok.split(".")[1])).role || "OFFICER";
    } catch {
      return "OFFICER";
    }
  };
  const decodeName = (tok) => {
    try {
      return JSON.parse(atob(tok.split(".")[1])).name || "User";
    } catch {
      return "User";
    }
  };
  const role = decodeRole(token);
  const userName = decodeName(token);

  const [formData, setFormData] = useState({
    ApplicantName: "",
    Gender: "Male",
    Married: "Yes",
    Dependents: "0",
    Education: "Graduate",
    Self_Employed: "No",
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 120000,
    Loan_Amount_Term: 360,
    Credit_History: 1,
    Property_Area: "Urban",
  });
  const [errors, setErrors] = useState({});

  const [result, setResult] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("predict");

  // Search & filter state
  const [search, setSearch] = useState("");
  const [filterPrediction, setFilterPrediction] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/applications/${appId}/status`,
        { status: newStatus },
        authHeaders,
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to update status");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numVal = numericFields.includes(name) ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: numVal }));

    let err = "";
    if (name === "ApplicantName" && !value.trim()) err = "Name is required.";
    else if (name === "ApplicantIncome" && numVal <= 0) err = "Must be > 0.";
    else if (name === "LoanAmount" && numVal <= 0) err = "Must be > 0.";
    else if (name === "Loan_Amount_Term" && (numVal < 12 || numVal > 360))
      err = "Input 12 to 360 months.";
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/predict`,
        formData,
        authHeaders,
      );
      setResult(response.data);
      fetchApplications();
      fetchStats();
      toast.success("Application evaluated successfully!");
    } catch (error) {
      if (error.response?.status === 401) onLogout();
      else toast.error(error.response?.data?.error || "Server error");
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
      const driftRes = await axios
        .get(`${API_BASE}/drift-status`, authHeaders)
        .catch(() => ({}));
      const auditRes = await axios
        .get(`${API_BASE}/audit`, authHeaders)
        .catch(() => []);

      setStats({
        total_applications: res.data?.total_applications ?? 0,
        approved: res.data?.approved ?? 0,
        rejected: res.data?.rejected ?? 0,
        modelAccuracy7d: driftRes.data?.accuracy_7d ?? null,
        audit_count: Array.isArray(auditRes.data)
          ? auditRes.data.length
          : Array.isArray(auditRes)
            ? auditRes.length
            : 0,
      });
    } catch (e) {
      if (e.response?.status === 401) onLogout();
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const pieData = stats
    ? [
      { name: "Approved", value: stats.approved, color: "#10B981" },
      { name: "Rejected", value: stats.rejected, color: "#EF4444" },
    ]
    : [];

  const tabs = [
    {
      id: "predict",
      label: "Dashboard",
      icon: IconPredict,
      roles: ["OFFICER", "MANAGER", "ADMIN"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: IconAnalytics,
      roles: ["MANAGER", "ADMIN"],
    },
    {
      id: "batch",
      label: "Batch Processing",
      icon: IconBatch,
      roles: ["MANAGER", "ADMIN"],
    },
    {
      id: "admin",
      label: "User Management",
      icon: IconAdmin,
      roles: ["ADMIN"],
    },
  ].filter((t) => t.roles.includes(role));

  return (
    <div className="flex h-screen overflow-hidden bg-brand-light font-sans text-brand-textMain">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* ── Sidebar ── */}
      <aside
        className={`sidebar w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full fixed z-40 h-full"}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-brand-blue rounded border border-blue-400 flex items-center justify-center font-bold text-white shadow-sm text-xs mr-3">
            LG
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            LoanGuard
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center text-sm font-medium text-slate-500">
              <span className="text-brand-dark font-bold capitalize">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full py-1 pr-4 pl-1 min-w-max">
              <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="flex flex-col max-w-[120px]">
                <span className="text-xs font-bold text-brand-dark leading-none truncate">
                  {userName}
                </span>
                <span className="text-[10px] font-medium text-slate-500 leading-none mt-1">
                  {role}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {activeTab === "analytics" && <Analytics token={token} />}
            {activeTab === "batch" && <BatchUpload token={token} />}
            {activeTab === "admin" && <AdminPanel token={token} />}

            {activeTab === "predict" && (
              <div className="space-y-6">
                <div className="flex items-center justify-end">
                  <Link
                    to="/check"
                    target="_blank"
                    className="btn-secondary text-xs"
                  >
                    Test Public Portal
                  </Link>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="premium-card p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Total Users
                    </p>
                    <p className="text-2xl font-black text-brand-dark mt-1">
                      {stats ? stats.total_applications.toLocaleString() : "—"}
                    </p>
                  </div>
                  <div className="premium-card p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Model Accuracy
                    </p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {stats?.modelAccuracy7d != null
                        ? `${(stats.modelAccuracy7d * 100).toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="premium-card p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Audit Record
                    </p>
                    <p className="text-2xl font-black text-brand-dark mt-1">
                      {stats ? stats.audit_count.toLocaleString() : "—"}
                    </p>
                  </div>
                  <div className="premium-card p-5 flex items-center justify-center">
                    <button
                      onClick={() => setActiveTab("admin")}
                      className="w-full flex items-center justify-center gap-2 text-sm font-bold text-brand-blue hover:text-blue-800"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Manage
                    </button>
                  </div>
                </div>

                {/* Form & Application Table */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Applicant Details Form (Spans 1 col on XL, takes full width on smaller) */}
                  <div className="xl:col-span-1 premium-card p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">
                      Applicant Details
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Enter details below to perform an on-the-spot prediction
                      scan.
                    </p>

                    <div className="space-y-4">
                      {Object.keys(formData).map((key) => (
                        <div key={key}>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            {key.replace(/_/g, " ")}
                          </label>
                          {key === "ApplicantName" ? (
                            <input
                              type="text"
                              name={key}
                              value={formData[key]}
                              onChange={handleChange}
                              placeholder="e.g. John Doe"
                              className="premium-input bg-white"
                            />
                          ) : key in selectOptions ? (
                            <select
                              name={key}
                              value={formData[key]}
                              onChange={handleChange}
                              className="premium-select bg-white"
                            >
                              {key === "Credit_History"
                                ? selectOptions[key].map((o) => (
                                  <option key={o.v} value={o.v}>
                                    {o.label}
                                  </option>
                                ))
                                : selectOptions[key].map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              name={key}
                              value={formData[key]}
                              onChange={handleChange}
                              className={`premium-input bg-white ${errors[key] ? "border-red-300 bg-red-50" : ""}`}
                            />
                          )}
                          {errors[key] && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors[key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || Object.values(errors).some((e) => e)}
                      className="btn-primary w-full mt-6 py-3 uppercase tracking-widest text-xs"
                    >
                      {loading ? "Analyzing..." : "Evaluate Applicant →"}
                    </button>

                    {/* Mini Result Card inline */}
                    {result && (
                      <div
                        className={`mt-6 p-4 rounded-xl border ${result.prediction === 1 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}
                      >
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          Prediction
                        </p>
                        <div
                          className={`text-xl font-black mt-1 ${result.prediction === 1 ? "text-emerald-700" : "text-red-700"}`}
                        >
                          {result.prediction === 1 ? "Approved" : "Rejected"}
                        </div>
                        <div className="w-full h-1.5 bg-white rounded-full mt-3 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{
                              width: `${(result.probability * 100).toFixed(0)}%`,
                              background:
                                result.prediction === 1 ? "#10b981" : "#ef4444",
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold mt-2">
                          <span className="text-slate-500">
                            Confidence: {(result.probability * 100).toFixed(1)}%
                          </span>
                          <span className="text-slate-500">
                            {result.risk_level}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Table List (Spans 2 cols on XL) */}
                  <div className="xl:col-span-2 premium-card flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                          <svg
                            className="w-4 h-4 absolute left-3 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search applications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="premium-input !pl-9 py-2 text-xs bg-white w-full min-w-[200px]"
                          />
                        </div>{" "}
                        <select
                          value={filterPrediction}
                          onChange={(e) => setFilterPrediction(e.target.value)}
                          className="premium-select py-2 text-xs w-32 bg-white"
                        >
                          <option value="all">Result</option>
                          <option value="1">Approved</option>
                          <option value="0">Rejected</option>
                        </select>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="premium-select py-2 text-xs w-36 bg-white"
                        >
                          <option value="all">Status</option>
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <select
                          value={filterRisk}
                          onChange={(e) => setFilterRisk(e.target.value)}
                          className="premium-select py-2 text-xs w-32 bg-white"
                        >
                          <option value="all">Risk</option>
                          <option value="low">Low Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setSearch("");
                          setFilterPrediction("all");
                          setFilterStatus("all");
                          setFilterRisk("all");
                        }}
                        className="btn-secondary py-2 text-xs flex items-center gap-2"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      <table className="premium-table min-w-max">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Income</th>
                            <th>Risk</th>
                            <th>Status</th>
                            <th>Report</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications
                            .filter((a) => {
                              const q = search.toLowerCase();
                              const matchSearch =
                                !q ||
                                String(a.id).includes(q) ||
                                (a.applicant_name || "")
                                  .toLowerCase()
                                  .includes(q);
                              const matchPred =
                                filterPrediction === "all" ||
                                String(a.prediction) === filterPrediction;
                              const matchStatus =
                                filterStatus === "all" ||
                                (a.status || "Pending") === filterStatus;
                              const matchRisk =
                                filterRisk === "all" ||
                                (a.risk_level || "")
                                  .toLowerCase()
                                  .startsWith(filterRisk);
                              return (
                                matchSearch &&
                                matchPred &&
                                matchStatus &&
                                matchRisk
                              );
                            })
                            .map((app) => (
                              <tr key={app.id}>
                                <td className="text-slate-400 font-mono text-xs">
                                  #{String(app.id).padStart(3, "0")}
                                </td>
                                <td className="font-bold text-sm">
                                  {app.applicant_name || "-"}
                                </td>
                                <td className="text-slate-500 text-xs">
                                  {app.applicant_income?.toLocaleString()}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${app.risk_level === "Low Risk" ? "badge-low" : app.risk_level === "High Risk" ? "badge-high" : "badge-medium"}`}
                                  >
                                    {app.risk_level || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  {role === "MANAGER" || role === "ADMIN" ? (
                                    <select
                                      value={app.status || "Pending"}
                                      onChange={(e) =>
                                        updateStatus(app.id, e.target.value)
                                      }
                                      className={`premium-select !py-1 !pl-3 !pr-7 text-xs w-36 border-0 ${(app.status || "Pending") === "Approved"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : (app.status || "Pending") ===
                                          "Rejected"
                                          ? "bg-red-50 text-red-700"
                                          : (app.status || "Pending") ===
                                            "Under Review"
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-slate-50 text-slate-700"
                                        }`}
                                    >
                                      {[
                                        "Pending",
                                        "Under Review",
                                        "Approved",
                                        "Rejected",
                                      ].map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span
                                      className={`badge ${app.status === "Approved" ? "badge-approved" : app.status === "Rejected" ? "badge-rejected" : "badge-pending"}`}
                                    >
                                      {app.status || "Pending"}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await axios.get(
                                          `${API_BASE}/report/${app.id}`,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                            responseType: "blob",
                                          },
                                        );
                                        const url = window.URL.createObjectURL(
                                          new Blob([res.data], {
                                            type: "application/pdf",
                                          }),
                                        );
                                        const link =
                                          document.createElement("a");
                                        link.href = url;
                                        link.setAttribute(
                                          "download",
                                          `LoanGuard_Report_${app.id}.pdf`,
                                        );
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(url);
                                      } catch (e) {
                                        alert("Failed to download PDF.");
                                      }
                                    }}
                                    className="text-xs font-bold text-brand-blue hover:underline px-3 py-1 bg-blue-50 text-blue-700 rounded-md"
                                  >
                                    View PDF
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {applications.length === 0 && (
                            <tr>
                              <td
                                colSpan="6"
                                className="text-center py-10 text-slate-400"
                              >
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

      {/* ── LoanGuard AI Floating Chatbot ── */}
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
  const handleLogout = () => {
    localStorage.removeItem("lg_token");
    setToken(null);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          token
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(
              `${API_BASE}/refresh`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const newToken = res.data.token;
            localStorage.setItem("lg_token", newToken);
            setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem("lg_token");
            setToken(null);
            return Promise.reject(refreshError);
          }
        }
        if (error.response?.status === 401) {
          localStorage.removeItem("lg_token");
          setToken(null);
        }
        return Promise.reject(error);
      },
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
            const res = await axios.post(
              `${API_BASE}/refresh`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const newToken = res.data.token;
            localStorage.setItem("lg_token", newToken);
            setToken(newToken);
          } catch (e) {
            handleLogout();
          }
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
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            token ? (
              <Dashboard token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
