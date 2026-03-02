# routes/chat.py
# LoanGuard AI Chatbot — google-genai (new SDK)

from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types
import os

chat_bp = Blueprint("chat", __name__)

SYSTEM_INSTRUCTION = (
    "You are LoanGuard AI, a friendly financial guidance assistant embedded in "
    "LoanGuard — an AI-powered loan assessment platform.\n\n"
    "Your role:\n"
    "- Explain loan concepts: eligibility, EMI calculations, credit scores, risk levels.\n"
    "- Guide users on how to improve loan approval chances.\n"
    "- Interpret LoanGuard-specific terms: risk score, SHAP explanation, model confidence.\n"
    "- Answer follow-up questions using conversation context.\n\n"
    "You must NEVER:\n"
    "- Guarantee loan approval or rejection.\n"
    "- Request or store sensitive personal data (PAN, Aadhaar, bank accounts).\n"
    "- Provide legally binding financial advice.\n"
    "- Claim to be human.\n\n"
    "Be concise, professional, and transparent. Provide formulas when helpful "
    "(e.g. EMI = P × r × (1+r)^n / ((1+r)^n - 1)). Always clarify that final "
    "approval depends on your institution's internal risk evaluation."
)


def _get_client():
    """Return a configured Gemini client (lazy, uses env var)."""
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """
    LoanGuard AI Chat endpoint (public — no auth required).
    Body: { "message": "...", "history": [{"role": "user"|"model", "parts": ["..."]}] }
    Returns: { "reply": "..." }
    """
    try:
        body = request.get_json(force=True) or {}
        user_message = (body.get("message") or "").strip()
        raw_history = body.get("history") or []

        if not user_message:
            return jsonify({"error": "message is required"}), 400

        # Input length guard
        if len(user_message) > 2000:
            return jsonify({"error": "Message too long (max 2000 chars)"}), 400

        # Build typed history (sanitise — only accepted roles)
        history = []
        for entry in raw_history:
            role = entry.get("role")
            parts = entry.get("parts")
            if role in ("user", "model") and isinstance(parts, list) and parts:
                history.append(
                    types.Content(
                        role=role,
                        parts=[types.Part(text=str(p)) for p in parts if p],
                    )
                )

        client = _get_client()

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=history + [
                types.Content(role="user", parts=[types.Part(text=user_message)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.7,
                max_output_tokens=1024,
            ),
        )

        return jsonify({"reply": response.text})

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
