import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "http://127.0.0.1:5000";

function BatchUpload({ token }) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const fileRef = useRef();

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f?.name.endsWith(".csv")) { setFile(f); setSummary(null); }
        else toast.error("Please upload a .csv file");
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        const form = new FormData();
        form.append("file", file);
        try {
            const res = await axios.post(`${API_BASE}/batch-predict`, form, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                responseType: "blob"
            });
            const text = await res.data.text();
            const lines = text.trim().split("\n");
            const headers = lines[0].split(",");
            const predIdx = headers.indexOf("Prediction");
            let approved = 0, rejected = 0;
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(",");
                if (cols[predIdx] === "Approved") approved++;
                else if (cols[predIdx] === "Rejected") rejected++;
            }
            setSummary({ total: lines.length - 1, approved, rejected });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url; a.download = "loan_predictions.csv"; a.click();
            toast.success(`✅ ${lines.length - 1} applications processed!`);
        } catch (e) {
            toast.error("❌ Batch processing failed. Check your CSV format.");
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
    };

    return (
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header */}
            <div style={{ paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>
                    Batch Processing
                </h2>
                <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
                    Upload a CSV to process multiple applications simultaneously.
                </p>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
                style={{
                    ...cardStyle,
                    padding: "60px 40px", textAlign: "center", cursor: "pointer",
                    border: dragging ? "2px dashed #7c4dff" : file ? "2px dashed rgba(34,197,94,0.4)" : "2px dashed rgba(255,255,255,0.08)",
                    background: dragging ? "rgba(124,77,255,0.06)" : file ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
                    transition: "all 0.25s",
                }}>
                <div style={{
                    fontSize: 52, marginBottom: 16, lineHeight: 1,
                    filter: dragging ? "drop-shadow(0 0 20px rgba(124,77,255,0.7))" : "none",
                    transition: "filter 0.25s"
                }}>
                    {file ? "✅" : "📂"}
                </div>
                {file ? (
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 16, color: "#86efac", marginBottom: 6 }}>{file.name}</p>
                        <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
                            {(file.size / 1024).toFixed(1)} KB · Click to change
                        </p>
                    </div>
                ) : (
                    <>
                        <p style={{ fontWeight: 700, fontSize: 16, color: "rgba(148,163,184,0.7)", marginBottom: 10 }}>
                            Drag & drop a CSV or <span style={{ color: "#a78bfa" }}>click to browse</span>
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(148,163,184,0.35)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
                            Required columns: Gender, Married, Dependents, Education, Self_Employed,
                            ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term, Credit_History, Property_Area
                        </p>
                    </>
                )}
                <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                    onChange={e => { setFile(e.target.files[0]); setSummary(null); }} />
            </div>

            {/* Summary cards */}
            {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {[
                        { label: "Total Processed", val: summary.total, icon: "📊", color: "#a78bfa", bg: "rgba(124,77,255,0.08)", border: "rgba(124,77,255,0.2)" },
                        { label: "Approved", val: summary.approved, icon: "✅", color: "#86efac", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" },
                        { label: "Rejected", val: summary.rejected, icon: "❌", color: "#fca5a5", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: s.bg, border: `1px solid ${s.border}`,
                            borderRadius: 18, padding: "20px 24px",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                                    color: "rgba(148,163,184,0.4)"
                                }}>{s.label}</span>
                                <span style={{ fontSize: 20 }}>{s.icon}</span>
                            </div>
                            <div style={{
                                fontSize: 38, fontWeight: 900, color: s.color,
                                fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1
                            }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSubmit} disabled={!file || loading}
                    style={{
                        padding: "14px 36px",
                        background: !file || loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#7c4dff,#3b82f6)",
                        border: "none", borderRadius: 100, cursor: !file || loading ? "not-allowed" : "pointer",
                        color: !file || loading ? "rgba(148,163,184,0.3)" : "white",
                        fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase",
                        minWidth: 200, transition: "all 0.2s",
                        boxShadow: !file || loading ? "none" : "0 8px 30px rgba(124,77,255,0.4)",
                    }}
                    onMouseEnter={e => { if (!loading && file) e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
                    {loading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                            <span style={{
                                width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)",
                                borderTop: "2px solid white", borderRadius: "50%",
                                display: "inline-block", animation: "spin 1s linear infinite"
                            }} />
                            Processing...
                        </span>
                    ) : "⚡ Process Data"}
                </button>
            </div>

            {/* Format guide */}
            <div style={{
                background: "rgba(124,77,255,0.06)", border: "1px solid rgba(124,77,255,0.15)",
                borderRadius: 16, padding: 20
            }}>
                <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(124,77,255,0.6)",
                    textTransform: "uppercase", marginBottom: 12
                }}>📋 CSV Format Guide</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[
                        "Gender — Male/Female",
                        "Married — Yes/No",
                        "Dependents — 0/1/2/3+",
                        "Education — Graduate/Not Graduate",
                        "Self_Employed — Yes/No",
                        "ApplicantIncome — numeric",
                        "CoapplicantIncome — numeric",
                        "LoanAmount — numeric (₹)",
                        "Loan_Amount_Term — months",
                        "Credit_History — 0 or 1",
                        "Property_Area — Urban/Rural/Semiurban",
                    ].map(f => (
                        <div key={f} style={{
                            fontSize: 10, color: "rgba(148,163,184,0.45)",
                            padding: "4px 10px", background: "rgba(255,255,255,0.02)",
                            borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)"
                        }}>
                            {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BatchUpload;
