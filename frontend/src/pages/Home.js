import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function useCounter(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') { setCount(target); return; }
        try {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const step = target / (duration / 16);
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= target) { setCount(target); clearInterval(timer); }
                        else setCount(Math.floor(start));
                    }, 16);
                    observer.disconnect();
                }
            }, { threshold: 0.3 });
            if (ref.current) observer.observe(ref.current);
            return () => observer.disconnect();
        } catch { setCount(target); }
    }, [target, duration]);
    return [count, ref];
}

function StatCard({ value, suffix, label, delay, icon }) {
    const [count, ref] = useCounter(value);
    return (
        <div ref={ref} className={`text-center animate-fade-in-up ${delay}`}>
            <div className="text-3xl mb-1">{icon}</div>
            <div className="text-4xl md:text-5xl font-black gradient-text mb-1">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-blue-700/60 text-sm font-semibold uppercase tracking-widest">{label}</div>
        </div>
    );
}

const features = [
    { icon: "⚡", title: "Instant AI Decision", desc: "Get your loan eligibility in under 2 seconds, powered by a trained ML model with 82%+ accuracy.", color: "border-amber-200 bg-amber-50" },
    { icon: "🔍", title: "SHAP Explanations", desc: "Understand exactly why you were approved or rejected. Transparent AI — no black boxes.", color: "border-blue-200 bg-blue-50" },
    { icon: "💡", title: "Improvement Tips", desc: "Get personalised, actionable tips to increase your approval chances before visiting the bank.", color: "border-emerald-200 bg-emerald-50" },
    { icon: "📊", title: "EMI Calculator", desc: "See your estimated monthly EMI at 10% p.a. the moment you check — plan your finances easily.", color: "border-violet-200 bg-violet-50" },
    { icon: "🔒", title: "100% Anonymous", desc: "No login required for eligibility checks. Your data is never stored without your consent.", color: "border-rose-200 bg-rose-50" },
    { icon: "📱", title: "Works Everywhere", desc: "Fully responsive PWA — check eligibility on your phone, tablet, or desktop.", color: "border-cyan-200 bg-cyan-50" },
];

const steps = [
    { n: "01", title: "Fill Your Details", desc: "Enter income, loan amount, credit history and personal info. Takes under a minute.", icon: "📝" },
    { n: "02", title: "AI Analyses Instantly", desc: "Our ML model — trained on thousands of real loan applications — evaluates your profile in milliseconds.", icon: "🤖" },
    { n: "03", title: "Get Your Result", desc: "See your eligibility, approval probability, EMI estimate, and personalised improvement tips.", icon: "✅" },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md">
                            LG
                        </div>
                        <span className="font-black text-xl text-blue-900 tracking-tight">LoanGuard</span>
                        <span className="hidden sm:block text-[10px] font-bold text-blue-600 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            AI Powered
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/check" className="hidden sm:block text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors px-4 py-2 hover:bg-blue-50 rounded-xl">
                            Check Eligibility
                        </Link>
                        <Link to="/login" className="btn-glow bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md">
                            Bank Login →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source src="/loanguardbg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-slate-900/75 z-0 pointer-events-none mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40 z-0 pointer-events-none" />

                {/* Subtle white blobs */}
                <div className="absolute top-16 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-blob pointer-events-none z-0" />
                <div className="absolute bottom-8 right-1/4 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-blob delay-400 pointer-events-none z-0" />

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10 w-full mt-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in backdrop-blur-sm shadow-xl">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest text-shadow-sm">Live · Powered by ML · Free to use</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 text-white animate-fade-in-up" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
                        Know Your Loan
                        <br />
                        <span className="text-blue-200">Eligibility Instantly</span>
                    </h1>

                    <p className="text-lg sm:text-lg md:text-xl text-white max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200 font-medium" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                        Free AI-powered loan assessment. Get your result in seconds — no bank visit, no paperwork, no login required.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                        <Link to="/check"
                            className="btn-glow group bg-white text-blue-700 font-black px-10 py-4 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-3 hover:shadow-2xl hover:scale-[1.02] transition-all">
                            <span>🔍 Check My Eligibility</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link to="/login"
                            className="bg-blue-800/40 hover:bg-blue-800/60 backdrop-blur-md border border-white/30 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                            🏦 Bank Officer Login
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-in-up delay-400">
                        {["No Login Required", "Result in 2 seconds", "Free Forever", "100% Anonymous"].map(b => (
                            <div key={b} className="flex items-center gap-1.5 text-blue-100/90 text-xs font-semibold drop-shadow">
                                <span className="text-emerald-400">✓</span>{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-16 px-6 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard value={5000} suffix="+" label="Applications" delay="delay-100" icon="📋" />
                    <StatCard value={82} suffix="%" label="Accuracy" delay="delay-200" icon="🎯" />
                    <StatCard value={2} suffix="s" label="Response Time" delay="delay-300" icon="⚡" />
                    <StatCard value={99} suffix="%" label="Uptime" delay="delay-400" icon="🛡️" />
                </div>
            </section>

            {/* ── Features ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 text-blue-900 animate-fade-in-up">
                            Everything you need to
                            <span className="gradient-text"> make smarter decisions</span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">Built for both loan applicants and bank professionals.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={f.title}
                                className={`card-shine hover-lift rounded-2xl p-7 border ${f.color} animate-fade-in-up`}
                                style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-bold text-blue-900 mb-2">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section className="py-24 px-6 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 text-blue-900 animate-fade-in-up">
                            How it <span className="gradient-text">works</span>
                        </h2>
                        <p className="text-slate-500 text-lg">Three steps. Under a minute.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <div key={s.n} className={`text-center animate-fade-in-up delay-${(i + 1) * 200}`}>
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 text-white text-2xl font-black mb-6 mx-auto shadow-lg shadow-blue-200 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                                    {s.icon}
                                </div>
                                <div className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2">{s.n}</div>
                                <h3 className="text-xl font-bold text-blue-900 mb-3">{s.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="hero-bg rounded-3xl p-12 text-center shadow-2xl shadow-blue-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative">
                            <div className="text-5xl mb-6">🚀</div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Ready to check your eligibility?
                            </h2>
                            <p className="text-blue-100/80 text-lg mb-8 max-w-lg mx-auto">
                                Free, instant, anonymous. No bank visit required.
                            </p>
                            <Link to="/check"
                                className="btn-glow inline-flex items-center gap-3 bg-white text-blue-700 font-black px-12 py-4 rounded-2xl text-lg shadow-xl">
                                Get Started Free →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-blue-100 py-10 px-6 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center font-black text-white text-xs">LG</div>
                        <span className="font-bold text-blue-900">LoanGuard MLOps</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <Link to="/check" className="hover:text-blue-600 transition-colors">Eligibility Checker</Link>
                        <Link to="/login" className="hover:text-blue-600 transition-colors">Bank Login</Link>
                        <span>© 2026 LoanGuard</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
