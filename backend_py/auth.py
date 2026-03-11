import os
import jwt
import json
import hashlib
import requests
from functools import wraps
from flask import request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        sslmode="require",
        connect_timeout=10
    )


def hash_password(password: str) -> str:
    """SHA-256 hash (simple — use bcrypt for production)."""
    return hashlib.sha256(password.encode()).hexdigest()


def init_users_table():
    """Create lg_users table and seed default users if empty."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS lg_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(60) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150),
            role VARCHAR(20) NOT NULL DEFAULT 'OFFICER',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    conn.commit()

    # Seed defaults if empty
    cur.execute("SELECT COUNT(*) FROM lg_users")
    count = cur.fetchone()[0]
    if count == 0:
        defaults = [
            (os.getenv("ADMIN_USER", "admin"),   os.getenv("ADMIN_PASS", "password"),    "Administrator",   "ADMIN"),
            (os.getenv("MANAGER_USER", "manager"), os.getenv("MANAGER_PASS", "manager123"), "Branch Manager", "MANAGER"),
            (os.getenv("OFFICER_USER", "officer"), os.getenv("OFFICER_PASS", "officer123"), "Loan Officer",   "OFFICER"),
        ]
        for username, password, name, role in defaults:
            cur.execute(
                "INSERT INTO lg_users (username, password_hash, name, role) VALUES (%s, %s, %s, %s) ON CONFLICT (username) DO NOTHING",
                (username, hash_password(password), name, role)
            )
        conn.commit()
        print("[LoanGuard] lg_users table seeded with 3 default users.")
    else:
        print(f"[LoanGuard] lg_users table ready ({count} users).")

    cur.close()
    conn.close()


def authenticate_user(username: str, password: str):
    """Return user dict if credentials are valid, else None."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT * FROM lg_users WHERE username = %s AND is_active = TRUE",
        (username,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user and user["password_hash"] == hash_password(password):
        return dict(user)
    return None


# ── Decorators ────────────────────────────────────────────────────────────────

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.current_user = payload.get("sub")
            request.current_role = payload.get("role", "OFFICER")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing token"}), 401
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                role = payload.get("role", "OFFICER")
                if role not in allowed_roles:
                    return jsonify({"error": f"Access denied — requires {' or '.join(allowed_roles)}"}), 403
                request.current_user = payload.get("sub")
                request.current_role = role
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
            return f(*args, **kwargs)
        return decorated
    return decorator


# ── Admin user management ──────────────────────────────────────────────────────

def get_admin_users():
    """GET /admin/users — return all users from DB."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT id, username, name, email, role, is_active, created_at FROM lg_users ORDER BY id"
    )
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify({"users": rows})


def create_user():
    """POST /admin/users — create a new user and optionally email credentials."""
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    name     = (data.get("name")     or "").strip()
    email    = (data.get("email")    or "").strip()
    role     = (data.get("role")     or "OFFICER").strip().upper()

    if not username or not password or not name:
        return jsonify({"error": "username, password, and name are required"}), 400
    if role not in ("ADMIN", "MANAGER", "OFFICER"):
        return jsonify({"error": "role must be ADMIN, MANAGER, or OFFICER"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO lg_users (username, password_hash, name, email, role)
               VALUES (%s, %s, %s, %s, %s) RETURNING id""",
            (username, hash_password(password), name, email or None, role)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Username '{username}' already exists"}), 409
    finally:
        cur.close()
        conn.close()

    email_sent = False
    if email:
        email_sent = send_credentials_email(name, email, username, password, role)

    return jsonify({
        "message": "User created successfully",
        "id": new_id,
        "email_sent": email_sent
    }), 201


def update_user(username):
    """PUT /admin/users/<username> — update password or role."""
    data = request.json or {}
    fields, params = [], []

    new_password = (data.get("password") or "").strip()
    new_role     = (data.get("role")     or "").strip().upper()
    new_name     = (data.get("name")     or "").strip()
    new_email    = (data.get("email")    or "").strip()

    if new_password:
        fields.append("password_hash = %s"); params.append(hash_password(new_password))
    if new_role and new_role in ("ADMIN", "MANAGER", "OFFICER"):
        fields.append("role = %s"); params.append(new_role)
    if new_name:
        fields.append("name = %s"); params.append(new_name)
    if new_email is not None:
        fields.append("email = %s"); params.append(new_email or None)

    if not fields:
        return jsonify({"error": "Nothing to update"}), 400

    params.append(username)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"UPDATE lg_users SET {', '.join(fields)} WHERE username = %s", params)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": f"User '{username}' updated"})


