import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API_BASE = "http://127.0.0.1:5000";

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
                setTrends(t.data);
                setIncome(i.data);
                setRisk(r.data);
                setLoanDist(l.data);
                setAreaStats(a.data);
                setDrift(d.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [token]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-blue-900 font-bold animate-pulse">Loading analytics data...</p>
        </div>
    );

    const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-black text-blue-900 mb-1">📊 Analytics Dashboard</h2>
                <p className="text-slate-500 text-sm">Comprehensive breakdown of loan applications, approval rates, and property distributions.</p>
            </div>

            {/* Drift Warning Banner */}
            {drift && (
                <div className={`rounded-2xl p-5 flex items-start gap-4 border shadow-sm ${drift.drift_detected
                        ? "bg-red-50 border-red-200"
                        : "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200"
                    }`}>
                    <span className="text-2xl">{drift.drift_detected ? '⚠️' : '✅'}</span>
                    <div className="flex-1">
                        <p className={`font-bold mb-1 ${drift.drift_detected ? 'text-red-700' : 'text-emerald-800'}`}>
                            {drift.drift_detected ? "Model Drift Detected" : "Model Serving Healthy"}
                        </p>
                        <p className={drift.drift_detected ? 'text-red-600' : 'text-emerald-700'}>
                            {drift.message}
                        </p>
                        {drift.accuracy_7d !== null && (
                            <div className="mt-3 bg-white/50 rounded-xl p-3 border border-white">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Accuracy Tracker</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${(drift.accuracy_7d / drift.accuracy_baseline) >= 0.95 ? 'bg-emerald-500' :
                                                (drift.accuracy_7d / drift.accuracy_baseline) >= 0.90 ? 'bg-amber-500' : 'bg-red-500'
                                            }`} style={{ width: `${(drift.accuracy_7d * 100).toFixed(0)}%` }} />
                                    </div>
                                    <span className="font-mono text-sm font-bold text-slate-700">{(drift.accuracy_7d * 100).toFixed(1)}%</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Baseline: <strong>{(drift.accuracy_baseline * 100).toFixed(1)}%</strong> | Sample size: {drift.sample_size} predictions</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Approval Trend */}
            <div className="bg-white rounded-2xl border border-blue-50 shadow-md p-6">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-6">Approval Trend (Last 30 Days)</h3>
                {trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="bump" dataKey="approved" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Approved" />
                            <Line type="bump" dataKey="rejected" stroke="#EF4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Rejected" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">Not enough data to display trends.</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income Bracket */}
                <div className="bg-white rounded-2xl border border-blue-50 shadow-md p-6">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-6">Approvals by Income Level</h3>
                    {income.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={income}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No data available.</p>}
                </div>

                {/* Loan Amount Distribution */}
                <div className="bg-white rounded-2xl border border-blue-50 shadow-md p-6">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-6">Loan Amount Distribution</h3>
                    {loanDist.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={loanDist}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" maxBarSize={40} />
                                <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No data available.</p>}
                </div>

                {/* Property Area Stats */}
                <div className="bg-white rounded-2xl border border-blue-50 shadow-md p-6">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-6">Approval Rate by Area</h3>
                    {areaStats.length > 0 ? (
                        <div className="space-y-4">
                            {areaStats.map((stat, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.area === 'Urban' ? 'bg-blue-100 text-blue-600' :
                                                stat.area === 'Semiurban' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {stat.area === 'Urban' ? '🏙️' : stat.area === 'Semiurban' ? '🏘️' : '🏡'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{stat.area}</p>
                                            <p className="text-xs text-slate-500">{stat.total} applications</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-blue-700">{stat.approval_rate}%</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approval</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No data available.</p>}
                </div>

                {/* Risk Distribution */}
                <div className="bg-white rounded-2xl border border-blue-50 shadow-md p-6">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-6">Risk Level Distribution</h3>
                    {risk.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={risk} dataKey="count" nameKey="risk_level" cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={90} paddingAngle={2}
                                    label={({ risk_level, percent }) => `${risk_level} (${(percent * 100).toFixed(0)}%)`}>
                                    {risk.map((entry, i) => (
                                        <Cell key={i} fill={
                                            entry.risk_level === 'Low Risk' ? '#10B981' :
                                                entry.risk_level === 'High Risk' ? '#EF4444' : '#F59E0B'
                                        } />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-400 text-sm py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No data available.</p>}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
