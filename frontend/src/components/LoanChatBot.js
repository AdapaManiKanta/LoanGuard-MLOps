import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

// ── Icons ────────────────────────────────────────────────────────────────────
const BotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M12 2a3 3 0 00-3 3v6h6V5a3 3 0 00-3-3z" />
        <line x1="8" y1="16" x2="8" y2="16" strokeWidth={3} />
        <line x1="16" y1="16" x2="16" y2="16" strokeWidth={3} />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ── Typing dots animation ────────────────────────────────────────────────────
function TypingIndicator() {
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 12 }}>
            <div style={avatarStyle("#1e40af")}>AI</div>
            <div style={bubbleStyle("bot")}>
                <span style={typingDotsStyle}>
                    <span style={{ ...dotStyle, animationDelay: "0s" }} />
                    <span style={{ ...dotStyle, animationDelay: "0.2s" }} />
                    <span style={{ ...dotStyle, animationDelay: "0.4s" }} />
                </span>
            </div>
        </div>
    );
}

// ── Inline style helpers ─────────────────────────────────────────────────────
const avatarStyle = (bg) => ({
    width: 28, height: 28, borderRadius: "50%",
    background: bg, color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 800, flexShrink: 0,
    letterSpacing: "0.05em",
});

const bubbleStyle = (sender) => ({
    maxWidth: "75%",
    padding: "9px 13px",
    borderRadius: sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: sender === "user"
        ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
        : "#f1f5f9",
    color: sender === "user" ? "#fff" : "#1e293b",
    fontSize: 13,
    lineHeight: 1.55,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
});

const typingDotsStyle = {
    display: "inline-flex", gap: 4, alignItems: "center", height: 18,
};

const dotStyle = {
    display: "inline-block",
    width: 7, height: 7,
    borderRadius: "50%",
    background: "#94a3b8",
    animation: "lgBounce 0.8s ease-in-out infinite",
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function LoanChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "👋 Hi! I'm **LoanGuard AI**.\n\nAsk me anything about loan eligibility, EMI calculations, credit scores, or how to improve your approval chances.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, open]);

    // Focus input when panel opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    // Build Gemini-compatible history from messages (skip the welcome message)
    const buildHistory = () => {
        const conversational = messages.slice(1); // skip welcome
        return conversational.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [m.text],
        }));
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = { sender: "user", text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await axios.post(`${API_BASE}/api/chat`, {
                message: trimmed,
                history: buildHistory(),
            });
            setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "⚠️ Sorry, I couldn't connect to the AI service right now. Please try again in a moment.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Keyframe injection */}
            <style>{`
        @keyframes lgBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes lgSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lgPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.45); }
          70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
      `}</style>

            {/* ── Floating Bubble ── */}
            <button
                onClick={() => setOpen((o) => !o)}
                title="LoanGuard AI Assistant"
                style={{
                    position: "fixed",
                    bottom: 28,
                    right: 28,
                    zIndex: 9999,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(37,99,235,0.45)",
                    animation: open ? "none" : "lgPulseRing 2s infinite",
                    transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
                {open ? <CloseIcon /> : <BotIcon />}
            </button>

            {/* ── Chat Panel ── */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 96,
                        right: 28,
                        zIndex: 9998,
                        width: 360,
                        maxHeight: "72vh",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                        animation: "lgSlideUp 0.25s ease",
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexShrink: 0,
                        }}
                    >
                        <div style={avatarStyle("rgba(255,255,255,0.2)")}>
                            <BotIcon />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                                LoanGuard AI
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                                Financial guidance assistant
                            </p>
                        </div>
                        <span
                            style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: "#4ade80",
                                boxShadow: "0 0 0 2px rgba(74,222,128,0.3)",
                            }}
                        />
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px 14px 8px",
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                                    alignItems: "flex-end",
                                    gap: 8,
                                    marginBottom: 12,
                                }}
                            >
                                {msg.sender === "bot" && (
                                    <div style={avatarStyle("#1e40af")}>AI</div>
                                )}
                                <div style={bubbleStyle(msg.sender)}>
                                    {msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}
                                </div>
                            </div>
                        ))}

                        {loading && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div
                        style={{
                            background: "#fff",
                            borderTop: "1px solid #e2e8f0",
                            padding: "10px 12px",
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-end",
                            flexShrink: 0,
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about loans, EMI, eligibility…"
                            disabled={loading}
                            style={{
                                flex: 1,
                                resize: "none",
                                border: "1.5px solid #e2e8f0",
                                borderRadius: 12,
                                padding: "9px 13px",
                                fontSize: 13,
                                fontFamily: "inherit",
                                outline: "none",
                                lineHeight: 1.5,
                                transition: "border-color 0.15s",
                                background: loading ? "#f8fafc" : "#fff",
                                color: "#1e293b",
                                minHeight: 40,
                                maxHeight: 96,
                                overflowY: "auto",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                width: 40, height: 40,
                                borderRadius: "50%",
                                border: "none",
                                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                                background: loading || !input.trim()
                                    ? "#e2e8f0"
                                    : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                color: loading || !input.trim() ? "#94a3b8" : "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                transition: "all 0.15s",
                                boxShadow: loading || !input.trim()
                                    ? "none"
                                    : "0 2px 8px rgba(37,99,235,0.4)",
                            }}
                        >
                            <SendIcon />
                        </button>
                    </div>

                    {/* Footer disclaimer */}
                    <div
                        style={{
                            background: "#f8fafc",
                            borderTop: "1px solid #e2e8f0",
                            padding: "6px 14px",
                            fontSize: 10,
                            color: "#94a3b8",
                            textAlign: "center",
                            flexShrink: 0,
                        }}
                    >
                        Educational guidance only · Not financial advice
                    </div>
                </div>
            )}
        </>
    );
}
