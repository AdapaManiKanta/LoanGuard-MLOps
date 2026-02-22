import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Animated counter hook
function useCounter(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
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
    }, [target, duration]);
    return [count, ref];
}

function StatCard({ value, suffix, label, delay }) {
    const [count, ref] = useCounter(value);
    return (
        <div ref={ref} className={`text-center animate-fade-in-up ${delay}`}>
            <div className="text-4xl md:text-5xl font-black gradient-text mb-1">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-white/40 text-sm font-medium uppercase tracking-widest">{label}</div>
        </div>
    );
}

const features = [
    {
        icon: "⚡",
        title: "Instant AI Decision",
        desc: "Get your loan eligibility result in under 2 seconds, powered by a trained ML model with 82%+ accuracy.",
        color: "from-amber-500/20 to-orange-500/10",
        border: "border-amber-500/20",
    },
    {
        icon: "🔍",
        title: "SHAP Explanations",
        desc: "Understand exactly why you were approved or rejected. Transparent AI — no black boxes.",
        color: "from-indigo-500/20 to-blue-500/10",
        border: "border-indigo-500/20",
    },
    {
        icon: "💡",
        title: "Improvement Tips",
        desc: "Get personalised, actionable tips to increase your approval chances before applying at the bank.",
        color: "from-emerald-500/20 to-teal-500/10",
        border: "border-emerald-500/20",
    },
    {
        icon: "📊",
        title: "EMI Calculator",
        desc: "See your estimated monthly EMI at 10% p.a. the moment you check eligibility — plan your finances.",
        color: "from-violet-500/20 to-purple-500/10",
        border: "border-violet-500/20",
    },
    {
        icon: "🔒",
        title: "100% Anonymous",
        desc: "No login required for eligibility checks. Your data is never stored unless you submit a formal application.",
        color: "from-rose-500/20 to-pink-500/10",
        border: "border-rose-500/20",
    },
    {
        icon: "📱",
        title: "Works Everywhere",
        desc: "Fully responsive PWA — check eligibility on your phone, tablet, or desktop. Install it as an app.",
        color: "from-cyan-500/20 to-sky-500/10",
        border: "border-cyan-500/20",
    },
];

const steps = [
    { n: "01", title: "Fill Your Details", desc: "Enter your income, loan amount, credit history, and basic personal info. Takes under a minute." },
    { n: "02", title: "AI Analyses Instantly", desc: "Our ML model — trained on thousands of real loan applications — evaluates your profile in milliseconds." },
    { n: "03", title: "Get Your Result", desc: "See your eligibility, approval probability, EMI estimate, and tips to improve your chances." },
];

export default function Home() {
    return (
        <div className="min-h-screen mesh-bg text-white overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/30">
                            LG
                        </div>
                        <span className="font-black text-xl tracking-tight">LoanGuard</span>
                        <span className="hidden sm:block text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            AI Powered
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/check"
                            className="hidden sm:block text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2"
                        >
                            Check Eligibility
                        </Link>
                        <Link
                            to="/login"
                            className="btn-glow bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
                        >
                            Bank Login →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-blob delay-300 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 glass border border-indigo-500/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Live · Powered by ML · Free to use</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 animate-fade-in-up">
                        Know Your Loan
                        <br />
                        <span className="gradient-text">Eligibility Instantly</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                        Free AI-powered loan assessment. Get your result in seconds — no bank visit, no paperwork, no login required.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                        <Link
                            to="/check"
                            className="btn-glow group bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3"
                        >
                            <span>🔍 Check My Eligibility</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link
                            to="/login"
                            className="glass border border-white/10 hover:border-indigo-500/40 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all hover:bg-white/5 flex items-center justify-center gap-2"
                        >
                            🏦 Bank Officer Login
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-in-up delay-400">
                        {["No Login Required", "Result in 2 seconds", "Free Forever", "100% Anonymous"].map(b => (
                            <div key={b} className="flex items-center gap-1.5 text-white/40 text-xs font-semibold">
                                <span className="text-emerald-400">✓</span>{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-16 px-6 border-y border-white/5">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard value={5000} suffix="+" label="Applications Processed" delay="delay-100" />
                    <StatCard value={82} suffix="%" label="Model Accuracy" delay="delay-200" />
                    <StatCard value={2} suffix="s" label="Avg Response Time" delay="delay-300" />
                    <StatCard value={99} suffix="%" label="Uptime" delay="delay-400" />
                </div>
            </section>

            {/* ── Features ── */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 animate-fade-in-up">
                            Everything you need to
                            <span className="gradient-text"> make smarter decisions</span>
                        </h2>
                        <p className="text-white/40 text-lg max-w-xl mx-auto">
                            Built for both loan applicants and bank professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className={`glass card-shine hover-lift rounded-3xl p-7 border ${f.border} bg-gradient-to-br ${f.color} animate-fade-in-up`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/5 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 animate-fade-in-up">
                            How it <span className="gradient-text">works</span>
                        </h2>
                        <p className="text-white/40 text-lg">Three steps. Under a minute.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

                        {steps.map((s, i) => (
                            <div key={s.n} className={`text-center animate-fade-in-up delay-${(i + 1) * 200}`}>
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600/30 to-blue-600/20 border border-indigo-500/20 text-2xl font-black text-indigo-300 mb-6 mx-auto animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                                    {s.n}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden animate-pulse-glow">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/5 pointer-events-none" />
                        <div className="relative">
                            <div className="text-5xl mb-6">🚀</div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Ready to check your eligibility?
                            </h2>
                            <p className="text-white/40 text-lg mb-8 max-w-lg mx-auto">
                                Free, instant, anonymous. No bank visit required.
                            </p>
                            <Link
                                to="/check"
                                className="btn-glow inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black px-12 py-4 rounded-2xl text-lg shadow-2xl shadow-indigo-500/40"
                            >
                                Get Started Free →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center font-black text-xs">LG</div>
                        <span className="font-bold text-white/60">LoanGuard MLOps</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/30">
                        <Link to="/check" className="hover:text-white/70 transition-colors">Eligibility Checker</Link>
                        <Link to="/login" className="hover:text-white/70 transition-colors">Bank Login</Link>
                        <span>© 2026 LoanGuard</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
