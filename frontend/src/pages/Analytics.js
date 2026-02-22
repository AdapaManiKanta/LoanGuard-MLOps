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
    const [drift, setDrift] = useState(null);
    const [loading, setLoading] = useState(true);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [t, i, r, d] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/trends`, { headers }),
                    axios.get(`${API_BASE}/analytics/income-bracket`, { headers }),
                    axios.get(`${API_BASE}/analytics/risk`, { headers }),
                    axios.get(`${API_BASE}/drift-status`, { headers }),
                ]);
                setTrends(t.data);
                setIncome(i.data);
                setRisk(r.data);
                setDrift(d.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [token]);

    if (loading) return <div className="text-gray-400 py-20 text-center text-sm">Loading analytics...</div>;

    const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6366F1"];

    return (
        <div className="space-y-8">
            {/* Drift Warning Banner */}
            {drift?.drift_detected && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-bold text-red-700 mb-1">Model Drift Detected</p>
                        <p className="text-red-600 text-sm">{drift.message}</p>
                        <p className="text-red-400 text-xs mt-1">
                            7-day accuracy: <strong>{(drift.accuracy_7d * 100).toFixed(1)}%</strong> vs baseline <strong>{(drift.accuracy_baseline * 100).toFixed(1)}%</strong>
                            &nbsp;(sample: {drift.sample_size} predictions)
                        </p>
                    </div>
                </div>
            )}
            {drift && !drift.drift_detected && drift.accuracy_7d !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <span className="text-lg">✅</span>
                    <p className="text-emerald-700 text-sm font-medium">{drift.message}&nbsp;
                        <span className="text-emerald-500 font-normal">(7-day accuracy: {(drift.accuracy_7d * 100).toFixed(1)}%)</span>
                    </p>
                </div>
            )}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Analytics Dashboard</h2>
                <p className="text-gray-500 text-sm">Trends and breakdowns across all loan applications.</p>
            </div>

            {/* Approval Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Approval Trend (Last 30 Days)</h3>
                {trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} dot={false} name="Approved" />
                            <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} dot={false} name="Rejected" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center py-10">Not enough data yet — submit more applications to see trends.</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income Bracket */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Approvals by Income Bracket</h3>
                    {income.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={income}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-sm text-center py-10">No data yet.</p>}
                </div>

                {/* Risk Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Risk Level Distribution</h3>
                    {risk.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={risk} dataKey="count" nameKey="risk_level" cx="50%" cy="50%" outerRadius={80} label={({ risk_level, percent }) => `${risk_level} ${(percent * 100).toFixed(0)}%`}>
                                    {risk.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-sm text-center py-10">No data yet.</p>}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