def delete_user(username):
    """DELETE /admin/users/<username>."""
    # Prevent self-delete
    caller = getattr(request, "current_user", None)
    if caller == username:
        return jsonify({"error": "You cannot delete your own account"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM lg_users WHERE username = %s RETURNING id", (username,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not deleted:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": f"User '{username}' deleted"})


def get_me():
    return jsonify({
        "username": request.current_user,
        "role": request.current_role
    })


# ── Email delivery ─────────────────────────────────────────────────────────────

def send_credentials_email(name: str, email: str, username: str, password: str, role: str) -> bool:
    """Send a beautiful HTML welcome email with login credentials via Resend."""
    if not RESEND_API_KEY or not email:
        return False

    role_color = {
        "ADMIN":   "#a78bfa",
        "MANAGER": "#fbbf24",
        "OFFICER": "#34d399",
    }.get(role, "#60a5fa")

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LoanGuard AI — Welcome</title></head>
<body style="margin:0;padding:0;background:#070711;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070711;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#0f0f1a;border-radius:20px;overflow:hidden;
                    border:1px solid rgba(255,255,255,0.08);max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c4dff,#3b82f6);padding:36px 40px;text-align:center;">
            <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;
                        display:inline-flex;align-items:center;justify-content:center;
                        font-weight:900;font-size:20px;color:white;margin-bottom:16px;">LG</div>
            <h1 style="margin:0;color:white;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
              Welcome to LoanGuard AI
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">
              Your account has been created by the Administrator
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#e2e8f0;font-size:15px;margin:0 0 8px;">Hi <strong>{name}</strong>,</p>
            <p style="color:rgba(148,163,184,0.7);font-size:14px;line-height:1.7;margin:0 0 28px;">
              An Administrator has created an account for you on the LoanGuard AI MLOps platform.
              Below are your login credentials — please keep them secure.
            </p>

            <!-- Role badge -->
            <div style="text-align:center;margin-bottom:28px;">
              <span style="display:inline-block;padding:6px 20px;border-radius:100px;
                           background:rgba(124,77,255,0.15);border:1px solid {role_color};
                           color:{role_color};font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                {role}
              </span>
            </div>

            <!-- Credentials Table -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
                          border-radius:14px;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);
                           color:rgba(148,163,184,0.4);font-size:10px;font-weight:700;
                           letter-spacing:2px;text-transform:uppercase;width:40%;">Username</td>
                <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);
                           color:#f1f5f9;font-size:14px;font-weight:700;font-family:monospace;">{username}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;color:rgba(148,163,184,0.4);font-size:10px;
                           font-weight:700;letter-spacing:2px;text-transform:uppercase;">Password</td>
                <td style="padding:14px 20px;color:#f1f5f9;font-size:14px;
                           font-weight:700;font-family:monospace;">{password}</td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="{APP_URL}/login"
                 style="display:inline-block;padding:14px 36px;
                        background:linear-gradient(135deg,#7c4dff,#3b82f6);
                        border-radius:100px;color:white;font-weight:700;font-size:14px;
                        text-decoration:none;letter-spacing:0.5px;">
                🔐 Login to LoanGuard AI →
              </a>
            </div>

            <!-- Warning -->
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);
                        border-radius:12px;padding:14px 18px;">
              <p style="margin:0;color:#fbbf24;font-size:12px;font-weight:600;">
                ⚠️ Please change your password after your first login for security.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="margin:0;color:rgba(148,163,184,0.25);font-size:11px;">
              LoanGuard AI — Automated Loan Risk Assessment Platform<br/>
              This is an automated message. Please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""
    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": f"LoanGuard AI <{RESEND_FROM}>",
                "to": [email],
                "subject": f"Welcome to LoanGuard AI — Your Account Credentials",
                "html": html,
            },
            timeout=10,
        )
        return resp.status_code == 200
    except Exception as e:
        print(f"[Email] Failed to send credentials email: {e}")
        return False
