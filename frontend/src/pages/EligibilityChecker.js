import React, { useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

const DARK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { background: #070711; font-family: 'Inter','Segoe UI',sans-serif; }
  ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#0a0a12;} ::-webkit-scrollbar-thumb{background:#7c4dff;border-radius:3px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes orbFloat{0%,100%{transform:translate(0,0);}50%{transform:translate(20px,-15px);}}
  @keyframes pulseBar{0%,100%{opacity:1;}50%{opacity:0.5;}}
  .lg-fade { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
  .gradient-text {
    background:linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .dark-input {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:12px; padding:12px 16px; color:#e2e8f0; font-size:14px;
    outline:none; transition:border-color 0.25s, box-shadow 0.25s; font-family:'Inter',sans-serif;
  }
  .dark-input::placeholder{color:rgba(148,163,184,0.35);}
  .dark-input:focus{border-color:rgba(124,77,255,0.55);box-shadow:0 0 0 3px rgba(124,77,255,0.1);}
  .dark-select {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:12px; padding:12px 16px; color:#e2e8f0; font-size:14px;
    outline:none; cursor:pointer; transition:border-color 0.25s;
    font-family:'Inter',sans-serif; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(148,163,184,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 14px center; background-size:16px;
  }
  .dark-select:focus{border-color:rgba(124,77,255,0.55);}
  .dark-select option{background:#1a1a2e;color:#e2e8f0;}
  .shimmer-btn {
    background:linear-gradient(135deg,#7c4dff,#3b82f6);
    border:none; border-radius:12px; cursor:pointer; color:white;
    font-weight:700; font-family:'Inter',sans-serif; font-size:13px;
    letter-spacing:1px; text-transform:uppercase;
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .shimmer-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(124,77,255,0.45);}
  .shimmer-btn:disabled{opacity:0.45;cursor:not-allowed;}
  .ghost-btn {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; cursor:pointer; color:#e2e8f0;
    font-weight:600; font-family:'Inter',sans-serif; font-size:13px;
    transition:all 0.2s;
  }
  .ghost-btn:hover{background:rgba(124,77,255,0.12);border-color:rgba(124,77,255,0.3);color:#a78bfa;}
  .glass-panel {
    background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; backdrop-filter:blur(16px);
  }
  .badge-low{background:rgba(34,197,94,0.12);color:#86efac;border:1px solid rgba(34,197,94,0.25);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .badge-high{background:rgba(239,68,68,0.12);color:#fca5a5;border:1px solid rgba(239,68,68,0.25);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .badge-med{background:rgba(245,158,11,0.12);color:#fde68a;border:1px solid rgba(245,158,11,0.25);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}
  .warn-box{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:12px 16px;color:#fca5a5;font-size:12px;font-weight:600;line-height:1.6;}
`;

const defaultForm = {
    ApplicantName: "",
    Gender: "Male", Married: "Yes", Dependents: "0",
    Education: "Graduate", Self_Employed: "No",
    ApplicantIncome: 5000, CoapplicantIncome: 0,
    LoanAmount: 120000, Loan_Amount_Term: 360,
    Credit_History: 1, Property_Area: "Urban",
};

const selectOptions = {
    Gender: ["Male", "Female"], Married: ["Yes", "No"],
    Dependents: ["0", "1", "2", "3+"], Education: ["Graduate", "Not Graduate"],
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

    // Interest / lead state
    const [interest, setInterest] = useState(null); // null | 'yes' | 'no'
    const [contact, setContact] = useState({ name: "", email: "", phone: "" });
    const [contactErrors, setContactErrors] = useState({});
    const [leadLoading, setLeadLoading] = useState(false);
    const [leadId, setLeadId] = useState(null);
    const [leadSubmitted, setLeadSubmitted] = useState(false);

    // Document upload state
    const [docs, setDocs] = useState([
        { docType: "Aadhaar Card", file: null, status: null, id: null },
    ]);
    const [docsUploading, setDocsUploading] = useState(false);
    const DOC_TYPES = ["Aadhaar Card", "PAN Card", "Income Proof", "Bank Statement", "Property Papers"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numVal = numericFields.includes(name) ? Number(value) : value;
        setForm(prev => ({ ...prev, [name]: numVal }));
        let err = "";
        if (name === "ApplicantName" && !value.trim()) err = "Name is required.";
        else if (name === "ApplicantIncome" && numVal <= 0) err = "Must be > 0.";
        else if (name === "LoanAmount" && numVal <= 0) err = "Must be > 0.";
        else if (name === "Loan_Amount_Term" && (numVal < 12 || numVal > 360)) err = "Input 12 to 360 months.";
        setErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: value }));
        let err = "";
        if (name === "email" && value && !/^[^@]+@[^@]+\.[^@]+$/.test(value)) err = "Invalid email address.";
        if (name === "phone" && value && !/^[0-9]{10,}$/.test(value.replace(/\s/g, ""))) err = "Enter a valid 10-digit phone number.";
        setContactErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleSubmitLead = async () => {
        if (!contact.email || !contact.phone) {
            toast.error("Please enter your email and phone number.");
            return;
        }
        if (Object.values(contactErrors).some(e => e)) {
            toast.error("Please fix validation errors before submitting.");
            return;
        }
        setLeadLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/leads`, {
                applicant_name: contact.name || form.ApplicantName,
                email: contact.email,
                phone: contact.phone,
                ai_result: result,
            });
            setLeadId(res.data.lead_id);
            setLeadSubmitted(true);
            toast.success("🎉 Thank you! A confirmation email has been sent.");
        } catch (err) {
            const msg = err.response?.data?.error || "Submission failed — please try again.";
            if (err.response?.status === 409) {
                toast.info("ℹ️ You've already submitted interest with this contact info.");
                setLeadId(err.response?.data?.lead_id);
                setLeadSubmitted(true);
            } else {
                toast.error(`❌ ${msg}`);
            }
        } finally {
            setLeadLoading(false);
        }
    };

    const handleDocUpload = async () => {
        if (!leadId) return;
        const validDocs = docs.filter(d => d.file);
        if (validDocs.length === 0) { toast.error("Please select at least one file."); return; }
        setDocsUploading(true);
        const updatedDocs = [...docs];
        for (let i = 0; i < docs.length; i++) {
            const d = docs[i];
            if (!d.file) continue;
            const fd = new FormData();
            fd.append("file", d.file);
            fd.append("doc_type", d.docType);
            try {
                const res = await axios.post(`${API_BASE}/leads/${leadId}/documents`, fd);
                updatedDocs[i] = { ...updatedDocs[i], status: "uploaded", id: res.data.doc_id };
            } catch (err) {
                updatedDocs[i] = { ...updatedDocs[i], status: "error" };
                toast.error(`❌ Upload failed for ${d.docType}`);
            }
        }
        setDocs(updatedDocs);
        setDocsUploading(false);
        const successCount = updatedDocs.filter(d => d.status === "uploaded").length;
        if (successCount > 0) toast.success(`✅ ${successCount} document(s) uploaded successfully!`);
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

    // Live affordability warning
    const liveEmi = (() => {
        const p = Number(form.LoanAmount), n = Number(form.Loan_Amount_Term);
        if (!p || !n) return 0;
        const r = 10 / (12 * 100);
        return p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    })();
    const totalIncome = Number(form.ApplicantIncome) + Number(form.CoapplicantIncome);
    const affordabilityWarning = totalIncome > 0 && liveEmi / totalIncome > 0.50
        ? `⚠️ Estimated EMI (₹${Math.round(liveEmi).toLocaleString()}) exceeds 50% of your monthly income (₹${totalIncome.toLocaleString()}). This loan will likely be rejected.`
        : null;

    return (
        <div style={{ minHeight: "100vh", background: "#070711", fontFamily: "'Inter',sans-serif", color: "#e2e8f0", padding: "0 0 60px" }}>
            <style>{DARK_CSS}</style>
            <ToastContainer position="top-right" autoClose={4000} theme="dark" />

            {/* Background orbs */}
            <div style={{
                position: "fixed", top: "-15%", left: "-10%", width: 500, height: 500, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(124,77,255,0.12),transparent 70%)",
                animation: "orbFloat 12s ease-in-out infinite", pointerEvents: "none", zIndex: 0
            }} />
            <div style={{
                position: "fixed", bottom: 0, right: "-8%", width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(59,130,246,0.1),transparent 70%)",
                animation: "orbFloat 15s ease-in-out infinite 3s", pointerEvents: "none", zIndex: 0
            }} />

            {/* Navbar */}
            <div style={{
                position: "sticky", top: 0, zIndex: 100,
                background: "rgba(7,7,17,0.85)", backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 900, color: "white", fontSize: 13,
                        boxShadow: "0 0 20px rgba(124,77,255,0.4)"
                    }}>LG</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.5px" }}>
                            LoanGuard <span className="gradient-text">AI</span>
                        </div>
                        <div style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                            color: "rgba(148,163,184,0.4)"
                        }}>Public Portal</div>
                    </div>
                </div>
                <Link to="/login" style={{
                    padding: "8px 20px", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100,
                    color: "rgba(148,163,184,0.8)", fontSize: 12, fontWeight: 700, textDecoration: "none",
                    transition: "all 0.2s",
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,77,255,0.15)"; e.currentTarget.style.color = "#a78bfa"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(148,163,184,0.8)"; }}>
                    Officer Login →
                </Link>
            </div>

            {/* Hero */}
            <div style={{ textAlign: "center", padding: "56px 40px 40px", position: "relative", zIndex: 1 }} className="lg-fade">
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px",
                    background: "rgba(124,77,255,0.12)", border: "1px solid rgba(124,77,255,0.3)",
                    borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                    color: "#a78bfa", textTransform: "uppercase", marginBottom: 18
                }}>
                    ⚡ AI-Powered Eligibility Check
                </div>
                <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 12 }}>
                    Check <span className="gradient-text">Eligibility</span>
                </h1>
                <p style={{ color: "rgba(148,163,184,0.65)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
                    Instant, secure, AI-powered evaluation. Discover your home loan qualification in under 30 seconds.
                </p>
            </div>

            {/* Main grid */}
            <div style={{
                maxWidth: 1100, margin: "0 auto", padding: "0 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, position: "relative", zIndex: 1
            }}>

                {/* Form */}
                <div className="glass-panel lg-fade" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, color: "#f1f5f9" }}>Applicant Details</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                                color: "rgba(148,163,184,0.45)", display: "block", marginBottom: 8
                            }}>Full Name</label>
                            <input type="text" name="ApplicantName" value={form.ApplicantName}
                                onChange={handleChange} placeholder="e.g. Priya Sharma"
                                maxLength={50}
                                className="dark-input"
                                style={errors.ApplicantName ? { borderColor: "rgba(239,68,68,0.5)" } : {}} required />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                                {errors.ApplicantName
                                    ? <span style={{ fontSize: 10, color: "#fca5a5", fontWeight: 600 }}>{errors.ApplicantName}</span>
                                    : <span />}
                                <span style={{ fontSize: 10, color: "rgba(148,163,184,0.3)" }}>{form.ApplicantName.length}/50</span>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {Object.keys(defaultForm).filter(k => k !== "ApplicantName").map(key => (
                                <div key={key} style={{ marginBottom: 4 }}>
                                    <label style={{
                                        fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                                        color: "rgba(148,163,184,0.45)", display: "block", marginBottom: 7
                                    }}>
                                        {key === "ApplicantIncome" ? "Monthly Income (₹)"
                                            : key === "CoapplicantIncome" ? "Co-app Income (₹)"
                                                : key === "LoanAmount" ? "Loan Amount (₹)"
                                                    : key === "Loan_Amount_Term" ? "Term (months)"
                                                        : key.replace(/_/g, " ")}
                                    </label>
                                    {key in selectOptions ? (
                                        <select name={key} value={form[key]} onChange={handleChange} className="dark-select">
                                            {key === "Credit_History"
                                                ? selectOptions[key].map(o => <option key={o.v} value={o.v}>{o.label}</option>)
                                                : selectOptions[key].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    ) : (
                                        <input type="number" name={key} value={form[key]} onChange={handleChange}
                                            className="dark-input"
                                            style={errors[key] ? { borderColor: "rgba(239,68,68,0.5)" } : {}} />
                                    )}
                                    {errors[key] && <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 600, marginTop: 4 }}>{errors[key]}</div>}
                                </div>
                            ))}
                        </div>

                        {affordabilityWarning && (
                            <div className="warn-box" style={{ marginTop: 16, marginBottom: 4 }}>{affordabilityWarning}</div>
                        )}

                        <button type="submit"
                            disabled={loading || Object.values(errors).some(e => e)}
                            className="shimmer-btn"
                            style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 14 }}>
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                    <svg style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                                        <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg> Analyzing Models...
                                </span>
                            ) : "⚡ Evaluate Eligibility"}
                        </button>
                    </form>
                </div>

                {/* Result Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>
                    {result ? (
                        <>
                            {/* Decision */}
                            <div className="glass-panel lg-fade" style={{
                                padding: 28,
                                border: isApproved ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.25)",
                            }}>
                                <div style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                                    color: "rgba(148,163,184,0.4)", marginBottom: 16
                                }}>Model Prediction</div>
                                <div style={{
                                    fontSize: 44, fontWeight: 900, letterSpacing: "-2px", marginBottom: 6,
                                    color: isApproved ? "#4ade80" : "#f87171"
                                }}>
                                    {isApproved ? "Approved" : "Rejected"}
                                </div>
                                <div style={{ fontSize: 13, color: "rgba(148,163,184,0.6)", marginBottom: 20 }}>
                                    {result.risk_level} — {pct}% probability
                                </div>
                                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", width: `${pct}%`, borderRadius: 4,
                                        background: isApproved ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#f87171,#ef4444)",
                                        boxShadow: isApproved ? "0 0 12px rgba(34,197,94,0.5)" : "0 0 12px rgba(239,68,68,0.5)",
                                        transition: "width 1.2s cubic-bezier(.16,1,.3,1)"
                                    }} />
                                </div>
                                {result.estimated_emi > 0 && (
                                    <div style={{
                                        marginTop: 20, padding: "14px 18px",
                                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                                        borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between"
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.4)", textTransform: "uppercase" }}>Est. EMI</div>
                                            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginTop: 2 }}>@ 10% p.a.</div>
                                        </div>
                                        <div style={{
                                            fontSize: 24, fontWeight: 900,
                                            background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
                                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                                        }}>
                                            ₹{result.estimated_emi.toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tips */}
                            {result.improvement_tips?.length > 0 && (
                                <div className="glass-panel" style={{
                                    padding: 24,
                                    background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)"
                                }}>
                                    <div style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#fbbf24",
                                        textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8
                                    }}>
                                        <span>💡</span> Recommendations
                                    </div>
                                    <ul style={{ listStyle: "none" }}>
                                        {result.improvement_tips.map((tip, i) => (
                                            <li key={i} style={{
                                                fontSize: 12, color: "rgba(251,191,36,0.8)",
                                                lineHeight: 1.7, marginBottom: 10, display: "flex", gap: 8
                                            }}>
                                                <span style={{ color: "#fbbf24", flexShrink: 0 }}>•</span> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* SHAP */}
                            {result.explanation && Object.keys(result.explanation).length > 0 && (
                                <div className="glass-panel" style={{ padding: 24 }}>
                                    <div style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.4)",
                                        textTransform: "uppercase", marginBottom: 16
                                    }}>SHAP Explainability</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {Object.entries(result.explanation).map(([feat, val]) => (
                                            <div key={feat} style={{
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                                                borderRadius: 10, padding: "9px 14px"
                                            }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.8)" }}>
                                                    {feat.replace(/_/g, " ")}
                                                </span>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                                                    background: val > 0 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                                                    color: val > 0 ? "#fca5a5" : "#86efac",
                                                    border: `1px solid ${val > 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`
                                                }}>
                                                    {val > 0 ? "▲" : "▼"} {Math.abs(val).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Interest Selection Section ── */}
                            {!leadSubmitted ? (
                                <div className="glass-panel lg-fade" style={{
                                    padding: 24,
                                    background: "rgba(124,77,255,0.04)",
                                    border: "1px solid rgba(124,77,255,0.2)",
                                    marginTop: 4,
                                }}>
                                    <div style={{
                                        fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#a78bfa",
                                        textTransform: "uppercase", marginBottom: 14
                                    }}>What would you like to do?</div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                                        {/* Interested */}
                                        <label onClick={() => setInterest("yes")}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                                                background: interest === "yes" ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${interest === "yes" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`,
                                                transition: "all 0.2s",
                                            }}>
                                            <div style={{
                                                width: 18, height: 18, borderRadius: "50%",
                                                border: `2px solid ${interest === "yes" ? "#4ade80" : "rgba(148,163,184,0.3)"}`,
                                                background: interest === "yes" ? "#4ade80" : "transparent",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, transition: "all 0.2s",
                                            }}>
                                                {interest === "yes" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: interest === "yes" ? "#86efac" : "#e2e8f0" }}>
                                                    ✅ I'm Interested — Please Contact Me
                                                </div>
                                                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.45)", marginTop: 2 }}>
                                                    A loan officer will reach out within 24 hours
                                                </div>
                                            </div>
                                        </label>

                                        {/* Not Interested */}
                                        <label onClick={() => setInterest("no")}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                                                background: interest === "no" ? "rgba(148,163,184,0.06)" : "rgba(255,255,255,0.02)",
                                                border: `1px solid ${interest === "no" ? "rgba(148,163,184,0.2)" : "rgba(255,255,255,0.06)"}`,
                                                transition: "all 0.2s",
                                            }}>
                                            <div style={{
                                                width: 18, height: 18, borderRadius: "50%",
                                                border: `2px solid ${interest === "no" ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.25)"}`,
                                                background: interest === "no" ? "rgba(148,163,184,0.3)" : "transparent",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, transition: "all 0.2s",
                                            }}>
                                                {interest === "no" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(148,163,184,0.8)" }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: interest === "no" ? "rgba(148,163,184,0.7)" : "#e2e8f0" }}>
                                                    ❌ Not Interested — Just Checking
                                                </div>
                                                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginTop: 2 }}>
                                                    No further action required
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Contact Fields — shown only if interested */}
                                    {interest === "yes" && (
                                        <div style={{
                                            display: "flex", flexDirection: "column", gap: 12,
                                            animation: "fadeUp 0.4s cubic-bezier(.16,1,.3,1) both"
                                        }}>
                                            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 4 }} />
                                            <div style={{
                                                fontSize: 9, fontWeight: 800, letterSpacing: 2,
                                                textTransform: "uppercase", color: "rgba(148,163,184,0.4)"
                                            }}>Your Contact Details</div>

                                            {/* Email */}
                                            <div>
                                                <label style={{
                                                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                                                    textTransform: "uppercase", color: "rgba(148,163,184,0.4)",
                                                    display: "block", marginBottom: 7
                                                }}>Email Address *</label>
                                                <div style={{ position: "relative" }}>
                                                    <span style={{
                                                        position: "absolute", left: 14, top: "50%",
                                                        transform: "translateY(-50%)", fontSize: 14, opacity: 0.4, pointerEvents: "none"
                                                    }}>📧</span>
                                                    <input type="email" name="email" value={contact.email}
                                                        onChange={handleContactChange}
                                                        placeholder="your@email.com" required
                                                        className="dark-input" style={{
                                                            paddingLeft: 40,
                                                            borderColor: contactErrors.email ? "rgba(239,68,68,0.5)" : undefined
                                                        }} />
                                                </div>
                                                {contactErrors.email && <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 600, marginTop: 4 }}>{contactErrors.email}</div>}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label style={{
                                                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                                                    textTransform: "uppercase", color: "rgba(148,163,184,0.4)",
                                                    display: "block", marginBottom: 7
                                                }}>Phone Number *</label>
                                                <div style={{ position: "relative" }}>
                                                    <span style={{
                                                        position: "absolute", left: 14, top: "50%",
                                                        transform: "translateY(-50%)", fontSize: 14, opacity: 0.4, pointerEvents: "none"
                                                    }}>📱</span>
                                                    <input type="tel" name="phone" value={contact.phone}
                                                        onChange={handleContactChange}
                                                        placeholder="10-digit mobile number" required
                                                        className="dark-input" style={{
                                                            paddingLeft: 40,
                                                            borderColor: contactErrors.phone ? "rgba(239,68,68,0.5)" : undefined
                                                        }} />
                                                </div>
                                                {contactErrors.phone && <div style={{ fontSize: 10, color: "#fca5a5", fontWeight: 600, marginTop: 4 }}>{contactErrors.phone}</div>}
                                            </div>

                                            <button type="button" onClick={handleSubmitLead}
                                                disabled={leadLoading || !contact.email || !contact.phone}
                                                className="shimmer-btn"
                                                style={{ padding: "13px 0", width: "100%", marginTop: 4 }}>
                                                {leadLoading ? (
                                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                                                        <span style={{
                                                            width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)",
                                                            borderTop: "2px solid white", borderRadius: "50%",
                                                            animation: "spin 1s linear infinite", display: "inline-block"
                                                        }} />
                                                        Submitting...
                                                    </span>
                                                ) : "📩 Submit Interest & Get Contacted"}
                                            </button>
                                        </div>
                                    )}

                                    {interest === "no" && (
                                        <div style={{
                                            padding: "12px 16px", borderRadius: 12,
                                            background: "rgba(148,163,184,0.06)",
                                            border: "1px solid rgba(148,163,184,0.1)",
                                            fontSize: 12, color: "rgba(148,163,184,0.5)",
                                            animation: "fadeUp 0.4s cubic-bezier(.16,1,.3,1) both",
                                        }}>
                                            👍 No problem! Your eligibility result is shown above for reference.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── Thank-you screen + document upload ── */
                                <div className="glass-panel lg-fade" style={{
                                    padding: 24,
                                    background: "rgba(34,197,94,0.05)",
                                    border: "1px solid rgba(34,197,94,0.2)",
                                    marginTop: 4,
                                }}>
                                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                                        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                                        <div style={{ fontWeight: 800, fontSize: 16, color: "#86efac", marginBottom: 6 }}>
                                            Thank You, {contact.name || form.ApplicantName || "Applicant"}!
                                        </div>
                                        <div style={{ fontSize: 12, color: "rgba(148,163,184,0.55)", lineHeight: 1.7 }}>
                                            Our loan officer will contact you at <strong style={{ color: "#a78bfa" }}>{contact.email}</strong><br />
                                            within 24 business hours. A confirmation email has been sent.
                                        </div>
                                    </div>

                                    {/* Document Upload */}
                                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                                        <div style={{
                                            fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(148,163,184,0.4)",
                                            textTransform: "uppercase", marginBottom: 4
                                        }}>📄 Upload Supporting Documents</div>
                                        <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginBottom: 14 }}>
                                            Optional but speeds up your application. Accepted: PDF, JPG, PNG.
                                        </div>

                                        {docs.map((d, i) => (
                                            <div key={i} style={{
                                                display: "flex", flexDirection: "column", gap: 8,
                                                marginBottom: 12, padding: 14,
                                                background: d.status === "uploaded" ? "rgba(34,197,94,0.07)" : d.status === "error" ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${d.status === "uploaded" ? "rgba(34,197,94,0.2)" : d.status === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
                                                borderRadius: 12,
                                            }}>
                                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                    <select value={d.docType}
                                                        onChange={e => { const u = [...docs]; u[i].docType = e.target.value; setDocs(u); }}
                                                        className="dark-select" style={{ flex: 1, fontSize: 12 }}>
                                                        {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    {i > 0 && (
                                                        <button type="button" onClick={() => setDocs(docs.filter((_, j) => j !== i))}
                                                            style={{
                                                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                                                                borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                                                                color: "#fca5a5", fontSize: 12, fontWeight: 700
                                                            }}>✕</button>
                                                    )}
                                                </div>
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                                    disabled={d.status === "uploaded"}
                                                    onChange={e => { const u = [...docs]; u[i].file = e.target.files[0]; u[i].status = null; setDocs(u); }}
                                                    style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }} />
                                                {d.status === "uploaded" && <div style={{ fontSize: 11, color: "#86efac", fontWeight: 700 }}>✅ Uploaded successfully</div>}
                                                {d.status === "error" && <div style={{ fontSize: 11, color: "#fca5a5", fontWeight: 700 }}>❌ Upload failed — please retry</div>}
                                            </div>
                                        ))}

                                        {docs.length < 5 && docs.every(d => d.status === "uploaded" || d.file) && (
                                            <button type="button"
                                                onClick={() => setDocs([...docs, { docType: "PAN Card", file: null, status: null, id: null }])}
                                                style={{
                                                    fontSize: 12, fontWeight: 700, color: "#a78bfa",
                                                    background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.2)",
                                                    borderRadius: 10, padding: "8px 16px", cursor: "pointer", marginBottom: 12
                                                }}>
                                                + Add Another Document
                                            </button>
                                        )}

                                        {docs.some(d => d.file && d.status !== "uploaded") && (
                                            <button type="button" onClick={handleDocUpload}
                                                disabled={docsUploading}
                                                className="shimmer-btn"
                                                style={{ width: "100%", padding: "12px" }}>
                                                {docsUploading ? (
                                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                                                        <span style={{
                                                            width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)",
                                                            borderTop: "2px solid white", borderRadius: "50%",
                                                            animation: "spin 1s linear infinite", display: "inline-block"
                                                        }} /> Uploading...
                                                    </span>
                                                ) : "📤 Upload Documents"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="glass-panel" style={{
                            padding: 48, display: "flex",
                            flexDirection: "column", alignItems: "center", justifyContent: "center",
                            textAlign: "center", minHeight: 300,
                            border: "2px dashed rgba(255,255,255,0.07)"
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔎</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "rgba(148,163,184,0.5)", marginBottom: 8 }}>Awaiting Details</div>
                            <div style={{ fontSize: 12, color: "rgba(148,163,184,0.35)", maxWidth: 220 }}>
                                Run an evaluation on the left panel to populate prediction analysis.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p style={{
                textAlign: "center", color: "rgba(148,163,184,0.2)",
                fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginTop: 48
            }}>
                Model inference demonstration only.
            </p>
        </div>
    );
}

export default EligibilityChecker;
