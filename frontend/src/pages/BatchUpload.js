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

            // Parse a quick summary from the CSV blob
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

            // Trigger download
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
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Batch Processing</h2>
            <p className="text-gray-500 text-sm mb-6">Upload a CSV of applications. Results will download automatically.</p>

            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}`}
            >
                <div className="text-5xl mb-3">📂</div>
                {file ? (
                    <p className="font-bold text-indigo-700">{file.name}</p>
                ) : (
                    <>
                        <p className="font-semibold text-gray-600">Drag & drop a CSV or click to browse</p>
                        <p className="text-xs text-gray-400 mt-1">Required columns: Gender, Married, Dependents, Education, Self_Employed, ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term, Credit_History, Property_Area</p>
                    </>
                )}
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setSummary(null); }} />
            </div>

            {/* Summary */}
            {summary && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {[["Total", summary.total, "text-indigo-600"], ["Approved", summary.approved, "text-green-600"], ["Rejected", summary.rejected, "text-red-600"]].map(([label, val, color]) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                            <p className={`text-3xl font-black mt-1 ${color}`}>{val}</p>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-2xl hover:from-indigo-500 hover:to-blue-500 transition-all disabled:opacity-40 uppercase tracking-widest"
            >
                {loading ? "Processing..." : "Process & Download Results"}
            </button>
        </div>
    );
}

export default BatchUpload;
