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

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-brand-dark">Batch Processing</h2>
            </div>
            <p className="text-slate-500 text-sm">Upload a CSV containing multiple applications to process them simultaneously. Outcomes will be downloaded automatically.</p>

            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
                className={`premium-card p-12 text-center cursor-pointer transition-all border-2 border-dashed ${dragging ? "border-brand-blue bg-blue-50" : "border-slate-200 hover:border-brand-blue hover:bg-slate-50"}`}
            >
                <div className="text-5xl mb-3">📂</div>
                {file ? (
                    <p className="font-bold text-brand-blue">{file.name}</p>
                ) : (
                    <>
                        <p className="font-bold text-brand-dark">Drag & drop a CSV or click to browse</p>
                        <p className="text-xs text-slate-400 mt-2">Required columns: Gender, Married, Dependents, Education, Self_Employed, ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term, Credit_History, Property_Area</p>
                    </>
                )}
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setSummary(null); }} />
            </div>

            {/* Summary */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
                    {[
                        { label: "Total Processed", val: summary.total, color: "text-brand-dark", bg: "bg-white", icon: "📊" },
                        { label: "Approved", val: summary.approved, color: "text-emerald-600", bg: "bg-emerald-50", icon: "✅" },
                        { label: "Rejected", val: summary.rejected, color: "text-red-600", bg: "bg-red-50", icon: "❌" }
                    ].map((s) => (
                        <div key={s.label} className={`premium-card p-5 ${s.bg}`}>
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                                <span className="text-lg opacity-80">{s.icon}</span>
                            </div>
                            <p className={`text-3xl font-black mt-2 ${s.color}`}>{s.val}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSubmit}
                    disabled={!file || loading}
                    className="btn-primary py-3 px-8 text-sm uppercase tracking-widest font-bold disabled:opacity-50 min-w-[200px]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                            Processing...
                        </span>
                    ) : "Process Data"}
                </button>
            </div>
        </div>
    );
}

export default BatchUpload;
