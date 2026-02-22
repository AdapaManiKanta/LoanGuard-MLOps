import io
from flask import send_file, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"), database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )


def generate_report(app_id):
    """Generate PDF Report for a Single Application
    ---
    parameters:
      - name: app_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: PDF file
      404:
        description: Application not found
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM applications WHERE id = %s", (app_id,))
        app = cursor.fetchone()
        cursor.close()
        conn.close()

        if not app:
            return jsonify({"error": "Application not found"}), 404

        app = dict(app)
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle("title", fontSize=22, fontName="Helvetica-Bold", spaceAfter=6, textColor=colors.HexColor("#3730A3"))
        sub_style = ParagraphStyle("sub", fontSize=10, textColor=colors.HexColor("#6B7280"), spaceAfter=20)
        section_style = ParagraphStyle("section", fontSize=12, fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=8, textColor=colors.HexColor("#1E293B"))
        body_style = styles["BodyText"]

        decision_color = colors.HexColor("#10B981") if app.get("prediction") == 1 else colors.HexColor("#EF4444")
        decision_text = "✓ APPROVED" if app.get("prediction") == 1 else "✗ REJECTED"

        story = [
            Paragraph("LoanGuard MLOps", title_style),
            Paragraph("AI-Powered Loan Assessment Report", sub_style),
            HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceAfter=16),

            Paragraph("Decision Summary", section_style),
            Table(
                [[Paragraph(f'<font color="{"#10B981" if app.get("prediction") == 1 else "#EF4444"}" size="18"><b>{decision_text}</b></font>', body_style),
                  Paragraph(f'Risk Level: <b>{app.get("risk_level", "N/A")}</b><br/>Approval Probability: <b>{round(float(app.get("probability", 0)) * 100, 1)}%</b>', body_style)]],
                colWidths=["40%", "60%"],
                style=TableStyle([("ALIGN", (0, 0), (-1, -1), "LEFT"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("BOTTOMPADDING", (0, 0), (-1, -1), 12)])
            ),

            Spacer(1, 12),
            Paragraph("Applicant Details", section_style),
            Table(
                [
                    ["Field", "Value"],
                    ["Application ID", f"#{app.get('id')}"],
                    ["Gender", app.get("gender", "-")],
                    ["Married", app.get("married", "-")],
                    ["Education", app.get("education", "-")],
                    ["Applicant Income", f"\u20b9{int(app.get('applicant_income', 0)):,}/mo"],
                    ["Co-applicant Income", f"\u20b9{int(app.get('coapplicant_income', 0)):,}/mo"],
                    ["Loan Amount", f"\u20b9{int(app.get('loan_amount', 0)) * 1000:,}"],
                    ["Loan Term", f"{app.get('loan_amount_term', '-')} months"],
                    ["Credit History", "Yes" if app.get("credit_history") == 1 else "No"],
                    ["Property Area", app.get("property_area", "-")],
                ],
                colWidths=["45%", "55%"],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3730A3")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.white]),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ])
            ),

            Spacer(1, 16),
            HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=8),
            Paragraph("This report is AI-generated and for informational purposes only. Not a formal loan offer.", 
                      ParagraphStyle("footer", fontSize=8, textColor=colors.HexColor("#9CA3AF"), alignment=TA_CENTER)),
        ]

        doc.build(story)
        buf.seek(0)
        return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name=f"loan_report_{app_id}.pdf")

    except Exception as e:
        return jsonify({"error": str(e)}), 500
