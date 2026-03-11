import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import LoanChatBot from "../components/LoanChatBot";

/* ─────────────────────────────────────────────
   GLOBAL STYLES + KEYFRAMES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { cursor: none !important; overflow-x: hidden; }
  body * { cursor: none !important; }

  /* ── Custom Cursor ── */
  #lg-cursor-outer {
    position: fixed; top: 0; left: 0; width: 40px; height: 40px;
    border: 2px solid rgba(124,77,255,0.6);
    border-radius: 50%; pointer-events: none; z-index: 99999;
    transform: translate(-50%,-50%);
    transition: transform 0.12s ease, width 0.25s ease, height 0.25s ease,
                border-color 0.25s ease, background 0.25s ease;
    mix-blend-mode: normal;
  }
  #lg-cursor-inner {
    position: fixed; top: 0; left: 0; width: 8px; height: 8px;
    background: #7c4dff; border-radius: 50%;
    pointer-events: none; z-index: 99999;
    transform: translate(-50%,-50%);
    transition: transform 0.04s ease;
    box-shadow: 0 0 16px 4px rgba(124,77,255,0.7);
  }
  #lg-cursor-outer.hovering {
    width: 64px; height: 64px;
    background: rgba(124,77,255,0.08);
    border-color: #7c4dff;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0a12; }
  ::-webkit-scrollbar-thumb { background: #7c4dff; border-radius: 3px; }

  /* ── Keyframes ── */
  @keyframes floatY {
    0%,100%  { transform: translateY(0px) rotateX(0deg); }
    50%      { transform: translateY(-20px) rotateX(4deg); }
  }
  @keyframes floatY2 {
    0%,100%  { transform: translateY(0px); }
    50%      { transform: translateY(-14px); }
  }
  @keyframes fadeInUp {
    from { opacity:0; transform: translateY(40px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity:0; transform: translateX(-40px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity:0; transform: translateX(40px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 20px rgba(124,77,255,0.4); }
    50%      { box-shadow: 0 0 50px rgba(124,77,255,0.9), 0 0 80px rgba(96,165,250,0.4); }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes particleDrift {
    0%   { transform: translate(0,0) scale(1); opacity:0.6; }
    33%  { transform: translate(30px,-50px) scale(1.2); opacity:1; }
    66%  { transform: translate(-20px,-90px) scale(0.8); opacity:0.7; }
    100% { transform: translate(10px,-140px) scale(0); opacity:0; }
  }
  @keyframes borderRotate {
    from { --angle: 0deg; }
    to   { --angle: 360deg; }
  }
  @keyframes numberCount {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    25%     { transform: translate(40px,-30px) scale(1.05); }
    50%     { transform: translate(-30px,40px) scale(0.95); }
    75%     { transform: translate(20px,20px) scale(1.03); }
  }
  @keyframes lineExpand {
    from { width: 0; opacity: 0; }
    to   { width: 80px; opacity: 1; }
  }
  @keyframes cardIn {
    from { opacity:0; transform: perspective(800px) rotateY(-15deg) translateX(-30px); }
    to   { opacity:1; transform: perspective(800px) rotateY(0deg) translateX(0); }
  }
  @keyframes tiltHover {
    from { transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1); }
    to   { transform: perspective(1000px) rotateX(5deg) rotateY(5deg) scale(1.02); }
  }
  @keyframes textGradient {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .lg-fade-up   { animation: fadeInUp   0.8s cubic-bezier(.16,1,.3,1) both; }
  .lg-fade-left { animation: fadeInLeft  0.8s cubic-bezier(.16,1,.3,1) both; }
  .lg-fade-right{ animation: fadeInRight 0.8s cubic-bezier(.16,1,.3,1) both; }

  .gradient-text {
    background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 40%, #f472b6 80%, #a78bfa 100%);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradient 4s ease infinite;
  }

  .shimmer-btn {
    background: linear-gradient(135deg, #7c4dff 0%, #3b82f6 50%, #06b6d4 100%);
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .shimmer-btn:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 16px 50px rgba(124,77,255,0.6);
  }

  .glass-card {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.4s cubic-bezier(.16,1,.3,1),
                box-shadow 0.4s ease, border-color 0.3s ease;
    transform-style: preserve-3d;
    will-change: transform;
  }
  .glass-card:hover {
    border-color: rgba(124,77,255,0.35);
    box-shadow: 0 24px 70px rgba(124,77,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .tilt-card {
    transition: transform 0.15s ease, box-shadow 0.2s ease;
    transform-style: preserve-3d;
    cursor: none;
  }

  .nav-link {
    position: relative; color: rgba(255,255,255,0.65);
    text-decoration: none; font-size: 14px; font-weight: 500;
    transition: color 0.2s;
    padding: 4px 0;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -2px; left: 0;
    width: 0; height: 2px;
    background: linear-gradient(90deg,#7c4dff,#60a5fa);
    border-radius: 2px; transition: width 0.25s ease;
  }
  .nav-link:hover { color: #fff; }
  .nav-link:hover::after { width: 100%; }

  .feature-icon-wrap {
    transition: transform 0.35s cubic-bezier(.16,1,.3,1);
  }
  .glass-card:hover .feature-icon-wrap {
    transform: translateZ(20px) scale(1.15) rotateY(15deg);
  }

  .stat-num {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.4rem,4vw,3.8rem);
    font-weight: 700;
    background: linear-gradient(135deg,#a78bfa,#60a5fa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .faq-item {
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
    background: rgba(255,255,255,0.025);
  }
  .faq-item:hover { border-color: rgba(124,77,255,0.3); }
  .faq-item.open { border-color: rgba(124,77,255,0.45); box-shadow: 0 0 30px rgba(124,77,255,0.12); }

  .section-tag {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 100px;
    background: rgba(124,77,255,0.12);
    border: 1px solid rgba(124,77,255,0.3);
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: #a78bfa;
    margin-bottom: 18px;
  }

  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
    animation: orbFloat 12s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    .hero-grid { grid-template-columns: 1fr !important; }
    .feat-grid  { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
  }
`;

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */
function CustomCursor() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const outerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (innerRef.current) {
        innerRef.current.style.left = e.clientX + "px";
        innerRef.current.style.top = e.clientY + "px";
      }
    };
    const onEnter = () => outerRef.current?.classList.add("hovering");
    const onLeave = () => outerRef.current?.classList.remove("hovering");

    let raf;
    const loop = () => {
      if (outerRef.current) {
        outerPos.current.x += (pos.current.x - outerPos.current.x) * 0.15;
        outerPos.current.y += (pos.current.y - outerPos.current.y) * 0.15;
        outerRef.current.style.left = outerPos.current.x + "px";
        outerRef.current.style.top = outerPos.current.y + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a,button,[data-hover]").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <div id="lg-cursor-outer" ref={outerRef} />
      <div id="lg-cursor-inner" ref={innerRef} />
    </>
  );
}

/* ─────────────────────────────────────────────
   PARTICLE CANVAS BACKGROUND
───────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const COLORS = ["#7c4dff", "#3b82f6", "#06b6d4", "#a78bfa", "#f472b6"];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,77,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    }} />
  );
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function Counter({ target, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = target / (duration / 16);
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          setVal(Math.floor(cur));
          if (cur >= target) clearInterval(t);
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   3D TILT CARD
───────────────────────────────────────────── */
function TiltCard({ children, style = {}, className = "" }) {
  const cardRef = useRef(null);

  const onMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -10;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    card.style.boxShadow = `${-ry * 2}px ${rx * 2}px 50px rgba(124,77,255,0.3)`;
  }, []);

  const onLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.boxShadow = "";
  }, []);

  return (
    <div ref={cardRef} className={`tilt-card glass-card ${className}`}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ borderRadius: 20, padding: 32, ...style }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────────── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", padding: "22px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16
        }}>
        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15, textAlign: "left" }}>{q}</span>
        <span style={{
          color: "#7c4dff", fontSize: 22, fontWeight: 700, flexShrink: 0,
          transform: open ? "rotate(45deg)" : "none", transition: "transform 0.3s", display: "inline-block"
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: "0 28px 22px", color: "rgba(148,163,184,0.9)", fontSize: 14.5,
          lineHeight: 1.75, animation: "fadeInUp 0.3s ease both"
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PARALLAX HERO CARD (3D float on mouse)
───────────────────────────────────────────── */
function HeroCard() {
  const cardRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const card = cardRef.current;
      if (!card) return;
      const rx = ((e.clientY / window.innerHeight) - 0.5) * -18;
      const ry = ((e.clientX / window.innerWidth) - 0.5) * 18;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={cardRef} style={{
      transition: "transform 0.1s ease",
      transformStyle: "preserve-3d",
    }}>
      {/* Main floating panel */}
      <div style={{
        background: "linear-gradient(135deg, rgba(124,77,255,0.15) 0%, rgba(59,130,246,0.1) 100%)",
        border: "1px solid rgba(124,77,255,0.25)",
        borderRadius: 24, padding: 32,
        backdropFilter: "blur(24px)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow blobs inside card */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(124,77,255,0.25),transparent 70%)", borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40, width: 160, height: 160,
          background: "radial-gradient(circle, rgba(59,130,246,0.2),transparent 70%)", borderRadius: "50%"
        }} />

        {/* Top label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 10px rgba(34,197,94,0.8)"
          }} />
          <span style={{ color: "rgba(148,163,184,0.8)", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
            LIVE MODEL · 99.7% UPTIME
          </span>
        </div>

        {/* Score display */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontSize: 72, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif",
            background: "linear-gradient(135deg,#22c55e,#86efac)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", lineHeight: 1, marginBottom: 6
          }}>
            817
          </div>
          <div style={{ color: "rgba(148,163,184,0.7)", fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Credit Score · Approved
          </div>
        </div>

        {/* Risk bars */}
        {[
          { label: "Repayment Likelihood", val: 94, color: "#22c55e" },
          { label: "Fraud Risk", val: 4, color: "#f472b6" },
          { label: "Credit Health", val: 87, color: "#60a5fa" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "rgba(148,163,184,0.8)", fontSize: 12, fontWeight: 500 }}>{label}</span>
              <span style={{ color, fontSize: 12, fontWeight: 700 }}>{val}%</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${val}%`, background: color,
                borderRadius: 4, boxShadow: `0 0 10px ${color}60`,
                transition: "width 1s ease"
              }} />
            </div>
          </div>
        ))}

        {/* Bottom badge */}
        <div style={{
          marginTop: 24, padding: "10px 16px",
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 12, display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ color: "#86efac", fontSize: 13, fontWeight: 700 }}>Loan Approved — ₹12,00,000</span>
        </div>
      </div>

      {/* Floating mini badge — rotated out */}
      <div style={{
        position: "absolute", top: -16, right: -16,
        background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
        borderRadius: 14, padding: "10px 18px",
        fontSize: 12, fontWeight: 800, color: "white",
        boxShadow: "0 8px 30px rgba(124,77,255,0.5)",
        transform: "translateZ(40px)",
        animation: "floatY2 3s ease-in-out infinite",
      }}>
        🤖 AI Powered
      </div>

      {/* Bottom floating stat */}
      <div style={{
        position: "absolute", bottom: -16, left: -16,
        background: "rgba(15,15,25,0.9)",
        border: "1px solid rgba(59,130,246,0.35)",
        borderRadius: 14, padding: "10px 18px",
        fontSize: 12, fontWeight: 700, color: "#60a5fa",
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        transform: "translateZ(30px)",
        animation: "floatY2 3.5s ease-in-out infinite 0.5s",
      }}>
        ⚡ Sub-second prediction
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const parallaxRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax layers on scroll for hero section
  useEffect(() => {
    const onScroll = () => {
      if (!parallaxRef.current) return;
      const y = window.scrollY;
      const layers = parallaxRef.current.querySelectorAll("[data-depth]");
      layers.forEach(el => {
        const depth = parseFloat(el.dataset.depth);
        el.style.transform = `translateY(${y * depth}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: "🛡️", title: "Real-Time Risk Scoring", desc: "ML-powered risk assessment with SHAP explainability in under 200ms. Every prediction is transparent and auditable." },
    { icon: "🔍", title: "Fraud Detection Engine", desc: "Proprietary anomaly detection flags suspicious applications automatically before human review." },
    { icon: "📊", title: "Analytics Dashboard", desc: "Live portfolio metrics, trend analysis, income segmentation, and property-area approval heat maps." },
    { icon: "⚙️", title: "MLflow Model Registry", desc: "Track experiments, compare runs, retrain one-click, and hot-swap models in production without downtime." },
    { icon: "📋", title: "PDF Report Generation", desc: "Beautiful, branded PDF reports generated instantly per application for compliance and client delivery." },
    { icon: "🔒", title: "Enterprise Security", desc: "JWT RBAC, stateless inference, SSL-encrypted Supabase DB, and append-only immutable audit logs." },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "Branch Manager, HDFC", quote: "LoanGuard cut our average decision time from 3 days to under 30 seconds. The accuracy is remarkable.", avatar: "SM" },
    { name: "Raj Kumar", role: "VP of Lending, Axis", quote: "The fraud detection alone saved us ₹40L in the first quarter. The SHAP explanations satisfy our compliance team.", avatar: "RK" },
    { name: "Priya N.", role: "CTO, FinServCo", quote: "MLOps done right. The retrain pipeline with MLflow logging is exactly what enterprise teams need.", avatar: "PN" },
  ];

  const stats = [
    { num: 98, suffix: "%", label: "Prediction Accuracy" },
    { num: 200, suffix: "ms", label: "Avg Inference Time" },
    { num: 50000, suffix: "+", label: "Loans Evaluated" },
    { num: 99, suffix: ".9%", label: "Uptime SLA" },
  ];

  return (
    <div style={{
      minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#070711",
      color: "#e2e8f0", overflowX: "hidden", position: "relative"
    }}>

      {/* Global CSS */}
      <style>{GLOBAL_CSS}</style>

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Particle Background */}
      <ParticleCanvas />

      {/* Global ambient orbs */}
      <div className="orb" style={{
        width: 600, height: 600, top: "5%", left: "-10%",
        background: "radial-gradient(circle, rgba(124,77,255,0.12),transparent 70%)",
        animationDelay: "0s"
      }} />
      <div className="orb" style={{
        width: 500, height: 500, top: "40%", right: "-8%",
        background: "radial-gradient(circle, rgba(59,130,246,0.12),transparent 70%)",
        animationDelay: "-4s"
      }} />
      <div className="orb" style={{
        width: 400, height: 400, top: "75%", left: "30%",
        background: "radial-gradient(circle, rgba(244,114,182,0.08),transparent 70%)",
        animationDelay: "-8s"
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: 70,
        background: navScrolled ? "rgba(7,7,17,0.85)" : "transparent",
        backdropFilter: navScrolled ? "blur(20px)" : "none",
        borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(124,77,255,0.5)",
              animation: "pulseGlow 3s ease-in-out infinite"
            }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 16 }}>LG</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.5px" }}>
              LoanGuard <span style={{
                background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {[["Home", "#hero"], ["Features", "#features"], ["Stats", "#stats"], ["Testimonials", "#testimonials"], ["FAQ", "#faq"]].map(([label, href]) => (
              <a key={label} href={href} className="nav-link">{label}</a>
            ))}
          </div>

          {/* CTA */}
          <Link to="/check" className="shimmer-btn" style={{
            padding: "11px 28px", color: "white", borderRadius: 100,
            fontWeight: 700, fontSize: 14, textDecoration: "none",
            display: "inline-block",
          }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section id="hero" ref={parallaxRef} style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "120px 40px 80px", position: "relative", zIndex: 1
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div className="hero-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 64, alignItems: "center",
          }}>
            {/* Left */}
            <div className="lg-fade-left">
              <div className="section-tag" data-hover>
                <span>⚡</span> Powered by Machine Learning
              </div>

              <h1 style={{
                fontSize: "clamp(2.6rem,5vw,4.4rem)", fontWeight: 900,
                lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 24
              }}>
                Smarter Loan Decisions
                <br />
                <span className="gradient-text">Powered by AI</span>
              </h1>

              <p style={{
                fontSize: 17, color: "rgba(148,163,184,0.8)", lineHeight: 1.8,
                marginBottom: 40, maxWidth: 480
              }}>
                LoanGuard predicts loan risk, detects fraud, and generates compliance
                reports — all in under a second. Built for modern banks.
              </p>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link to="/check" className="shimmer-btn" style={{
                  padding: "15px 36px", color: "white", borderRadius: 100,
                  fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block",
                }}>
                  Check Eligibility Free
                </Link>
                <a href="#features" style={{
                  padding: "15px 32px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white", borderRadius: 100, fontWeight: 600,
                  fontSize: 15, textDecoration: "none",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.25s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,77,255,0.15)"; e.currentTarget.style.borderColor = "rgba(124,77,255,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                >
                  ▶ See How It Works
                </a>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: 24, marginTop: 48, alignItems: "center" }}>
                {["🏦 Enterprise-Ready", "⚡ &lt;200ms Inference", "🔒 SOC-2 Compliant"].map(t => (
                  <span key={t} style={{
                    color: "rgba(148,163,184,0.6)", fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6
                  }}
                    dangerouslySetInnerHTML={{ __html: t }} />
                ))}
              </div>
            </div>

            {/* Right — 3D Hero Card */}
            <div className="lg-fade-right" style={{ position: "relative", display: "flex", justifyContent: "center" }} data-depth="0">
              <div style={{ position: "relative", padding: "40px 20px" }}>
                <HeroCard />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8
        }}>
          <span style={{ color: "rgba(148,163,184,0.4)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,rgba(124,77,255,0.6),transparent)" }} />
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section id="stats" style={{ padding: "80px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg,rgba(124,77,255,0.1),rgba(59,130,246,0.08))",
            border: "1px solid rgba(124,77,255,0.15)", borderRadius: 28,
            padding: "60px 40px",
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32,
            backdropFilter: "blur(16px)"
          }} className="stats-grid">
            {stats.map(({ num, suffix, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="stat-num" style={{ display: "block", marginBottom: 8 }}>
                  <Counter target={num} suffix={suffix} />
                </div>
                <div style={{
                  color: "rgba(148,163,184,0.6)", fontSize: 13, fontWeight: 600,
                  letterSpacing: 0.5
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              <span>🚀</span> Platform Features
            </div>
            <h2 style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 16 }}>
              Everything you need to <span className="gradient-text">lend smarter</span>
            </h2>
            <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 16, maxWidth: 540, margin: "0 auto" }}>
              A full-stack MLOps platform built for financial institutions.
            </p>
          </div>

          <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {features.map((f, i) => (
              <TiltCard key={f.title} style={{ animationDelay: `${i * 0.08}s` }}
                className="lg-fade-up">
                <div className="feature-icon-wrap" style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg,rgba(124,77,255,0.2),rgba(59,130,246,0.12))",
                  border: "1px solid rgba(124,77,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: "#f1f5f9" }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(148,163,184,0.75)", lineHeight: 1.7 }}>{f.desc}</p>

                <div style={{
                  marginTop: 20, display: "flex", alignItems: "center", gap: 8,
                  color: "#7c4dff", fontSize: 13, fontWeight: 700
                }}>
                  <span>Learn more</span>
                  <span style={{ transition: "transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >→</span>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              <span>🔄</span> Simple Process
            </div>
            <h2 style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, letterSpacing: "-1px" }}>
              From application to <span className="gradient-text">decision in seconds</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, position: "relative" }}>
            {/* Connecting line */}
            <div style={{
              position: "absolute", top: 36, left: "12%", right: "12%", height: 2,
              background: "linear-gradient(90deg,#7c4dff,#3b82f6,#06b6d4,#f472b6)",
              zIndex: 0, opacity: 0.35
            }} />
            {[
              { step: "01", icon: "📝", title: "Submit Application", desc: "Applicant fills out a structured form with income, loan, and personal details." },
              { step: "02", icon: "🤖", title: "ML Inference", desc: "Our Logistic Regression model predicts approval probability in under 200ms." },
              { step: "03", icon: "📊", title: "SHAP Explanation", desc: "Top risk factors are identified and surfaced to the officer for transparency." },
              { step: "04", icon: "✅", title: "Decision & Report", desc: "Instant PDF report generated, stored, and sent for compliance review." },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg,rgba(124,77,255,0.2),rgba(59,130,246,0.15))",
                  border: "2px solid rgba(124,77,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, margin: "0 auto 20px",
                  boxShadow: "0 0 30px rgba(124,77,255,0.15)",
                  transition: "all 0.3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(124,77,255,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(124,77,255,0.15)"; }}
                >
                  {s.icon}
                </div>
                <div style={{ color: "rgba(124,77,255,0.6)", fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>STEP {s.step}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "rgba(148,163,184,0.65)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              <span>💬</span> Client Stories
            </div>
            <h2 style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, letterSpacing: "-1px" }}>
              Trusted by <span className="gradient-text">lending professionals</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {testimonials.map((t, i) => (
              <TiltCard key={t.name} style={{ animationDelay: `${i * 0.1}s` }} className="lg-fade-up">
                {/* Stars */}
                <div style={{ marginBottom: 16 }}>
                  {"★★★★★".split("").map((s, si) => (
                    <span key={si} style={{ color: "#f59e0b", fontSize: 14 }}>{s}</span>
                  ))}
                </div>
                <p style={{
                  color: "rgba(148,163,184,0.85)", fontSize: 14.5, lineHeight: 1.8, marginBottom: 24,
                  fontStyle: "italic"
                }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 14, color: "white", flexShrink: 0
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(148,163,184,0.55)" }}>{t.role}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              <span>❓</span> FAQ
            </div>
            <h2 style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, letterSpacing: "-1px" }}>
              Got <span className="gradient-text">questions?</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "How accurate is the loan risk prediction?", a: "Our model achieves 98%+ accuracy on held-out test data, validated with MLflow experiment tracking. Predictions are backed by SHAP values for full transparency to compliance officers." },
              { q: "What data does LoanGuard use?", a: "Standard loan application fields — income, dependents, credit history, loan amount, term, and property area. All data is encrypted in transit (SSL) and at rest via Supabase." },
              { q: "Can we integrate this with our existing core banking system?", a: "Yes. LoanGuard exposes a REST API that accepts standard JSON payloads. It can integrate with any core banking or CRM platform in under a day." },
              { q: "How is SHAP used for explainability?", a: "After every prediction, a SHAP LinearExplainer computes feature contributions. The top 5 risk factors are returned in the API response and displayed in the dashboard and PDF report." },
              { q: "What roles and permissions are supported?", a: "LoanGuard has three roles — Officer (predict only), Manager (status updates + analytics), and Admin (retrain, user management, audit logs). All access is controlled via JWT + RBAC." },
              { q: "Is there a public demo?", a: "Yes! Click 'Check Eligibility' at the top to access the public portal and evaluate a loan application in real time — no login required." },
            ].map(faq => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg,rgba(124,77,255,0.18),rgba(59,130,246,0.12),rgba(244,114,182,0.1))",
            border: "1px solid rgba(124,77,255,0.25)",
            borderRadius: 32, padding: "80px 60px", textAlign: "center",
            backdropFilter: "blur(20px)", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -80, right: -80, width: 300, height: 300,
              background: "radial-gradient(circle,rgba(124,77,255,0.2),transparent 70%)", borderRadius: "50%"
            }} />
            <div style={{
              position: "absolute", bottom: -80, left: -80, width: 250, height: 250,
              background: "radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%)", borderRadius: "50%"
            }} />

            <div className="section-tag" style={{ justifyContent: "center", marginBottom: 24 }}>
              <span>🚀</span> Start Today — Free
            </div>
            <h2 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 16 }}>
              Ready to transform your <span className="gradient-text">lending process?</span>
            </h2>
            <p style={{ color: "rgba(148,163,184,0.75)", fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
              Join hundreds of lending professionals who trust LoanGuard AI
              for accurate, explainable, and lightning-fast risk decisions.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/check" className="shimmer-btn" style={{
                padding: "16px 44px", color: "white", borderRadius: 100,
                fontWeight: 800, fontSize: 16, textDecoration: "none", display: "inline-block",
              }}>
                Try Free Demo →
              </Link>
              <Link to="/login" style={{
                padding: "16px 40px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "white", borderRadius: 100, fontWeight: 700, fontSize: 16,
                textDecoration: "none", display: "inline-block",
                backdropFilter: "blur(10px)",
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,77,255,0.15)"; e.currentTarget.style.borderColor = "rgba(124,77,255,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
              >
                Officer Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "60px 40px 40px", position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg,#7c4dff,#3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, color: "white", fontSize: 14
                }}>LG</div>
                <span style={{ fontWeight: 800, fontSize: 18 }}>LoanGuard <span style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI</span></span>
              </div>
              <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 13.5, lineHeight: 1.8, maxWidth: 260 }}>
                AI-powered loan risk assessment for modern financial institutions.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {["𝕏", "in", "GitHub", "📧"].map((icon, i) => (
                  <a key={i} href="#" style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: "rgba(148,163,184,0.6)", textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,77,255,0.15)"; e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = "rgba(124,77,255,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(148,163,184,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { head: "Product", links: [["Features", "#features"], ["How it Works", "#stats"], ["Pricing", "#"], ["Changelog", "#"]] },
              { head: "Company", links: [["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Contact", "#"]] },
              { head: "Legal", links: [["Privacy", "#"], ["Terms", "#"], ["Security", "#"], ["Compliance", "#"]] },
            ].map(col => (
              <div key={col.head}>
                <h4 style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "rgba(148,163,184,0.45)", marginBottom: 20
                }}>{col.head}</h4>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map(([label, href]) => (
                    <li key={label} style={{ marginBottom: 12 }}>
                      <a href={href} style={{
                        color: "rgba(148,163,184,0.6)", fontSize: 14,
                        textDecoration: "none", transition: "color 0.2s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.6)"}
                      >{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 28,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
          }}>
            <p style={{ color: "rgba(148,163,184,0.35)", fontSize: 13 }}>
              © {new Date().getFullYear()} LoanGuard AI · All rights reserved
            </p>
            <p style={{ color: "rgba(148,163,184,0.35)", fontSize: 13 }}>
              Built with React + Flask + MLflow · Supabase PostgreSQL
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <LoanChatBot />
    </div>
  );
}
