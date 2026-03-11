import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API_BASE = "http://127.0.0.1:5000";

const DARK_TT = {
    contentStyle: {
        background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, fontSize: 12, color: "#e2e8f0",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    },
    labelStyle: { color: "#a78bfa", fontWeight: 700 },
    cursor: { stroke: "rgba(124,77,255,0.3)", strokeWidth: 1 },
};

const chartGridProps = {
    strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.04)", vertical: false,
};
const axisProps = {
    tick: { fontSize: 10, fill: "rgba(148,163,184,0.45)" },
    axisLine: false, tickLine: false,
};

function Analytics({ token }) {
    const [trends, setTrends] = useState([]);
    const [income, setIncome] = useState([]);
    const [risk, setRisk] = useState([]);
    const [loanDist, setLoanDist] = useState([]);
    const [areaStats, setAreaStats] = useState([]);
    const [drift, setDrift] = useState(null);
    const [loading, setLoading] = useState(true);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [t, i, r, l, a, d] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/trends`, { headers }),
                    axios.get(`${API_BASE}/analytics/income-bracket`, { headers }),
                    axios.get(`${API_BASE}/analytics/risk`, { headers }),
                    axios.get(`${API_BASE}/analytics/loan-distribution`, { headers }),
                    axios.get(`${API_BASE}/analytics/property-area`, { headers }),
                    axios.get(`${API_BASE}/drift-status`, { headers }),
                ]);
                setTrends(t.data); setIncome(i.data); setRisk(r.data);
                setLoanDist(l.data); setAreaStats(a.data); setDrift(d.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [token]);

    if (loading) return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 0", gap: 16
        }}>
            <div style={{
                width: 40, height: 40, border: "3px solid rgba(124,77,255,0.2)",
                borderTop: "3px solid #7c4dff", borderRadius: "50%",
                animation: "spin 1s linear infinite"
            }} />
            <p style={{
                color: "rgba(148,163,184,0.5)", fontSize: 13, fontWeight: 600,
                animation: "pulse 1.5s ease-in-out infinite"
            }}>Loading analytics...</p>
        </div>
    );

    const CHART_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#a78bfa"];
    const emptyMsg = (
        <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 12 }}>📊</div>
            <p style={{ color: "rgba(148,163,184,0.3)", fontSize: 13, fontWeight: 600 }}>No data available yet</p>
        </div>
    );

    const cardStyle = {
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, padding: 24,
    };
    const sectionLabel = {
        fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase",
        color: "rgba(148,163,184,0.4)", marginBottom: 20, display: "block",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>
                        Analytics Dashboard
                    </h2>
                    <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>Live model performance metrics</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button style={{
                        padding: "8px 18px", background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
                        color: "rgba(148,163,184,0.7)", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1
                    }}>
                        Export CSV
                    </button>
                    <button style={{
                        padding: "8px 18px", background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
                        color: "rgba(148,163,184,0.7)", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1
                    }}>
                        Last 30 Days
                    </button>
                </div>
            </div>

            {/* Drift Banner */}
            {drift && (
                <div style={{
                    borderRadius: 16, padding: 20,
                    background: drift.drift_detected ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.06)",
                    border: `1px solid ${drift.drift_detected ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.2)"}`,
                    display: "flex", alignItems: "flex-start", gap: 16,
                }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{drift.drift_detected ? "⚠️" : "✅"}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 700, fontSize: 14, marginBottom: 4,
                            color: drift.drift_detected ? "#fca5a5" : "#86efac"
                        }}>
                            {drift.drift_detected ? "Model Drift Detected" : "Model Serving Healthy"}
                        </div>
                        <div style={{ fontSize: 12, color: drift.drift_detected ? "rgba(252,165,165,0.7)" : "rgba(134,239,172,0.7)" }}>
                            {drift.message}
                        </div>
                        {drift.accuracy_7d !== null && (
                            <div style={{
                                marginTop: 14, background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10,
                                padding: "10px 14px", display: "flex", alignItems: "center", gap: 14
                            }}>
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                    Accuracy Tracking
                                </span>
                                <div style={{ flex: 1, height: 5, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(drift.accuracy_7d * 100).toFixed(0)}%`,
                                        borderRadius: 4,
                                        background: (drift.accuracy_7d / drift.accuracy_baseline) >= 0.95 ? "#22c55e" : (drift.accuracy_7d / drift.accuracy_baseline) >= 0.9 ? "#f59e0b" : "#ef4444",
                                        transition: "width 1s ease",
                                    }} />
                                </div>
                                <span style={{
                                    fontFamily: "monospace", fontSize: 12, fontWeight: 800,
                                    color: "#e2e8f0", minWidth: 40
                                }}>{(drift.accuracy_7d * 100).toFixed(1)}%</span>
                                <span style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: 12, whiteSpace: "nowrap" }}>
                                    Base: {(drift.accuracy_baseline * 100).toFixed(1)}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Trend Line Chart */}
            <div style={cardStyle}>
                <span style={sectionLabel}>Approval Trend — Last 30 Days</span>
                {trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trends}>
                            <CartesianGrid {...chartGridProps} />
                            <XAxis dataKey="date" {...axisProps} dy={10} />
                            <YAxis {...axisProps} dx={-10} />
                            <Tooltip {...DARK_TT} />
                            <Legend wrapperStyle={{ paddingTop: 20, fontSize: 12, color: "rgba(148,163,184,0.7)" }} />
                            <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2.5}
                                dot={false} activeDot={{ r: 6, fill: "#22c55e", stroke: "#070711", strokeWidth: 2 }} name="Approved" />
                            <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2.5}
                                dot={false} activeDot={{ r: 6, fill: "#ef4444", stroke: "#070711", strokeWidth: 2 }} name="Rejected" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : emptyMsg}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Income Bracket */}
                <div style={cardStyle}>
                    <span style={sectionLabel}>Approvals by Income Level</span>
                    {income.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={income}>
                                <CartesianGrid {...chartGridProps} />
                                <XAxis dataKey="bracket" {...axisProps} dy={10} />
                                <YAxis {...axisProps} dx={-10} />
                                <Tooltip {...DARK_TT} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, color: "rgba(148,163,184,0.7)" }} />
                                <Bar dataKey="approved" fill="#22c55e" name="Approved" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[6, 6, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : emptyMsg}
                </div>

                {/* Loan Distribution */}
                <div style={cardStyle}>
                    <span style={sectionLabel}>Loan Amount Distribution</span>
                    {loanDist.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={loanDist}>
                                <CartesianGrid {...chartGridProps} />
                                <XAxis dataKey="bucket" {...axisProps} dy={10} />
                                <YAxis {...axisProps} dx={-10} />
                                <Tooltip {...DARK_TT} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, color: "rgba(148,163,184,0.7)" }} />
                                <Bar dataKey="approved" stackId="a" fill="#22c55e" name="Approved" maxBarSize={28} />
                                <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" radius={[6, 6, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : emptyMsg}
                </div>

                {/* Property Area */}
                <div style={cardStyle}>
                    <span style={sectionLabel}>Approval Rate by Area</span>
                    {areaStats.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {areaStats.map((stat, i) => (
                                <div key={i} style={{
                                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 12, padding: "12px 16px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 12,
                                            background: stat.area === "Urban" ? "rgba(59,130,246,0.15)" : stat.area === "Semiurban" ? "rgba(124,77,255,0.15)" : "rgba(34,197,94,0.12)",
                                            border: `1px solid ${stat.area === "Urban" ? "rgba(59,130,246,0.25)" : stat.area === "Semiurban" ? "rgba(124,77,255,0.25)" : "rgba(34,197,94,0.25)"}`,
                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                                        }}>
                                            {stat.area === "Urban" ? "🏙️" : stat.area === "Semiurban" ? "🏘️" : "🏡"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{stat.area}</div>
                                            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                                                {stat.total} Applications
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800,
                                        background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
                                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                                    }}>
                                        {stat.approval_rate}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : emptyMsg}
                </div>

                {/* Risk Distribution Donut */}
                <div style={cardStyle}>
                    <span style={sectionLabel}>Risk Level Distribution</span>
                    {risk.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={risk} dataKey="count" nameKey="risk_level" cx="50%" cy="50%"
                                    innerRadius={56} outerRadius={88} paddingAngle={4}
                                    label={({ risk_level, percent }) => `${risk_level} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={{ stroke: "rgba(148,163,184,0.2)" }}>
                                    {risk.map((entry, i) => (
                                        <Cell key={i} fill={
                                            entry.risk_level === "Low Risk" ? "#22c55e" :
                                                entry.risk_level === "High Risk" ? "#ef4444" : "#f59e0b"
                                        } stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip {...DARK_TT} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : emptyMsg}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
