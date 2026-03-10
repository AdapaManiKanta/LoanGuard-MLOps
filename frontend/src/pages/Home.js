import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoanChatBot from "../components/LoanChatBot";

/* ── animated counter hook ── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setCount(target);
      return;
    }
    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            let start = 0;
            const step = target / (duration / 16);
            const timer = setInterval(() => {
              start += step;
              if (start >= target) {
                setCount(target);
                clearInterval(timer);
              } else setCount(Math.floor(start));
            }, 16);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    } catch {
      setCount(target);
    }
  }, [target, duration]);
  return [count, ref];
}

/* ── FAQ accordion item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: 14,
        padding: "16px 22px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        boxShadow: open ? "0 4px 24px rgba(130,100,220,0.13)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, color: "#3d2e7c", fontSize: 15 }}>{q}</span>
        <span style={{ color: "#7c66d5", fontWeight: 700, fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
      </div>
      {open && (
        <p style={{ marginTop: 10, color: "#5a4a9a", fontSize: 14, lineHeight: 1.6 }}>{a}</p>
      )}
    </div>
  );
}

/* ── wave SVG background ── */
const BgWaves = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      background: "linear-gradient(135deg, #434343ff 0%, #595858ff 35%, #b8c8fa 60%, #e8d0ff 100%)",
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    {/* Animated wave blobs */}
    <div style={{
      position: "absolute", top: "-10%", left: "-10%", width: "70%", height: "70%",
      background: "radial-gradient(ellipse at 40% 40%, rgba(180,160,255,0.55) 0%, transparent 70%)",
      animation: "blobDrift1 9s ease-in-out infinite alternate",
    }} />
    <div style={{
      position: "absolute", bottom: "0%", right: "-10%", width: "65%", height: "65%",
      background: "radial-gradient(ellipse at 60% 60%, rgba(160,200,255,0.45) 0%, transparent 70%)",
      animation: "blobDrift2 11s ease-in-out infinite alternate",
    }} />
    <div style={{
      position: "absolute", top: "40%", left: "20%", width: "55%", height: "55%",
      background: "radial-gradient(ellipse at 50% 50%, rgba(220,200,255,0.35) 0%, transparent 70%)",
      animation: "blobDrift3 13s ease-in-out infinite alternate",
    }} />
    {/* sparkles */}
    {[...Array(14)].map((_, i) => (
      <div key={i} style={{
        position: "absolute",
        width: i % 3 === 0 ? 6 : 4,
        height: i % 3 === 0 ? 6 : 4,
        borderRadius: "50%",
        background: i % 2 === 0 ? "rgba(255,210,120,0.75)" : "rgba(200,180,255,0.7)",
        top: `${10 + (i * 6.2) % 80}%`,
        left: `${5 + (i * 7.3) % 90}%`,
        animation: `sparkle ${2.5 + (i % 5) * 0.6}s ease-in-out infinite alternate`,
        animationDelay: `${(i * 0.37) % 2}s`,
      }} />
    ))}
    <style>{`
      @keyframes blobDrift1 { 0%{transform:translate(0,0) scale(1);} 100%{transform:translate(5%,8%) scale(1.08);} }
      @keyframes blobDrift2 { 0%{transform:translate(0,0) scale(1);} 100%{transform:translate(-6%,-5%) scale(1.1);} }
      @keyframes blobDrift3 { 0%{transform:translate(0,0) scale(1);} 100%{transform:translate(4%,-7%) scale(1.06);} }
      @keyframes sparkle { 0%{opacity:0.3;transform:scale(0.8);} 100%{opacity:1;transform:scale(1.3);} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
      .fade-up { animation: fadeUp 0.7s ease both; }
    `}</style>
  </div>
);

