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
        <div className="min-h-screen bg-brand-light font-sans text-brand-textMain">
            <ToastContainer position="top-right" autoClose={4000} theme="light" />

            {/* Header matching the new aesthetic */}
            <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-blue rounded border border-blue-400 flex items-center justify-center font-bold text-white shadow-sm text-xs">LG</div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm text-brand-dark leading-none">LoanGuard</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Public Portal</span>
                    </div>
                </div>
                <Link to="/login" className="btn-secondary text-xs">
                    Officer Login →
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-brand-dark tracking-tight">
                        Check Eligibility
                    </h1>
                    <p className="text-slate-500 text-base max-w-xl mx-auto font-medium">
                        Instant, secure, AI-powered evaluation. Discover your home loan qualification in under 30 seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form Card */}
                    <div className="lg:col-span-3 premium-card p-8 animate-slide-up">
                        <h2 className="text-lg font-bold mb-6 text-brand-dark flex items-center gap-2">
                            Applicant Details
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Applicant Name */}
                            <div className="mb-5 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                <input
                                    type="text"
                                    name="ApplicantName"
                                    value={form.ApplicantName}
                                    onChange={handleChange}
                                    placeholder="e.g. Priya Sharma"
                                    className={`premium-input ${errors.ApplicantName ? 'border-red-300 bg-red-50' : ''}`}
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                                {Object.keys(defaultForm).filter(k => k !== 'ApplicantName').map((key) => (
                                    <div key={key} className="flex flex-col mb-3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                            {key === 'ApplicantIncome' ? 'Monthly Income (₹)'
                                                : key === 'CoapplicantIncome' ? 'Co-app Income (₹)'
                                                    : key === 'LoanAmount' ? 'Loan Amount (₹)'
                                                        : key === 'Loan_Amount_Term' ? 'Term (months)'
                                                            : key.replace(/_/g, " ")}
                                        </label>
                                        {key in selectOptions ? (
                                            <select
                                                name={key}
                                                value={form[key]}
                                                onChange={handleChange}
                                                className="premium-select"
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
                                                className={`premium-input ${errors[key] ? 'border-red-300 bg-red-50' : ''}`}
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
                                className="w-full mt-4 btn-primary py-4 uppercase text-xs tracking-widest flex justify-center items-center gap-2"
                            >
                                {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                                {loading ? "Analyzing Models..." : "Evaluate Eligibility"}
                            </button>
                        </form>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {result ? (
                            <>
                                {/* Decision Card */}
                                <div className={`premium-card p-6 border ${isApproved ? "border-emerald-200 shadow-sm" : "border-red-200 shadow-sm"}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Model Prediction</p>
                                    <p className={`text-4xl font-black mb-1 flex items-center gap-3 ${isApproved ? "text-emerald-600" : "text-red-500"}`}>
                                        {isApproved ? "Approved" : "Rejected"}
                                    </p>
                                    <p className="text-slate-500 text-sm font-medium mb-5">{result.risk_level} — {pct}% probability</p>

                                    {/* Probability bar */}
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                        <div className={`h-full transition-all duration-1000 ${isApproved ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                    </div>

                                    {/* EMI */}
                                    {result.estimated_emi > 0 && (
                                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. EMI</p>
                                                <p className="text-xs text-slate-500 font-medium">@ 10% p.a.</p>
                                            </div>
                                            <p className="text-2xl font-black text-brand-dark">₹{result.estimated_emi.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Improvement Tips */}
                                {result.improvement_tips?.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-2">
                                            <span>💡</span> Recommendations
                                        </p>
                                        <ul className="space-y-2">
                                            {result.improvement_tips.map((tip, i) => (
                                                <li key={i} className="text-xs text-amber-900 font-medium flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">•</span> {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Key Risk Factors */}
                                {result.explanation && Object.keys(result.explanation).length > 0 && (
                                    <div className="premium-card p-5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">SHAP Explainability</p>
                                        <div className="space-y-2">
                                            {Object.entries(result.explanation).map(([feat, val]) => (
                                                <div key={feat} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-600 truncate mr-2" title={feat}>{feat.replace(/_/g, " ")}</span>
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded ${val > 0 ? "bg-red-50 border border-red-100 text-red-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"}`}>
                                                        {val > 0 ? "▲" : "▼"} {Math.abs(val).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="premium-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px] border-dashed border-2 border-slate-200">
                                <span className="text-slate-300 text-5xl mb-4">🔎</span>
                                <h3 className="text-sm font-bold text-slate-700 mb-1">Awaiting Details</h3>
                                <p className="text-slate-500 text-xs max-w-xs">Run an evaluation on the left panel to populate prediction analysis.</p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-12 pb-8">
                    Model inference demonstration only.
                </p>
            </div>
        </div>
    );
}

export default EligibilityChecker;
