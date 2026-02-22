"""
monitoring.py — Model Drift Detection
Compares rolling 7-day accuracy against a baseline.
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

BASELINE_ACCURACY = float(os.getenv("BASELINE_ACCURACY", "0.82"))


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )


def get_drift_status():
    """
    GET /drift-status
    Computes rolling 7-day accuracy by comparing model predictions
    against a simple ground-truth proxy: applications with high income +
    credit history = expected Approved; otherwise Rejected.
    Returns drift_detected=True if accuracy drops >10% below baseline.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Last 7 days of predictions
        cursor.execute("""
            SELECT applicant_income, credit_history, prediction, probability
            FROM applications
            WHERE created_at >= NOW() - INTERVAL '7 days'
            ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if not rows:
            return {
                "drift_detected": False,
                "accuracy_7d": None,
                "accuracy_baseline": BASELINE_ACCURACY,
                "sample_size": 0,
                "message": "No predictions in the last 7 days."
            }

        # Simple proxy ground truth
        correct = 0
        for row in rows:
            expected = 1 if (row["applicant_income"] > 3000 and row["credit_history"] == 1) else 0
            if row["prediction"] == expected:
                correct += 1

        accuracy_7d = round(correct / len(rows), 4)
        drift_detected = accuracy_7d < (BASELINE_ACCURACY - 0.10)

        return {
            "drift_detected": drift_detected,
            "accuracy_7d": accuracy_7d,
            "accuracy_baseline": BASELINE_ACCURACY,
            "sample_size": len(rows),
            "message": (
                "⚠️ Model drift detected — accuracy dropped significantly. Consider retraining."
                if drift_detected else
                "✅ Model performance is stable."
            )
        }

    except Exception as e:
        return {"drift_detected": False, "error": str(e)}
