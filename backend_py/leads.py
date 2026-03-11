"""
leads.py — Loan Interest / Lead Capture + Document Verification routes
Registered on app.py via: from leads import register_leads_routes; register_leads_routes(app)
"""

import os
import json
import uuid
import requests as _req
from datetime import datetime
from flask import request, jsonify, send_from_directory
from psycopg2.extras import RealDictCursor
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
DOC_TYPES = ["Aadhaar Card", "PAN Card", "Income Proof", "Bank Statement", "Property Papers", "Other"]

RESEND_API_KEY   = os.getenv("RESEND_API_KEY", "")
RESEND_FROM      = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
APP_URL          = os.getenv("APP_URL", "http://localhost:3000")
ALERT_EMAIL      = os.getenv("ALERT_EMAIL", "")


# ── DB init ────────────────────────────────────────────────────────────────────

def init_leads_tables(get_conn):
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS loan_leads (
            id              SERIAL PRIMARY KEY,
            applicant_name  TEXT,
            email           TEXT NOT NULL,
            phone           TEXT NOT NULL,
            ai_result       JSONB,
            status          TEXT DEFAULT 'NEW',
            notes           TEXT,
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS lead_documents (
            id               SERIAL PRIMARY KEY,
            lead_id          INTEGER REFERENCES loan_leads(id) ON DELETE CASCADE,
            doc_type         TEXT,
            filename         TEXT,
            file_path        TEXT,
            status           TEXT DEFAULT 'PENDING',
            rejection_reason TEXT,
            uploaded_at      TIMESTAMPTZ DEFAULT NOW(),
            verified_at      TIMESTAMPTZ,
            verified_by      TEXT
        )
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("[LoanGuard] loan_leads and lead_documents tables ready.")


# ── Email helpers ──────────────────────────────────────────────────────────────

def _send(to_email: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY or not to_email:
        return False
    try:
        r = _req.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={"from": f"LoanGuard AI <{RESEND_FROM}>", "to": [to_email], "subject": subject, "html": html},
            timeout=10,
        )
        return r.status_code == 200
    except Exception as e:
        print(f"[Email] Failed: {e}")
        return False


def _header(title: str, subtitle: str = "") -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#070711;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#070711;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
       style="background:#0f0f1a;border-radius:20px;overflow:hidden;
              border:1px solid rgba(255,255,255,0.08);max-width:560px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#7c4dff,#3b82f6);padding:32px 40px;text-align:center;">
  <div style="font-weight:900;font-size:20px;color:#fff;letter-spacing:-0.5px;">LoanGuard <span style="opacity:0.7">AI</span></div>
  <h1 style="margin:12px 0 4px;color:white;font-size:22px;font-weight:800;">{title}</h1>
  {"<p style='margin:0;color:rgba(255,255,255,0.6);font-size:13px;'>" + subtitle + "</p>" if subtitle else ""}
</td></tr>
<tr><td style="padding:32px 40px;">"""


def _footer() -> str:
    return """</td></tr>
<tr><td style="padding:16px 40px 28px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
  <p style="margin:0;color:rgba(148,163,184,0.2);font-size:10px;">
    LoanGuard AI — Automated Loan Risk Assessment<br>This is an automated message. Please do not reply.
  </p>
</td></tr>
</table></td></tr></table></body></html>"""


def _row(label, value, color="#f1f5f9"):
    return f"""<tr>
<td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);
           color:rgba(148,163,184,0.4);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;width:40%;">{label}</td>
<td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);
           color:{color};font-size:13px;font-weight:700;">{value}</td>
</tr>"""


def send_thankyou_email(name, email, ai_result):
    """Send thank-you email to interested applicant."""
    pred_label = "✅ Likely Approved" if ai_result.get("prediction") == 1 else "⚠️ Further Review Needed"
    prob       = f"{round((ai_result.get('probability', 0)) * 100, 1)}%"
    risk       = ai_result.get("risk_level", "—")

    html = _header("Thank You For Your Interest! 🎉",
                   "Our loan officer will contact you within 24 business hours")
    html += f"""
