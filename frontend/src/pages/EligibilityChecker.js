import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

const defaultForm = {
    ApplicantName: "",
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
    const [errors, setErrors] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numVal = numericFields.includes(name) ? Number(value) : value;
        setForm(prev => ({ ...prev, [name]: numVal }));

        // Real-time validation
        let err = "";
        if (name === "ApplicantName" && !value.trim()) err = "Name is required.";
        else if (name === "ApplicantIncome" && numVal <= 0) err = "Must be > 0.";
        else if (name === "LoanAmount" && numVal <= 0) err = "Must be > 0.";
        else if (name === "Loan_Amount_Term" && (numVal < 12 || numVal > 360)) err = "Input 12 to 360 months.";
        setErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/check-eligibility`, form);
            setResult(res.data);
            if (res.data.prediction === 1) toast.success("✅ You are eligible!");
            else toast.error("❌ Not eligible at this time.");
        } catch (err) {
            const msg = err.response?.data?.error || "Server error — is Flask running?";
            toast.error(`❌ ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const pct = result ? (result.probability * 100).toFixed(1) : 0;
    const isApproved = result?.prediction === 1;

    return (
        <div className="min-h-screen bg-slate-50">
            <ToastContainer position="top-right" autoClose={4000} theme="light" />

            {/* Header matching Login page */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4 flex items-center justify-between shadow-lg shadow-blue-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-sm font-black text-white">LG</div>
                    <div className="text-white">
                        <span className="font-black text-xl leading-none block">LoanGuard</span>
                        <span className="text-xs text-blue-200 uppercase tracking-widest font-bold">Public Portal</span>
                    </div>
                </div>
                <Link to="/login" className="text-xs font-bold text-white/80 hover:text-white transition-colors border border-white/20 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10">
                    Bank Officers <span>→</span>
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-blue-900">
                        Check Your Loan Eligibility
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                        Free, instant, and secure. Find out if you qualify for a home loan in under 30 seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form Card */}
                    <div className="lg:col-span-3 bg-white border border-blue-100 rounded-3xl p-8 shadow-xl shadow-blue-900/5 animate-slide-up hover-lift">
                        <h2 className="text-xl font-black mb-6 text-blue-900 flex items-center gap-2">
                            <span>📋</span> Your Details
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Applicant Name */}
                            <div className="mb-5 flex flex-col">
                                <label className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                <input
                                    type="text"
                                    name="ApplicantName"
                                    value={form.ApplicantName}
                                    onChange={handleChange}
                                    placeholder="e.g. Priya Sharma"
                                    className={`input-glow rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ApplicantName ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                                />
                                <div className="h-4 mt-1 flex justify-between">
                                    {errors.ApplicantName ? (
                                        <span className="text-[10px] font-bold text-red-500 animate-fade-in">{errors.ApplicantName}</span>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-[10px] font-bold text-slate-400">{form.ApplicantName.length}/50</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
                                {Object.keys(defaultForm).filter(k => k !== 'ApplicantName').map((key) => (
                                    <div key={key} className="flex flex-col mb-4">
                                        <label className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1.5">
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
                                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
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
                                                className={`input-glow rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[key] ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                                            />
                                        )}
                                        <div className="h-4 mt-1">
                                            {errors[key] && <span className="text-[10px] font-bold text-red-500 animate-fade-in">{errors[key]}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={loading || Object.values(errors).some(e => e)}
                                className="w-full mt-4 btn-glow bg-gradient-to-r from-blue-700 to-blue-500 text-white font-black py-4 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                                {loading ? "Analyzing..." : "Check My Eligibility"}
                            </button>
                        </form>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {result ? (
                            <>
                                {/* Decision Card */}
                                <div className={`card-shine rounded-3xl p-8 border shadow-xl ${isApproved ? "bg-white border-emerald-200 shadow-emerald-900/5" : "bg-white border-red-200 shadow-red-900/5"}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your Result</p>
                                    <p className={`text-4xl font-black mb-2 flex items-center gap-3 ${isApproved ? "text-emerald-500" : "text-red-500"}`}>
                                        {isApproved ? "✅ Eligible" : "❌ Not Eligible"}
                                    </p>
                                    <p className="text-slate-500 text-sm font-medium mb-5">{result.risk_level} — <strong>{pct}%</strong> approval probability</p>

                                    {/* Probability bar */}
                                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${isApproved ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                    </div>

                                    {/* EMI */}
                                    {result.estimated_emi > 0 && (
                                        <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Monthly EMI</p>
                                            <p className="text-2xl font-black text-slate-800">₹{result.estimated_emi.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">at 10% p.a. interest rate</p>
                                        </div>
                                    )}
                                </div>

                                {/* Improvement Tips */}
                                {result.improvement_tips?.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
                                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2">
                                            <span>💡</span> How to Improve
                                        </p>
                                        <ul className="space-y-3">
                                            {result.improvement_tips.map((tip, i) => (
                                                <li key={i} className="text-sm text-amber-900 font-medium flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">•</span> {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Key Risk Factors */}
                                {result.explanation && Object.keys(result.explanation).length > 0 && (
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Key Factors</p>
                                        <div className="space-y-3">
                                            {Object.entries(result.explanation).map(([feat, val]) => (
                                                <div key={feat} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-xs font-medium text-slate-600">{feat.replace(/_/g, " ")}</span>
                                                    <span className={`text-xs font-black px-2 py-1 rounded-md ${val > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                                                        {val > 0 ? "▲" : "▼"} {Math.abs(val).toFixed(3)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                                <div className="text-5xl mb-4 opacity-50 grayscale">🔍</div>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">Awaiting Details</h3>
                                <p className="text-slate-500 text-sm max-w-xs">Fill in the form on the left and click<br />"Check My Eligibility" to see your personalized loan estimate here.</p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-12 font-medium">
                    This is an AI-powered estimate only and does not constitute a formal loan offer. Contact our banking team for an official assessment.
                </p>
            </div>
        </div>
    );
}

export default EligibilityChecker;
