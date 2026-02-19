import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const API_BASE = "http://127.0.0.1:5000";

  const [formData, setFormData] = useState({
    Gender: "Male",
    Married: "Yes",
    Dependents: "0",
    Education: "Graduate",
    Self_Employed: "No",
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 120,
    Loan_Amount_Term: 360,
    Credit_History: 1,
    Property_Area: "Urban",
  });

  const [result, setResult] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);

  const numericFields = [
    "ApplicantIncome",
    "CoapplicantIncome",
    "LoanAmount",
    "Loan_Amount_Term",
    "Credit_History"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? Number(value) : value
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE}/predict`, formData);
      setResult(response.data);
      fetchApplications();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || "Server error");
    }
  };

  const fetchApplications = async () => {
    const res = await axios.get(`${API_BASE}/applications`);
    setApplications(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get(`${API_BASE}/stats`);
    setStats(res.data);
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Loan Risk Management Dashboard</h1>

      <h2>Loan Application Form</h2>

      {Object.keys(formData).map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>{key}</label>
          <input
            type={numericFields.includes(key) ? "number" : "text"}
            name={key}
            value={formData[key]}
            onChange={handleChange}
            style={{ marginLeft: 10 }}
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Submit Application</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Prediction Result</h3>
          <p>Prediction: {result.prediction}</p>
          <p>Probability: {result.probability}</p>
          <p>Risk Level: {result.risk_level}</p>
        </div>
      )}

      <hr />

      <h2>Statistics</h2>
      {stats && (
        <div>
          <p>Total: {stats.total_applications}</p>
          <p>Approved: {stats.approved}</p>
          <p>Rejected: {stats.rejected}</p>
        </div>
      )}

      <hr />

      <h2>All Applications</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Gender</th>
            <th>Income</th>
            <th>Prediction</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.gender}</td>
              <td>{app.applicant_income}</td>
              <td>{app.prediction}</td>
              <td>{app.risk_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