<p style="color:#e2e8f0;font-size:15px;margin:0 0 20px;">Hi <strong>{name}</strong>,</p>
<p style="color:rgba(148,163,184,0.6);font-size:13px;line-height:1.8;margin:0 0 24px;">
  We have received your loan interest request. Your AI-based eligibility assessment is summarised below.
  Our team will review your application and contact you soon.
</p>

<table width="100%" cellpadding="0" cellspacing="0"
       style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
              border-radius:14px;overflow:hidden;margin-bottom:24px;">
  {_row("AI Verdict", pred_label, "#86efac" if ai_result.get('prediction')==1 else "#fde68a")}
  {_row("Approval Probability", prob, "#a78bfa")}
  {_row("Risk Level", risk)}
</table>

<div style="background:rgba(124,77,255,0.08);border:1px solid rgba(124,77,255,0.2);
            border-radius:12px;padding:16px 18px;margin-bottom:24px;">
  <p style="margin:0;color:#a78bfa;font-size:13px;font-weight:600;">
    📄 <strong>Next Step:</strong> Upload your supporting documents (Aadhaar, PAN, Income Proof, Bank Statement)
    to speed up your application review.
  </p>
</div>

<div style="text-align:center;">
  <a href="{APP_URL}" style="display:inline-block;padding:13px 32px;
    background:linear-gradient(135deg,#7c4dff,#3b82f6);border-radius:100px;
    color:white;font-weight:700;font-size:13px;text-decoration:none;">
    Upload Documents →
  </a>
</div>
"""
    html += _footer()
    return _send(email, "Thank you for your interest in LoanGuard AI!", html)


def send_manager_alert_email(name, email, phone, ai_result):
    """Alert manager about new lead."""
    if not ALERT_EMAIL:
        return False
    pred_label = "Likely Approved" if ai_result.get("prediction") == 1 else "Needs Review"
    prob       = f"{round((ai_result.get('probability', 0)) * 100, 1)}%"
    risk       = ai_result.get("risk_level", "—")

    html = _header("🔔 New Loan Lead Submitted", "A customer has expressed interest in a loan")
    html += f"""
<p style="color:rgba(148,163,184,0.6);font-size:13px;line-height:1.8;margin:0 0 24px;">
  A new applicant has submitted an interest request through the LoanGuard portal.
</p>
<table width="100%" cellpadding="0" cellspacing="0"
       style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
              border-radius:14px;overflow:hidden;margin-bottom:24px;">
  {_row("Name",  name)}
  {_row("Email", email, "#60a5fa")}
  {_row("Phone", phone, "#60a5fa")}
  {_row("AI Verdict", pred_label, "#86efac" if ai_result.get('prediction')==1 else "#fde68a")}
  {_row("Probability", prob, "#a78bfa")}
  {_row("Risk Level", risk)}
</table>
<div style="text-align:center;">
  <a href="{APP_URL}/dashboard" style="display:inline-block;padding:13px 32px;
    background:linear-gradient(135deg,#7c4dff,#3b82f6);border-radius:100px;
    color:white;font-weight:700;font-size:13px;text-decoration:none;">
    View in Dashboard →
  </a>
</div>
"""
    html += _footer()
    return _send(ALERT_EMAIL, f"[LoanGuard] New Lead: {name}", html)


def send_docs_verified_email(name, email):
    """Email applicant when all documents are verified."""
    html = _header("Documents Verified! 🎉", "Congratulations — your application is moving forward")
    html += f"""
<p style="color:#e2e8f0;font-size:15px;margin:0 0 12px;">Hi <strong>{name}</strong>,</p>
<p style="color:rgba(148,163,184,0.6);font-size:13px;line-height:1.8;margin:0 0 24px;">
  Great news! Our team has successfully <strong style="color:#86efac;">verified all your submitted documents</strong>.
  Your loan application is now under formal review.
</p>
<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);
            border-radius:12px;padding:16px 18px;margin-bottom:24px;">
  <p style="margin:0;color:#86efac;font-size:13px;font-weight:600;">
    ✅ Our loan officer will be in touch within <strong>2–3 business days</strong> to finalise your application.
  </p>
</div>
"""
    html += _footer()
    return _send(email, "✅ Your documents have been verified — LoanGuard AI", html)


def send_docs_rejected_email(name, email, reason):
    """Email applicant when documents are rejected."""
    html = _header("Action Required — Documents Need Re-submission", "Please review the feedback and re-upload")
    html += f"""
<p style="color:#e2e8f0;font-size:15px;margin:0 0 12px;">Hi <strong>{name}</strong>,</p>
<p style="color:rgba(148,163,184,0.6);font-size:13px;line-height:1.8;margin:0 0 24px;">
  Our verification team has reviewed your documents. Unfortunately, one or more documents could not be accepted.
</p>
<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
            border-radius:12px;padding:16px 18px;margin-bottom:24px;">
  <div style="font-size:10px;font-weight:800;letter-spacing:2px;
              text-transform:uppercase;color:#fca5a5;margin-bottom:8px;">Reason</div>
  <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">{reason}</p>
</div>
<p style="color:rgba(148,163,184,0.6);font-size:13px;line-height:1.8;margin:0 0 24px;">
  Please re-upload a clear, readable copy of the required document(s) and resubmit.
</p>
<div style="text-align:center;">
  <a href="{APP_URL}" style="display:inline-block;padding:13px 32px;
    background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:100px;
    color:white;font-weight:700;font-size:13px;text-decoration:none;">
    Re-upload Documents →
  </a>
</div>
"""
    html += _footer()
    return _send(email, "⚠️ Documents require re-submission — LoanGuard AI", html)


# ── Route registration ─────────────────────────────────────────────────────────

def register_leads_routes(app, get_conn, role_required, token_required, audit_log_fn):

    # POST /leads  — public, submit interest
    @app.route("/leads", methods=["POST"])
    def submit_lead():
        data  = request.json or {}
        name  = (data.get("applicant_name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        phone = (data.get("phone") or "").strip()
        ai    = data.get("ai_result") or {}

        if not email or not phone:
            return jsonify({"error": "email and phone are required"}), 400
        if len(phone.replace(" ", "")) < 10:
            return jsonify({"error": "Enter a valid phone number (min 10 digits)"}), 400

        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)

        # Duplicate guard
        cur.execute("SELECT id FROM loan_leads WHERE email=%s AND phone=%s", (email, phone))
        existing = cur.fetchone()
        if existing:
            cur.close(); conn.close()
            return jsonify({"error": "An application with this email and phone already exists.", "lead_id": existing["id"]}), 409

        cur.execute(
            """INSERT INTO loan_leads (applicant_name, email, phone, ai_result)
               VALUES (%s, %s, %s, %s::jsonb) RETURNING id""",
            (name, email, phone, json.dumps(ai))
        )
        lead_id = cur.fetchone()["id"]
        conn.commit()
        cur.close(); conn.close()

        # Send emails (non-blocking — failures don't affect response)
        send_thankyou_email(name or "Applicant", email, ai)
        send_manager_alert_email(name or "Applicant", email, phone, ai)

        try:
            audit_log_fn("LEAD_SUBMITTED", "public", {"lead_id": lead_id, "email": email})
        except Exception:
            pass

        return jsonify({"message": "Interest submitted", "lead_id": lead_id}), 201


    # POST /leads/<id>/documents  — public, file upload
    @app.route("/leads/<int:lead_id>/documents", methods=["POST"])
    def upload_document(lead_id):
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        f        = request.files["file"]
        doc_type = request.form.get("doc_type", "Other")
        if doc_type not in DOC_TYPES:
            doc_type = "Other"

        fname = secure_filename(f.filename or "upload")
        ext   = os.path.splitext(fname)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Only PDF, JPG, JPEG, PNG files are accepted"}), 400

        # Unique name to avoid collisions
        stored_name = f"{lead_id}_{uuid.uuid4().hex[:8]}_{fname}"
        file_path   = os.path.join(UPLOAD_FOLDER, stored_name)
        f.save(file_path)

        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """INSERT INTO lead_documents (lead_id, doc_type, filename, file_path)
               VALUES (%s, %s, %s, %s) RETURNING id""",
            (lead_id, doc_type, fname, stored_name)
        )
        doc_id = cur.fetchone()["id"]
        # Update lead status to DOCS_SUBMITTED
        cur.execute(
            "UPDATE loan_leads SET status='DOCS_SUBMITTED', updated_at=NOW() WHERE id=%s AND status NOT IN ('VERIFIED','REJECTED')",
            (lead_id,)
        )
        conn.commit()
        cur.close(); conn.close()
        return jsonify({"message": "Document uploaded", "doc_id": doc_id}), 201


    # GET /leads/<id>/documents  — public (lead owner retrieves their docs)
    @app.route("/leads/<int:lead_id>/documents", methods=["GET"])
    def get_lead_documents_public(lead_id):
        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, doc_type, filename, status, rejection_reason, uploaded_at FROM lead_documents WHERE lead_id=%s ORDER BY id", (lead_id,))
        docs = [dict(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return jsonify({"documents": docs})


    # GET /admin/leads  — MANAGER, ADMIN
    @app.route("/admin/leads", methods=["GET"])
    @role_required("MANAGER", "ADMIN")
    def get_all_leads():
        status_filter = request.args.get("status", "")
        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        if status_filter:
            cur.execute(
                """SELECT l.*, COUNT(d.id) AS doc_count,
                          COUNT(d.id) FILTER (WHERE d.status='VERIFIED') AS docs_verified,
                          COUNT(d.id) FILTER (WHERE d.status='REJECTED') AS docs_rejected
                   FROM loan_leads l LEFT JOIN lead_documents d ON d.lead_id=l.id
                   WHERE l.status=%s GROUP BY l.id ORDER BY l.created_at DESC""",
                (status_filter,)
            )
        else:
            cur.execute(
                """SELECT l.*, COUNT(d.id) AS doc_count,
                          COUNT(d.id) FILTER (WHERE d.status='VERIFIED') AS docs_verified,
                          COUNT(d.id) FILTER (WHERE d.status='REJECTED') AS docs_rejected
                   FROM loan_leads l LEFT JOIN lead_documents d ON d.lead_id=l.id
                   GROUP BY l.id ORDER BY l.created_at DESC"""
            )
        rows = [dict(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return jsonify({"leads": rows})


    # PATCH /admin/leads/<id>/status  — update lead status/notes
    @app.route("/admin/leads/<int:lead_id>/status", methods=["PATCH"])
    @role_required("MANAGER", "ADMIN")
    def update_lead_status(lead_id):
        data   = request.json or {}
        status = (data.get("status") or "").upper()
        notes  = data.get("notes", "")
        valid  = {"NEW", "CONTACTED", "DOCS_SUBMITTED", "VERIFIED", "REJECTED"}
        if status not in valid:
            return jsonify({"error": f"status must be one of {valid}"}), 400

        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT applicant_name, email FROM loan_leads WHERE id=%s", (lead_id,))
        lead = cur.fetchone()
        if not lead:
            cur.close(); conn.close()
            return jsonify({"error": "Lead not found"}), 404

        cur.execute(
            "UPDATE loan_leads SET status=%s, notes=%s, updated_at=NOW() WHERE id=%s",
            (status, notes, lead_id)
        )
        conn.commit()
        cur.close(); conn.close()

        # Send email based on final status
        if status == "VERIFIED":
            send_docs_verified_email(lead["applicant_name"] or "Applicant", lead["email"])
        elif status == "REJECTED" and notes:
            send_docs_rejected_email(lead["applicant_name"] or "Applicant", lead["email"], notes)

        try:
            audit_log_fn("LEAD_STATUS_CHANGED", request.current_user, {"lead_id": lead_id, "status": status})
        except Exception:
            pass
        return jsonify({"message": f"Lead {lead_id} updated to {status}"})


    # GET /admin/leads/<id>/documents  — list docs for one lead
    @app.route("/admin/leads/<int:lead_id>/documents", methods=["GET"])
    @role_required("MANAGER", "ADMIN")
    def get_lead_documents(lead_id):
        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT * FROM lead_documents WHERE lead_id=%s ORDER BY id",
            (lead_id,)
        )
        docs = [dict(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return jsonify({"documents": docs})


    # POST /admin/leads/<id>/documents/<doc_id>/verify  — approve or reject a doc
    @app.route("/admin/leads/<int:lead_id>/documents/<int:doc_id>/verify", methods=["POST"])
    @role_required("MANAGER", "ADMIN")
    def verify_document(lead_id, doc_id):
        data   = request.json or {}
        action = (data.get("action") or "").upper()
        reason = (data.get("reason") or "").strip()
        if action not in ("VERIFIED", "REJECTED"):
            return jsonify({"error": "action must be VERIFIED or REJECTED"}), 400
        if action == "REJECTED" and not reason:
            return jsonify({"error": "reason is required when rejecting a document"}), 400

        conn = get_conn()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """UPDATE lead_documents
               SET status=%s, rejection_reason=%s, verified_at=NOW(), verified_by=%s
               WHERE id=%s AND lead_id=%s RETURNING id""",
            (action, reason if action == "REJECTED" else None,
             request.current_user, doc_id, lead_id)
        )
        updated = cur.fetchone()
        if not updated:
            conn.rollback(); cur.close(); conn.close()
            return jsonify({"error": "Document not found"}), 404

        # Check if all docs are now resolved — auto-update lead status
        cur.execute(
            "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='PENDING') AS pending FROM lead_documents WHERE lead_id=%s",
            (lead_id,)
        )
        counts = cur.fetchone()
        lead_update_status = None
        if counts["pending"] == 0 and counts["total"] > 0:
            # Check if any rejected
            cur.execute("SELECT COUNT(*) AS rej FROM lead_documents WHERE lead_id=%s AND status='REJECTED'", (lead_id,))
            rej = cur.fetchone()["rej"]
            lead_update_status = "REJECTED" if rej > 0 else "VERIFIED"
            cur.execute(
                "UPDATE loan_leads SET status=%s, updated_at=NOW() WHERE id=%s RETURNING applicant_name, email",
                (lead_update_status, lead_id)
            )
            lead = cur.fetchone()
        else:
            lead = None

        conn.commit()
        cur.close(); conn.close()

        # Send emails when all docs resolved
        if lead_update_status and lead:
            if lead_update_status == "VERIFIED":
                send_docs_verified_email(lead["applicant_name"] or "Applicant", lead["email"])
            elif lead_update_status == "REJECTED":
                cur2 = get_conn().cursor(cursor_factory=RealDictCursor)
                cur2.execute(
                    "SELECT rejection_reason FROM lead_documents WHERE lead_id=%s AND status='REJECTED' LIMIT 1",
                    (lead_id,)
                )
                rej_row = cur2.fetchone()
                cur2.close()
                rej_reason = rej_row["rejection_reason"] if rej_row else "Document quality insufficient."
                send_docs_rejected_email(lead["applicant_name"] or "Applicant", lead["email"], rej_reason)

        try:
            audit_log_fn("DOC_VERIFIED", request.current_user, {
                "lead_id": lead_id, "doc_id": doc_id, "action": action
            })
        except Exception:
            pass
        return jsonify({"message": f"Document {doc_id} marked as {action}", "lead_status": lead_update_status})


    # GET /uploads/<filename>  — serve uploaded files
    @app.route("/uploads/<filename>", methods=["GET"])
    def serve_upload(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)
