import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

const defaultForm = {
    Gender: "Male", Married: "Yes", Dependents: "0",
    Education: "Graduate", Self_Employed: "No",
    ApplicantIncome: 5000, CoapplicantIncome: 0,
    LoanAmount: 120000, Loan_Amount_Term: 360,
    Credit_History: 1, Property_Area: "Urban",
};

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

function EligibilityChecker() {
    const [form, setForm] = useState(defaultForm);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: numericFields.includes(name) ? Number(value) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/check-eligibility`, form);
            setResult(res.data);
        } catch (err) {
            const msg = err.response?.data?.error || "Server error — is Flask running?";
            const details = err.response?.data?.details;
            console.error("Eligibility check failed:", err.response?.data || err.message);
            toast.error(`❌ ${msg}${details ? `: ${details.map(d => d.field + " " + d.msg).join(", ")}` : ""}`);
        } finally {
            setLoading(false);
        }
    };

    const pct = result ? (result.probability * 100).toFixed(1) : 0;
    const color = result?.prediction === 1 ? "#10B981" : "#EF4444";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
            <ToastContainer position="top-right" autoClose={4000} />
            {/* Header */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-black">L</div>
                    <span className="font-black text-lg">LoanGuard</span>
                    <span className="ml-2 text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">Free Eligibility Check</span>
                </div>
                <Link to="/login" className="text-xs font-bold text-indigo-300 hover:text-white transition-colors border border-indigo-500/30 px-3 py-1.5 rounded-lg">
                    Bank Officers →
                </Link>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                        Check Your Loan Eligibility
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-xl mx-auto">
                        Free, instant, and anonymous. Find out if you qualify for a home loan in under 30 seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        <h2 className="text-lg font-bold mb-6 text-indigo-200">Your Details</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {Object.keys(defaultForm).map((key) => (
                                    <div key={key} className="flex flex-col">
                                        <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5">
                                            {key === 'ApplicantIncome' ? 'Monthly Income (₹)'
                                                : key === 'CoapplicantIncome' ? 'Co-applicant Income (₹)'
                                                    : key === 'LoanAmount' ? 'Loan Amount (₹)'
                                                        : key === 'Loan_Amount_Term' ? 'Loan Term (months)'
                                                            : key.replace(/_/g, " ")}
                                        </label>
                                        {key in selectOptions ? (
                                            <select
                                                name={key}
                                                value={form[key]}
                                                onChange={handleChange}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                                value={form[key]}
                                                onChange={handleChange}
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-2xl hover:from-indigo-500 hover:to-blue-500 transition-all shadow-xl uppercase tracking-widest disabled:opacity-50"
                            >
                                {loading ? "Checking..." : "Check My Eligibility"}
                            </button>
                        </form>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {result ? (
                            <>
                                {/* Decision Card */}
                                <div className={`rounded-3xl p-8 border ${result.prediction === 1 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Your Result</p>
                                    <p className={`text-4xl font-black mb-1 ${result.prediction === 1 ? "text-emerald-400" : "text-red-400"}`}>
                                        {result.prediction === 1 ? "✅ Eligible" : "❌ Not Eligible"}
                                    </p>
                                    <p className="text-white/60 text-sm">{result.risk_level} — {pct}% approval probability</p>

                                    {/* Probability bar */}
                                    <div className="mt-4 h-2 rounded-full bg-white/10">
                                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                                    </div>

                                    {/* EMI */}
                                    {result.estimated_emi > 0 && (
                                        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estimated Monthly EMI</p>
                                            <p className="text-2xl font-black text-white mt-1">₹{result.estimated_emi.toLocaleString()}</p>
                                            <p className="text-[10px] text-white/30 mt-0.5">at 10% p.a. interest</p>
                                        </div>
                                    )}
                                </div>

                                {/* Improvement Tips */}
                                {result.improvement_tips?.length > 0 && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6">
                                        <p className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4">How to Improve</p>
                                        <ul className="space-y-3">
                                            {result.improvement_tips.map((tip, i) => (
                                                <li key={i} className="text-sm text-white/80 leading-relaxed">{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Key Risk Factors */}
                                {result.explanation && Object.keys(result.explanation).length > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Key Factors</p>
                                        <div className="space-y-2">
                                            {Object.entries(result.explanation).map(([feat, val]) => (
                                                <div key={feat} className="flex justify-between items-center">
                                                    <span className="text-xs text-white/60">{feat.replace(/_/g, " ")}</span>
                                                    <span className={`text-xs font-black ${val > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                                        {val > 0 ? "▲" : "▼"} {Math.abs(val).toFixed(3)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="text-white/40 text-sm">Fill in the form and click<br />"Check My Eligibility" to see results</p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-white/20 text-xs mt-10">
                    This is an AI-powered estimate only and does not constitute a formal loan offer. Contact your bank for official assessment.
                </p>
            </div>
        </div>
    );
}

export default EligibilityChecker;
