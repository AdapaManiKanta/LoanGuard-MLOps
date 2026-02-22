from flask import jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import os


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )


def get_trends():
    """Get application trends by date
    ---
    responses:
      200:
        description: Daily approval/rejection counts for the last 30 days
    """
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT
            DATE(created_at) as date,
            COUNT(*) FILTER (WHERE prediction = 1) as approved,
            COUNT(*) FILTER (WHERE prediction = 0) as rejected
        FROM applications
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([dict(r) for r in rows])


def get_income_bracket():
    """Get approval statistics by income bracket
    ---
    responses:
      200:
        description: Approval rates bucketed by income
    """
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT
            CASE
                WHEN applicant_income < 3000 THEN '<3k'
                WHEN applicant_income < 6000 THEN '3k-6k'
                WHEN applicant_income < 10000 THEN '6k-10k'
                ELSE '10k+'
            END as bracket,
            COUNT(*) FILTER (WHERE prediction = 1) as approved,
            COUNT(*) FILTER (WHERE prediction = 0) as rejected,
            COUNT(*) as total
        FROM applications
        GROUP BY bracket
        ORDER BY MIN(applicant_income)
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([dict(r) for r in rows])


def get_risk_distribution():
    """Get risk level distribution
    ---
    responses:
      200:
        description: Count of applications per risk level
    """
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT risk_level, COUNT(*) as count
        FROM applications
        GROUP BY risk_level
    """)  
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([dict(r) for r in rows])
