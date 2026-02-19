from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load ML model
model = joblib.load("models/loan_model.pkl")
scaler = joblib.load("models/scaler.pkl")
label_encoders = joblib.load("models/label_encoders.pkl")

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

def classify_risk(prob):
    if prob < 0.3:
        return "Low Risk"
    elif prob <= 0.6:
        return "Medium Risk"
    else:
        return "High Risk"

@app.route("/")
def home():
    return jsonify({"message": "Loan Risk API Running"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        if not data:
            return jsonify({"error": "No input provided"}), 400

        df = pd.DataFrame([data])

        # Encode categorical features
        for col in df.columns:
            if col in label_encoders:
                df[col] = label_encoders[col].transform(df[col])

        df_scaled = scaler.transform(df)

        prediction = model.predict(df_scaled)[0]
        probability = model.predict_proba(df_scaled)[0][1]
        risk_level = classify_risk(probability)

        # Save to Supabase
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO applications (
                gender, married, dependents, education, self_employed,
                applicant_income, coapplicant_income, loan_amount,
                loan_term, credit_history, property_area,
                prediction, probability, risk_level, created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data.get("Gender"),
            data.get("Married"),
            data.get("Dependents"),
            data.get("Education"),
            data.get("Self_Employed"),
            int(data.get("ApplicantIncome")),
            int(data.get("CoapplicantIncome")),
            int(data.get("LoanAmount")),
            int(data.get("Loan_Amount_Term")),
            int(data.get("Credit_History")),
            data.get("Property_Area"),
            int(prediction),
            float(probability),
            risk_level,
            datetime.now()
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "prediction": int(prediction),
            "probability": round(float(probability), 4),
            "risk_level": risk_level
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/applications", methods=["GET"])
def get_applications():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM applications ORDER BY id DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


@app.route("/stats", methods=["GET"])
def stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM applications")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM applications WHERE prediction = 1")
    approved = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM applications WHERE prediction = 0")
    rejected = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return jsonify({
        "total_applications": total,
        "approved": approved,
        "rejected": rejected
    })


if __name__ == "__main__":
    app.run(debug=True)
