import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoanChatBot from "../components/LoanChatBot";

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
        { threshold: 0.3 },
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    } catch {
      setCount(target);
    }
  }, [target, duration]);
  return [count, ref];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm text-xs">
              LG
            </div>
            <span className="font-bold text-lg tracking-tight">LoanGuard</span>
          </div>
          {/* primary links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#services"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Services
            </a>
            <a
              href="#work"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Our Work
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Contact
            </a>
          </div>
          {/* call to action in nav for desktop */}
          <div className="flex items-center gap-4">
            <Link
              to="/check"
              className="hidden lg:inline-block px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded font-medium transition"
            >
              Check Eligibility
            </Link>
            <Link
              to="/login"
              className="hidden lg:inline-block px-6 py-2 text-sm border border-slate-600 hover:border-slate-400 rounded font-medium transition"
            >
              Officer Login
            </Link>
          </div>
        </div>
      </nav>
      {/* ── Hero Section ── */}
      <section
        id="hero"
        className="relative"
        style={{ width: "100vw", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <br />
        <br />
        <br />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent z-0 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center px-6">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              Intelligent Risk Assessment
              <br />
              for Finance
            </h1>
            <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto font-medium">
              AI-powered loan assessment platform combining cutting-edge machine
              learning with secure infrastructure for financial institutions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/check"
                className="px-8 py-3.5 text-base bg-blue-600 hover:bg-blue-700 rounded font-medium shadow-lg transition"
              >
                Check Eligibility
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 text-base border border-slate-500 hover:border-slate-300 rounded font-medium transition group"
              >
                Officer Login{" "}
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Services Section ── */}
      <section id="services" className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group">
              <div className="text-slate-500 text-sm font-bold mb-3">01</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                ML Model Training
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Build, train, and optimize machine learning models using
                real-world loan data with MLflow integration for tracking
                experiments.
              </p>
            </div>

            {/* Service 2 */}
            <div className="group">
              <div className="text-slate-500 text-sm font-bold mb-3">02</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                Real-time Risk Assessment
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instant AI-powered risk scoring and eligibility predictions with
                explainable SHAP values for loan decision support.
              </p>
            </div>

            {/* Service 3 */}
            <div className="group">
              <div className="text-slate-500 text-sm font-bold mb-3">03</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                Analytics Dashboard
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Comprehensive analytics with real-time metrics, portfolio
                performance, and trend analysis for business intelligence.
              </p>
            </div>

            {/* Service 4 */}
            <div className="group">
              <div className="text-slate-500 text-sm font-bold mb-3">04</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                Batch Processing
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Process multiple applications in bulk with scheduled batch jobs
                and CSV upload capability for high-volume assessments.
              </p>
            </div>

            {/* Service 5 */}
            <div className="group">
              <div className="text-slate-500 text-sm font-bold mb-3">05</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                Role-Based Access Control
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                loan risk assessment platform combining machine learning,
                transparent decision modeling, and secure cloud infrastructure
                for financial institutions.
              </p>
            </div>

            {/* Service 6 */}
            <div className="group">
              <div className="text-slate-500 text-sm font-bold mb-3">06</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                Security & Compliance
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Stateless predictions, encrypted data handling, and
                compliance-ready architecture for secure loan processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent Work Section ── */}
      <section id="work" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Recent Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project 1 */}
            <div className="group relative overflow-hidden rounded-lg h-64 bg-gradient-to-br from-blue-600 to-slate-900 cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">
                  Model v1.0 Training
                </h3>
                <p className="text-sm text-slate-300">
                  Random Forest implementation
                </p>
              </div>
            </div>

            {/* Project 2 */}
            <div className="group relative overflow-hidden rounded-lg h-64 bg-gradient-to-br from-emerald-600 to-slate-900 cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">
                  XGBoost Optimization
                </h3>
                <p className="text-sm text-slate-300">
                  Hyperparameter tuning completed
                </p>
              </div>
            </div>

            {/* Project 3 */}
            <div className="group relative overflow-hidden rounded-lg h-64 bg-gradient-to-br from-purple-600 to-slate-900 cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">API Deployment</h3>
                <p className="text-sm text-slate-300">
                  Production API endpoints live
                </p>
              </div>
            </div>

            {/* Project 4 */}
            <div className="group relative overflow-hidden rounded-lg h-64 bg-gradient-to-br from-amber-600 to-slate-900 cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">
                  Dashboard Implementation
                </h3>
                <p className="text-sm text-slate-300">
                  Real-time analytics launched
                </p>
              </div>
            </div>

            {/* Project 5 */}
            <div className="group relative overflow-hidden rounded-lg h-64 bg-gradient-to-br from-red-600 to-slate-900 cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">RBAC System</h3>
                <p className="text-sm text-slate-300">
                  Multi-role access control
                </p>
              </div>
            </div>

            {/* Project 6 */}
            <div className="group relative overflow-hidden rounded-lg h-64 bg-gradient-to-br from-cyan-600 to-slate-900 cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">
                  Batch Processing System
                </h3>
                <p className="text-sm text-slate-300">
                  CSV bulk upload feature
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Us Section ── */}
      <section id="about" className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">About Us</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              LoanGuard combines state-of-the-art machine learning with
              enterprise-grade infrastructure to revolutionize how financial
              institutions assess loan applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Why Choose Us - Card 1 */}
            <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition">
              <h3 className="text-lg font-bold mb-4 text-white">
                Creative Excellence
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our team of data scientists and ML engineers crafts solutions
                that are not just intelligent, but elegant and user-friendly.
              </p>
            </div>

            {/* Why Choose Us - Card 2 */}
            <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition">
              <h3 className="text-lg font-bold mb-4 text-white">
                Technical Expertise
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Deep experience with ML workflows, MLOps practices, and
                production-ready systems that scale seamlessly with your needs.
              </p>
            </div>

            {/* Why Choose Us - Card 3 */}
            <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition">
              <h3 className="text-lg font-bold mb-4 text-white">
                Client Partnership
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We view each engagement as a true partnership, working closely
                to ensure your goals are met and exceeded.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-slate-900/50 p-12 rounded-lg border border-blue-500/30">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Why LoanGuard?
            </h3>
            <p className="text-slate-300 mb-6">
              In the financial industry, speed and accuracy aren't
              luxuries—they're necessities. LoanGuard delivers both while
              maintaining the security and transparency that modern lenders
              demand.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                <span className="text-slate-300">
                  Sub-second prediction latency
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                <span className="text-slate-300">
                  Industry-leading 94%+ accuracy
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                <span className="text-slate-300">
                  Complete audit trails & explainability
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                <span className="text-slate-300">
                  Enterprise-grade security & compliance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Get In Touch / Contact Section ── */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Ready to transform your lending operations with AI-powered
              assessments? Let's discuss how LoanGuard can work for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="mb-8">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Contact Info
                </h3>
                <div className="text-slate-300">
                  <p className="mb-4">
                    <strong>Email:</strong>
                    <br />
                    info@loanguard.com
                  </p>
                  <p className="mb-4">
                    <strong>Address:</strong>
                    <br />
                    New York, NY 10001
                  </p>
                  <p>
                    <strong>Phone:</strong>
                    <br />
                    +1 (212) 555-0100
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-6">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition text-2xl"
                  >
                    𝕏
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition text-2xl"
                  >
                    ✓
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition text-2xl"
                  >
                    in
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows="5"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition uppercase text-sm font-bold tracking-wider"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">
                  LG
                </div>
                <span className="font-bold text-lg">LoanGuard</span>
              </div>
              <p className="text-sm text-slate-400">
                Enterprise AI for intelligent lending
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#services"
                    className="hover:text-blue-400 transition"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a href="#work" className="hover:text-blue-400 transition">
                    Our Work
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-blue-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-blue-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-blue-400 transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-blue-400 transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Newsletter
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                Stay updated with LoanGuard news
              </p>
              <div className="flex">
                <input
                  type="email"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none"
                  placeholder="Your email"
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white transition text-sm">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <p>
                &copy; {new Date().getFullYear()} LoanGuard. All rights
                reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Twitter
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* ── LoanGuard AI Floating Chatbot ── */}
      <LoanChatBot />
    </div>
  );
}