/* ── glass card helper ── */
const GlassCard = ({ children, style = {}, hover = true }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.52)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.75)",
      borderRadius: 18,
      padding: 28,
      transition: "box-shadow 0.25s, transform 0.25s",
      ...style,
    }}
    onMouseEnter={e => {
      if (hover) {
        e.currentTarget.style.boxShadow = "0 8px 36px rgba(120,100,220,0.18)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }
    }}
    onMouseLeave={e => {
      if (hover) {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }
    }}
  >
    {children}
  </div>
);

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headingColor = "#2d1f6e";
  const subColor = "#5a4a9a";
  const mutedColor = "#7a6faa";

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: "hidden", position: "relative" }}>
      <BgWaves />

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: navScrolled ? "rgba(230,225,255,0.82)" : "rgba(230,225,255,0.65)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(180,160,255,0.3)",
        transition: "background 0.3s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #7c66d5, #4f8ef7)", boxShadow: "0 2px 12px rgba(124,102,213,0.4)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: headingColor, letterSpacing: "-0.5px" }}>LoanGuard <span style={{ color: "#7c66d5" }}>Ai</span></span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[["Home", "#hero"], ["Features", "#services"], ["Testimonials", "#testimonials"], ["FAQ", "#faq"]].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: 14, fontWeight: 600, color: subColor, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = headingColor}
                onMouseLeave={e => e.target.style.color = subColor}
              >{label}</a>
            ))}
          </div>

          {/* CTA */}
          <Link to="/check" style={{
            padding: "10px 24px", background: "linear-gradient(135deg, #7c66d5, #4f8ef7)",
            color: "white", borderRadius: 30, fontWeight: 700, fontSize: 14,
            textDecoration: "none", boxShadow: "0 4px 16px rgba(124,102,213,0.35)",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,102,213,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,102,213,0.35)"; e.currentTarget.style.transform = ""; }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left */}
          <div className="fade-up">
            <h1 style={{ fontSize: "clamp(2.4rem, 4vw, 3.8rem)", fontWeight: 900, color: headingColor, lineHeight: 1.1, marginBottom: 18, letterSpacing: "-1px" }}>
              Automate Loan Risk <span style={{ color: "#7c66d5" }}>with AI</span>
            </h1>
            <p style={{ fontSize: 17, color: subColor, marginBottom: 36, lineHeight: 1.7 }}>
              Empower your bank to make smarter, safer lending decisions with cutting‑edge machine learning and instant risk scoring.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="https://www.youtube.com/results?search_query=loan+risk+AI" target="_blank" rel="noopener noreferrer"
                style={{
                  padding: "13px 30px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(124,102,213,0.4)", borderRadius: 30, color: headingColor,
                  fontWeight: 700, fontSize: 15, textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,102,213,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.boxShadow = ""; }}
              >▶ Watch Video</a>
              <Link to="/check" style={{
                padding: "13px 30px", background: "linear-gradient(135deg, #7c66d5, #4f8ef7)",
                color: "white", borderRadius: 30, fontWeight: 700, fontSize: 15,
                textDecoration: "none", boxShadow: "0 4px 18px rgba(124,102,213,0.38)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,102,213,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(124,102,213,0.38)"; e.currentTarget.style.transform = ""; }}
              >Get Started</Link>
            </div>
          </div>

          {/* Right – video card (place your video at frontend/public/demo.mp4) */}
          <div className="fade-up" style={{ animationDelay: "0.15s" }}>
            <GlassCard hover={false} style={{ padding: 0, overflow: "hidden", borderRadius: 22, boxShadow: "0 12px 50px rgba(120,100,220,0.18)" }}>
              <video
                autoPlay
                loop
                muted
                controls
                style={{ width: "100%", display: "block", borderRadius: 22 }}
                poster=""
              >
                <source src="/demo.mp4" type="video/mp4" />
                {/* Fallback when video is not placed yet */}
                <div style={{
                  aspectRatio: "16/9", background: "linear-gradient(135deg, #3b2fa0 0%, #1e3a8a 50%, #0f2261 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>Place demo.mp4 in frontend/public/</span>
                </div>
              </video>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section id="services" style={{ position: "relative", zIndex: 1, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, color: headingColor, marginBottom: 48 }}>Our Key Features</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { icon: "🛡️", title: "Risk Analysis", desc: "Discover and flag risks, assess your clients and your liabilities with real-time ML scoring." },
              { icon: "🔍", title: "Fraud Detection", desc: "Fraud transaction detection algorithms safeguard every application automatically." },
              { icon: "📋", title: "Instant Reports", desc: "Easy-to-understand dashboards and downloadable reports for swift decision-making." },
              { icon: "⚙️", title: "ML Model Training", desc: "Build, train, and optimize machine learning models with MLflow experiment tracking." },
              { icon: "📊", title: "Analytics Dashboard", desc: "Real-time metrics, portfolio performance, and trend analysis for business intelligence." },
              { icon: "🔒", title: "Security & Compliance", desc: "Encrypted data, stateless predictions, and a compliance-ready architecture." },
            ].map((f, i) => (
              <GlassCard key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: "rgba(124,102,213,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, color: headingColor, fontSize: 16, margin: 0 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── About LoanGuard ── */}
      <section id="about" style={{ position: "relative", zIndex: 1, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Text */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#7c66d5", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>About LoanGuard Ai</p>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: headingColor, marginBottom: 16, lineHeight: 1.2 }}>AI Solutions for Smarter Banking</h2>
            <p style={{ color: subColor, lineHeight: 1.75, marginBottom: 28 }}>
              We leverage advanced AI to help banks manage loan risks efficiently and accurately. LoanGuard combines state-of-the-art machine learning with enterprise-grade infrastructure.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Sub-second prediction latency", "Industry-leading 94%+ accuracy", "Complete audit trails & explainability", "Enterprise-grade security & compliance"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#7c66d5,#4f8ef7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ color: subColor, fontSize: 14, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brain visual – image only, no box */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
            <div style={{ textAlign: "center" }}>
              <img
                src="/brain.png"
                alt="Neural AI Engine"
                style={{
                  width: 320, height: 280, objectFit: "contain",
                  filter: "drop-shadow(0 0 40px rgba(130,100,255,0.75))",
                  animation: "blobDrift3 4s ease-in-out infinite alternate",
                }}
                onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
              />
              <div style={{ fontSize: 120, display: "none", filter: "drop-shadow(0 0 40px rgba(130,160,255,0.75))", animation: "blobDrift3 4s ease-in-out infinite alternate" }}>🧠</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ position: "relative", zIndex: 1, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: headingColor, marginBottom: 36 }}>What Our Clients Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { name: "Sarah M.", role: "Branch Manager", quote: "LoanGuard AI has transformed our risk management — decisions are faster and far more accurate." },
              { name: "James T.", role: "Loan Officer", quote: "Incredible insights and easy to use! Our approval rate improved significantly within the first month." },
              { name: "Priya K.", role: "VP of Lending", quote: "The fraud detection alone saved us from multiple suspicious applications. Highly recommended." },
            ].map((t, i) => (
              <GlassCard key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
                  background: `linear-gradient(135deg, hsl(${220 + i * 40},60%,55%), hsl(${260 + i * 40},60%,45%))`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>👤</div>
                <div>
                  <p style={{ fontSize: 14, color: subColor, fontStyle: "italic", marginBottom: 10, lineHeight: 1.6 }}>"{t.quote}"</p>
                  <p style={{ fontWeight: 700, color: headingColor, fontSize: 14, margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>{t.role}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ position: "relative", zIndex: 1, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: headingColor, marginBottom: 36 }}>Frequently Asked Questions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
            <FaqItem q="How does LoanGuard Ai work?" a="LoanGuard uses machine learning models trained on historical loan data to predict default probability and risk scores in real time." />
            <FaqItem q="Is my data secure?" a="Yes. All data is encrypted in transit and at rest. Our architecture is stateless and compliant with financial data regulations." />
            <FaqItem q="Can this integrate with our existing systems?" a="Absolutely. LoanGuard exposes a REST API that integrates with most core banking and CRM platforms with minimal setup." />
            <FaqItem q="What support do you provide?" a="We offer 24/7 support, onboarding assistance, detailed documentation, and a dedicated account manager for enterprise clients." />
          </div>
        </div>
      </section>

      {/* ── Newsletter (Contact) ── */}
      <section id="contact" style={{ position: "relative", zIndex: 1, padding: "80px 32px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <GlassCard hover={false} style={{ textAlign: "center", padding: "56px 48px", boxShadow: "0 12px 50px rgba(120,100,220,0.14)" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: headingColor, marginBottom: 10 }}>Join Our Newsletter</h2>
            <div style={{ width: 60, height: 3, background: "linear-gradient(90deg,#7c66d5,#4f8ef7)", borderRadius: 2, margin: "0 auto 18px" }} />
            <p style={{ color: subColor, marginBottom: 32, fontSize: 15 }}>Subscribe for the latest updates on AI-powered lending innovations.</p>
            <div style={{ display: "flex", gap: 0, maxWidth: 480, margin: "0 auto", borderRadius: 30, overflow: "hidden", border: "1.5px solid rgba(124,102,213,0.35)", background: "rgba(255,255,255,0.65)" }}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Email Address"
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  padding: "14px 22px", fontSize: 15, color: headingColor,
                }}
              />
              <button
                onClick={() => { if (newsletterEmail) { alert("Thank you for subscribing!"); setNewsletterEmail(""); } }}
                style={{
                  padding: "14px 26px", background: "linear-gradient(135deg,#7c66d5,#4f8ef7)",
                  color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >Subscribe →</button>
            </div>

            {/* Contact info */}
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
              {[
                { label: "Email", val: "info@loanguard.com" },
                { label: "Phone", val: "+91 9392791418" },
                { label: "Address", val: "Dhulappaly, Secunderabad, TG" },
              ].map((c, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#7c66d5", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{c.label}</p>
                  <p style={{ color: subColor, fontSize: 13 }}>{c.val}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(180,160,255,0.3)", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7c66d5, #4f8ef7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: headingColor }}>LoanGuard <span style={{ color: "#7c66d5" }}>Ai</span></span>
              </div>
              <p style={{ fontSize: 13, color: mutedColor, lineHeight: 1.6 }}>Enterprise AI for intelligent lending decisions.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontWeight: 700, color: headingColor, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Quick Links</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Features", "#services"], ["About", "#about"], ["FAQ", "#faq"], ["Contact", "#contact"]].map(([l, h]) => (
                  <li key={l}><a href={h} style={{ fontSize: 13, color: mutedColor, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#7c66d5"} onMouseLeave={e => e.target.style.color = mutedColor}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ fontWeight: 700, color: headingColor, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Resources</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]].map(([l, to]) => (
                  <li key={l}><Link to={to} style={{ fontSize: 13, color: mutedColor, textDecoration: "none" }}
                    onMouseEnter={e => e.target.style.color = "#7c66d5"} onMouseLeave={e => e.target.style.color = mutedColor}>{l}</Link></li>
                ))}
                {[["Documentation", "#"], ["Blog", "#"]].map(([l, h]) => (
                  <li key={l}><a href={h} style={{ fontSize: 13, color: mutedColor, textDecoration: "none" }}
                    onMouseEnter={e => e.target.style.color = "#7c66d5"} onMouseLeave={e => e.target.style.color = mutedColor}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 style={{ fontWeight: 700, color: headingColor, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Platform</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link to="/check" style={{ fontSize: 13, color: mutedColor, textDecoration: "none" }}
                  onMouseEnter={e => e.target.style.color = "#7c66d5"} onMouseLeave={e => e.target.style.color = mutedColor}>Check Eligibility</Link>
                <Link to="/login" style={{ fontSize: 13, color: mutedColor, textDecoration: "none" }}
                  onMouseEnter={e => e.target.style.color = "#7c66d5"} onMouseLeave={e => e.target.style.color = mutedColor}>Officer Login</Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(180,160,255,0.25)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: mutedColor }}>© {new Date().getFullYear()} LoanGuard Ai. All rights reserved.</p>
            <div style={{ display: "flex", gap: 18 }}>
              {[["🐦", "https://twitter.com"], ["💼", "https://linkedin.com"], ["💻", "https://github.com"], ["✉️", "mailto:info@loanguard.com"]].map(([icon, href], i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(124,102,213,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,102,213,0.28)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(124,102,213,0.12)"}
                >{icon}</a>
              ))}
            </div>
            <p style={{ fontSize: 13, color: mutedColor }}>✉ contact@loanguardai.com</p>
          </div>
        </div>
      </footer>

      {/* ── LoanGuard AI Floating Chatbot ── */}
      <LoanChatBot />
    </div>
  );
}
