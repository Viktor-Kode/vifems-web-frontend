"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-viewport">
      {/* Icon sprite */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="i-lock" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </symbol>
        <symbol id="i-unlink" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
          <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
          <path d="M4 4l16 16" />
        </symbol>
        <symbol id="i-hour" viewBox="0 0 24 24">
          <path d="M6 2h12M6 22h12" />
          <path d="M7 2v4a5 5 0 002.5 4.3L12 12l-2.5 1.7A5 5 0 007 18v4M17 2v4a5 5 0 01-2.5 4.3L12 12l2.5 1.7A5 5 0 0117 18v4" />
        </symbol>
        <symbol id="i-pkg" viewBox="0 0 24 24">
          <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
          <path d="M3.3 7.5L12 12.5l8.7-5M12 22V12.5" />
        </symbol>
        <symbol id="i-grid" viewBox="0 0 24 24">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </symbol>
        <symbol id="i-receipt" viewBox="0 0 24 24">
          <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z" />
          <path d="M9 8h6M9 12h6" />
        </symbol>
        <symbol id="i-users" viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0113 0" />
          <path d="M16 4.5a3.5 3.5 0 010 7M18 14a6.5 6.5 0 013.5 6" />
        </symbol>
        <symbol id="i-card" viewBox="0 0 24 24">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19M6.5 15h4" />
        </symbol>
        <symbol id="i-spark" viewBox="0 0 24 24">
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
          <path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" />
        </symbol>
        <symbol id="i-layers" viewBox="0 0 24 24">
          <path d="M12 3l9 5-9 5-9-5 9-5z" />
          <path d="M3 13l9 5 9-5" />
        </symbol>
        <symbol id="i-net" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="19" cy="19" r="2.5" />
          <path d="M11 7.3L6 16.7M13 7.3l5 9.4M7.5 19h9" />
        </symbol>
        <symbol id="i-layout" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M3 9h18M9 21V9" />
        </symbol>
        <symbol id="i-flow" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <path d="M6.5 10v4a3 3 0 003 3H14" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </symbol>
        <symbol id="i-db" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5.5" rx="8" ry="3" />
          <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </symbol>
        <symbol id="i-hist" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3L3 8" />
          <path d="M3 3v5h5M12 7v5l3 2" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </symbol>
        <symbol id="i-store" viewBox="0 0 24 24">
          <path d="M4 9l1.5-5h13L20 9" />
          <path d="M4 9a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0A2.7 2.7 0 0020 9" />
          <path d="M5 12v8h14v-8M10 20v-5h4v5" />
        </symbol>
        <symbol id="i-wrench" viewBox="0 0 24 24">
          <path d="M14.7 6.3a4 4 0 00-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 005.2-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
        </symbol>
        <symbol id="i-truck" viewBox="0 0 24 24">
          <path d="M2 6h12v10H2zM14 9h4l4 4v3h-8" />
          <circle cx="6.5" cy="17.5" r="2" />
          <circle cx="17.5" cy="17.5" r="2" />
        </symbol>
        <symbol id="i-brief" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" />
        </symbol>
        <symbol id="i-menu" viewBox="0 0 24 24">
          <path d="M4 8h16M4 16h16" />
        </symbol>
        <symbol id="i-x" viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6L6 18" />
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
          <path d="M10 18.5h4" />
        </symbol>
        <symbol id="i-logo" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4a82ff" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#lg)" />
          <path
            d="M8.5 10.5L16 23l7.5-12.5"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>

        <symbol id="p1" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#DBEAFE" />
          <circle cx="50" cy="38" r="18" fill="#FBBF24" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#2563EB" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p2" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#FCE7F3" />
          <circle cx="50" cy="38" r="18" fill="#B45309" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#059669" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p3" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#FEF3C7" />
          <circle cx="50" cy="38" r="18" fill="#7C3AED" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#DC2626" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p4" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#E0E7FF" />
          <circle cx="50" cy="38" r="18" fill="#0891B2" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#7C3AED" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p5" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#DCFCE7" />
          <circle cx="50" cy="38" r="18" fill="#EA580C" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#0891B2" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p6" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#F3E8FF" />
          <circle cx="50" cy="38" r="18" fill="#DB2777" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#F59E0B" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p7" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#E0F2FE" />
          <circle cx="50" cy="38" r="18" fill="#16A34A" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#1D4ED8" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="p8" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#FFE4E6" />
          <circle cx="50" cy="38" r="18" fill="#4F46E5" />
          <path d="M20 100c0-16 13-28 30-28s30 12 30 28z" fill="#059669" />
          <circle cx="42" cy="36" r="2" fill="#0B1533" />
          <circle cx="58" cy="36" r="2" fill="#0B1533" />
          <path d="M44 46c2 2 4 3 6 3s4-1 6-3" stroke="#0B1533" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </symbol>
      </svg>

      {/* Clean Background */}
      <div id="bg" />

      {/* Top Navbar */}
      <header id="top" className={scrolled ? "solid" : ""}>
        <div className="nav">
          <Link href="#cine" className="logo" aria-label="VifeMS home">
            <b>VifeMS</b>
          </Link>
          <ul>
            <li>
              <a href="#how">How It Works</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#usecases">Use Cases</a>
            </li>
          </ul>
          <div className="acts">
            <Link className="signin" href="/login">
              Sign In
            </Link>
            {/* nav-cta-btn is hidden on mobile screens via CSS as per user request */}
            <Link className="btn pri sm nav-cta-btn" href="/onboarding">
              Build My Workspace
            </Link>
            <button
              id="burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="ic">
                <use href={menuOpen ? "#i-x" : "#i-menu"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div id="menu" className={menuOpen ? "open" : ""} aria-hidden={!menuOpen}>
        <a href="#how" onClick={closeMenu}>
          How It Works
        </a>
        <a href="#features" onClick={closeMenu}>
          Features
        </a>
        <a href="#usecases" onClick={closeMenu}>
          Use Cases
        </a>
        <Link href="/login" onClick={closeMenu}>
          Sign In
        </Link>
        <Link href="/onboarding" onClick={closeMenu} style={{ color: "#2563EB" }}>
          Build My Workspace →
        </Link>
      </div>

      {/* Section Dots */}
      <nav id="dots" aria-label="Sections">
        <a href="#cine" data-l="Intro" aria-label="Intro" />
        <a href="#problem" data-l="Problem" aria-label="Problem" />
        <a href="#how" data-l="How it works" aria-label="How it works" />
        <a href="#features" data-l="Features" aria-label="Features" />
        <a href="#usecases" data-l="Use cases" aria-label="Use cases" />
        <a href="#why" data-l="Why VifeMS" aria-label="Why VifeMS" />
        <a href="#security" data-l="Security" aria-label="Security" />
      </nav>

      <main>
        {/* ============ CINEMATIC HERO ============ */}
        <section id="cine" data-theme="0">
          <div id="cinePin">
            <div className="cine-center">
              {/* STAGE 1: centered hero text */}
              <div className="cine-text" id="cineText">
                {/* Floating profiles around hero text */}
                <div className="floating-profile fp-tl" aria-hidden="true">
                  <div className="fp-avatar">
                    <svg viewBox="0 0 100 100"><use href="#p1" /></svg>
                  </div>
                  <span className="fp-badge">Shop Owner</span>
                </div>

                <div className="floating-profile fp-tr" aria-hidden="true">
                  <div className="fp-avatar">
                    <svg viewBox="0 0 100 100"><use href="#p2" /></svg>
                  </div>
                  <span className="fp-badge">Attendant</span>
                </div>

                <div className="floating-profile fp-ml" aria-hidden="true">
                  <div className="fp-avatar">
                    <svg viewBox="0 0 100 100"><use href="#p4" /></svg>
                  </div>
                  <span className="fp-badge">Supplier</span>
                </div>

                <div className="floating-profile fp-mr" aria-hidden="true">
                  <div className="fp-avatar">
                    <svg viewBox="0 0 100 100"><use href="#p3" /></svg>
                  </div>
                  <span className="fp-badge">Customer</span>
                </div>

                <div className="floating-profile fp-bl" aria-hidden="true">
                  <div className="fp-avatar">
                    <svg viewBox="0 0 100 100"><use href="#p7" /></svg>
                  </div>
                  <span className="fp-badge">Accountant</span>
                </div>

                <div className="floating-profile fp-br" aria-hidden="true">
                  <div className="fp-avatar">
                    <svg viewBox="0 0 100 100"><use href="#p5" /></svg>
                  </div>
                  <span className="fp-badge">Courier</span>
                </div>

                <p className="eyebrow">AI-Powered Business Operations</p>
                <h1 className="cine-title">
                  Your Business.
                  <br />
                  Your Workflow.
                  <br />
                  <span className="grad ital">Your Workspace.</span>
                </h1>
                <p className="cine-sub">
                  Describe how your business works. VifeMS builds the workspace around it.
                </p>
                <div className="cine-cta">
                  <Link className="btn pri" href="/onboarding">
                    Build My Workspace{" "}
                    <svg className="ic">
                      <use href="#i-arrow" />
                    </svg>
                  </Link>
                  <a className="btn sec" href="#how">
                    See How It Works
                  </a>
                </div>
                <p className="cine-note">
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  Built for real workflows, not templates.
                </p>
              </div>

              {/* STAGE 2: centered dashboard preview */}
              <div className="cine-dash" id="cineDash">
                <div className="dash">
                  <div className="dash-bar">
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="url">vifems.app / workspace / retail-shop</span>
                  </div>
                  <div className="dash-body">
                    <aside className="dash-side">
                      <a className="on">
                        <svg className="ic">
                          <use href="#i-grid" />
                        </svg>
                        Dashboard
                      </a>
                      <a>
                        <svg className="ic">
                          <use href="#i-pkg" />
                        </svg>
                        Products
                      </a>
                      <a>
                        <svg className="ic">
                          <use href="#i-receipt" />
                        </svg>
                        Sales
                      </a>
                      <a>
                        <svg className="ic">
                          <use href="#i-users" />
                        </svg>
                        Customers
                      </a>
                      <a>
                        <svg className="ic">
                          <use href="#i-card" />
                        </svg>
                        Payments
                      </a>
                      <a>
                        <svg className="ic">
                          <use href="#i-chart" />
                        </svg>
                        Reports
                      </a>
                    </aside>
                    <div className="dash-main">
                      <div className="dash-head">
                        <div>
                          <small>Overview</small>
                          <h4>Today's activity</h4>
                        </div>
                        <span className="pill-cta">+ New Sale</span>
                      </div>
                      <div className="dash-stats">
                        <div className="dstat">
                          <small>Sales</small>
                          <b>
                            ₦128.4k<em>+12%</em>
                          </b>
                        </div>
                        <div className="dstat">
                          <small>Orders</small>
                          <b>
                            34<em>+6</em>
                          </b>
                        </div>
                        <div className="dstat">
                          <small>Stock alerts</small>
                          <b>3</b>
                        </div>
                      </div>
                      <div className="dash-rows">
                        <div className="drow">
                          <span className="nm">
                            <i />
                            Cement 50kg
                          </span>
                          <small>24 in stock</small>
                          <div className="bar-sm">
                            <i style={{ width: "72%" }} />
                          </div>
                          <span className="tag2">Sale</span>
                        </div>
                        <div className="drow">
                          <span className="nm">
                            <i className="g" />
                            Paint 20L
                          </span>
                          <small>8 in stock</small>
                          <div className="bar-sm">
                            <i style={{ width: "38%" }} />
                          </div>
                          <span className="tag2">Order</span>
                        </div>
                        <div className="drow">
                          <span className="nm">
                            <i className="o" />
                            Roofing sheet
                          </span>
                          <small>2 in stock</small>
                          <div className="bar-sm">
                            <i style={{ width: "12%" }} />
                          </div>
                          <span className="tag2">Low</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </section>

        {/* ============ BAND / MARQUEE ============ */}
        <section className="band" aria-label="Businesses and Workspaces">
          <div className="marquee-track-wrap">
            <div className="marquee-row r1">
              <div className="marquee-content">
                <span className="f">Retail shop</span>
                <em />
                <span>Bakery</span>
                <em />
                <span className="g">Auto workshop</span>
                <em />
                <span className="f">Fashion studio</span>
                <em />
                <span>Training center</span>
                <em />
                <span className="g">Delivery service</span>
                <em />
                <span className="f">Retail shop</span>
                <em />
                <span>Bakery</span>
                <em />
              </div>
              <div className="marquee-content" aria-hidden="true">
                <span className="f">Retail shop</span>
                <em />
                <span>Bakery</span>
                <em />
                <span className="g">Auto workshop</span>
                <em />
                <span className="f">Fashion studio</span>
                <em />
                <span>Training center</span>
                <em />
                <span className="g">Delivery service</span>
                <em />
                <span className="f">Retail shop</span>
                <em />
                <span>Bakery</span>
                <em />
              </div>
            </div>
          </div>

          <div className="marquee-track-wrap">
            <div className="marquee-row r2">
              <div className="marquee-content">
                <span>Your business</span>
                <em />
                <span className="g">your rules</span>
                <em />
                <span className="f">your workspace</span>
                <em />
                <span>Your business</span>
                <em />
                <span className="g">your rules</span>
                <em />
                <span className="f">your workspace</span>
                <em />
                <span>Your business</span>
                <em />
              </div>
              <div className="marquee-content" aria-hidden="true">
                <span>Your business</span>
                <em />
                <span className="g">your rules</span>
                <em />
                <span className="f">your workspace</span>
                <em />
                <span>Your business</span>
                <em />
                <span className="g">your rules</span>
                <em />
                <span className="f">your workspace</span>
                <em />
                <span>Your business</span>
                <em />
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROBLEM ============ */}
        <section id="problem" className="pad" data-theme="1">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">The Problem</p>
                <h2 className="display" data-scrub>
                  Software that doesn't fit your business.
                </h2>
              </div>
              <p className="lead" data-reveal>
                We start with your business. Then build around it.
              </p>
            </div>
            <div className="prob-grid">
              <div className="pcol" data-speed=".05">
                <i className="pline" />
                <span className="num">01</span>
                <div className="pi">
                  <svg className="ic">
                    <use href="#i-lock" />
                  </svg>
                </div>
                <h3>Rigid Systems</h3>
                <p>Built for someone else's workflow.</p>
              </div>
              <div className="pcol" data-speed=".12">
                <i className="pline" />
                <span className="num">02</span>
                <div className="pi">
                  <svg className="ic">
                    <use href="#i-unlink" />
                  </svg>
                </div>
                <h3>Scattered Records</h3>
                <p>Spreadsheets and chats that never line up.</p>
              </div>
              <div className="pcol" data-speed=".2">
                <i className="pline" />
                <span className="num">03</span>
                <div className="pi">
                  <svg className="ic">
                    <use href="#i-hour" />
                  </svg>
                </div>
                <h3>No Tech Team</h3>
                <p>You know what you need. You can't build it.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" className="how" data-theme="2">
          <div className="how-pin pin-fill">
            <div className="wrap" style={{ width: "min(1240px,calc(100% - 48px))" }}>
              <div className="sec-head">
                <div>
                  <p className="eyebrow">How It Works</p>
                  <h2 className="display" data-split>
                    From an idea to a working workspace.
                  </h2>
                </div>
                <p className="lead">Four steps. One workspace.</p>
              </div>

              <div className="stage">
                <div className="panel">
                  <div>
                    <div className="big">01</div>
                    <h3>Describe your business.</h3>
                    <p className="d">Plain language. No forms.</p>
                  </div>
                  <div className="pv">
                    <span className="cap">Describe</span>
                    <p className="quote">
                      "I run a bakery and need to track cake orders, ingredients, and deliveries."
                    </p>
                  </div>
                </div>
                <div className="panel">
                  <div>
                    <div className="big">02</div>
                    <h3>Get a structured blueprint.</h3>
                    <p className="d">Your words become records.</p>
                  </div>
                  <div className="pv">
                    <span className="cap">Generate</span>
                    <div className="pills">
                      <span className="pill">Cake order</span>
                      <span className="pill cy">Ingredient</span>
                      <span className="pill">Customer</span>
                      <span className="pill cy">Delivery</span>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div>
                    <div className="big">03</div>
                    <h3>Provision the workspace.</h3>
                    <p className="d">Validated before anything is built.</p>
                  </div>
                  <div className="pv">
                    <span className="cap">Provision</span>
                    <div className="chk">
                      <i>
                        <svg className="ic">
                          <use href="#i-check" />
                        </svg>
                      </i>
                      Blueprint validated
                    </div>
                    <div className="chk">
                      <i>
                        <svg className="ic">
                          <use href="#i-check" />
                        </svg>
                      </i>
                      Platform rules enforced
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div>
                    <div className="big">04</div>
                    <h3>Start managing.</h3>
                    <p className="d">Everything, in one place.</p>
                  </div>
                  <div className="pv">
                    <span className="cap">Manage</span>
                    <div className="trow">
                      <div>
                        Cake order
                        <br />
                        <small>Record</small>
                      </div>
                      <div className="mini-bar">
                        <i />
                      </div>
                      <span className="badge">sample</span>
                    </div>
                    <div className="trow">
                      <div>
                        Delivery
                        <br />
                        <small>Record</small>
                      </div>
                      <div className="mini-bar">
                        <i style={{ width: "46%" }} />
                      </div>
                      <span className="badge">sample</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section id="features" className="pad" data-theme="3">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">Core Features</p>
                <h2 className="display" data-split>
                  Built around how you work.
                </h2>
              </div>
              <p className="lead" data-reveal>
                AI-assisted. Structured. Yours.
              </p>
            </div>
            <div className="fgrid" id="fgrid">
              <article className="card w4">
                <div>
                  <div className="ci">
                    <svg className="ic">
                      <use href="#i-spark" />
                    </svg>
                  </div>
                  <h3>AI Workspace Generation</h3>
                  <p>Describe it. Get a structured start.</p>
                </div>
                <div className="mv">
                  <div className="lns">
                    <div className="ln" />
                    <div className="ln" style={{ width: "70%" }} />
                    <div className="ln" style={{ width: "85%" }} />
                  </div>
                  <span className="arw">→</span>
                  <div className="pills">
                    <span className="pill">Products</span>
                    <span className="pill cy">Orders</span>
                    <span className="pill">Customers</span>
                  </div>
                </div>
              </article>
              <article className="card">
                <div>
                  <div className="ci">
                    <svg className="ic">
                      <use href="#i-layers" />
                    </svg>
                  </div>
                  <h3>Dynamic Modules</h3>
                  <p>Records that fit your business.</p>
                </div>
              </article>
              <article className="card">
                <div>
                  <div className="ci">
                    <svg className="ic">
                      <use href="#i-net" />
                    </svg>
                  </div>
                  <h3>Connected Data</h3>
                  <p>Everything stays linked.</p>
                </div>
                <svg className="nodes" viewBox="0 0 260 70" aria-hidden="true">
                  <line x1="30" y1="35" x2="110" y2="18" />
                  <line x1="110" y1="18" x2="190" y2="42" />
                  <line x1="30" y1="35" x2="130" y2="56" />
                  <line x1="130" y1="56" x2="190" y2="42" />
                  <line x1="190" y1="42" x2="236" y2="20" />
                  <circle cx="30" cy="35" r="6" />
                  <circle cx="110" cy="18" r="6" />
                  <circle cx="190" cy="42" r="6" />
                  <circle cx="130" cy="56" r="6" />
                  <circle cx="236" cy="20" r="6" />
                </svg>
              </article>
              <article className="card w4">
                <div>
                  <div className="ci">
                    <svg className="ic">
                      <use href="#i-layout" />
                    </svg>
                  </div>
                  <h3>Dynamic Interfaces</h3>
                  <p>Tables, forms and views — generated for you.</p>
                </div>
                <div className="frames">
                  <div className="fr">
                    <i className="a" />
                    <i />
                    <i />
                    <i />
                    <span className="cap">Table</span>
                  </div>
                  <div className="fr">
                    <div className="bx" />
                    <div className="bx" />
                    <i className="a" />
                    <span className="cap">Form</span>
                  </div>
                  <div className="fr">
                    <i />
                    <i className="a" style={{ width: "80%" }} />
                    <i style={{ width: "60%" }} />
                    <span className="cap">View</span>
                  </div>
                </div>
              </article>
              <article className="card w4">
                <div>
                  <div className="ci">
                    <svg className="ic">
                      <use href="#i-flow" />
                    </svg>
                  </div>
                  <h3>Adaptable Workflows</h3>
                  <p>Shaped around how you actually run.</p>
                </div>
                <div className="mv">
                  <span className="pill">Order</span>
                  <span className="arw">→</span>
                  <span className="pill cy">Pack</span>
                  <span className="arw">→</span>
                  <span className="pill">Deliver</span>
                </div>
              </article>
              <article className="card">
                <div>
                  <div className="ci">
                    <svg className="ic">
                      <use href="#i-users" />
                    </svg>
                  </div>
                  <h3>Team Operations</h3>
                  <p>Roles and access, as you enable them.</p>
                </div>
                <div className="avs">
                  <i />
                  <i />
                  <i />
                </div>
              </article>
            </div>
          </div>
        </section>



        {/* ============ USE CASES ============ */}
        <section id="usecases" className="pad" data-theme="5">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">Use Cases</p>
                <h2 className="display" data-split>
                  Every business. One approach.
                </h2>
              </div>
              <p className="lead" data-reveal>
                Shaped to each one.
              </p>
            </div>
            <div className="shop" id="shop">
              <div className="layer back" id="shopBack" />
              <div className="layer front" id="shopFront" />
              <div className="fchip a">
                <i />
                Sale recorded · sample
              </div>
              <div className="fchip b">
                <i />
                Low stock · sample
              </div>
              <div className="cap">
                <q>"Built for the way I actually run my shop."</q>
                <small>Real business owners. Real workflows.</small>
              </div>
            </div>
            <div className="ucs" id="ucs">
              <div className="uc">
                <div className="ci">
                  <svg className="ic">
                    <use href="#i-store" />
                  </svg>
                </div>
                <div>
                  <h3>Retail & Inventory</h3>
                  <div className="pills">
                    <span className="pill">Products</span>
                    <span className="pill">Stock</span>
                    <span className="pill">Sales</span>
                  </div>
                </div>
              </div>
              <div className="uc">
                <div className="ci">
                  <svg className="ic">
                    <use href="#i-wrench" />
                  </svg>
                </div>
                <div>
                  <h3>Service Businesses</h3>
                  <div className="pills">
                    <span className="pill">Requests</span>
                    <span className="pill">Jobs</span>
                    <span className="pill">Deliveries</span>
                  </div>
                </div>
              </div>
              <div className="uc">
                <div className="ci">
                  <svg className="ic">
                    <use href="#i-truck" />
                  </svg>
                </div>
                <div>
                  <h3>Orders & Deliveries</h3>
                  <div className="pills">
                    <span className="pill">Orders</span>
                    <span className="pill">Fulfillment</span>
                    <span className="pill">Delivery</span>
                  </div>
                </div>
              </div>
              <div className="uc">
                <div className="ci">
                  <svg className="ic">
                    <use href="#i-brief" />
                  </svg>
                </div>
                <div>
                  <h3>Small Business Ops</h3>
                  <div className="pills">
                    <span className="pill">Records</span>
                    <span className="pill">Workflows</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="fine">Examples, not templates.</p>
          </div>
        </section>

        {/* ============ WHY DIFFERENT ============ */}
        <section id="why" className="pad" data-theme="6">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">What Makes VifeMS Different</p>
                <h2 className="display" data-split>
                  Not another fixed dashboard.
                </h2>
              </div>
              <p className="lead" data-reveal>
                They start with a system. We start with you.
              </p>
            </div>
            <div className="vs-grid" id="vsGrid">
              <div className="vs vs-old">
                <h3>Traditional software</h3>
                <ul>
                  <li>
                    <svg className="ic">
                      <use href="#i-x" />
                    </svg>
                    Starts with fixed modules.
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-x" />
                    </svg>
                    You adapt to it.
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-x" />
                    </svg>
                    Unique needs go unsupported.
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-x" />
                    </svg>
                    Customising is separate.
                  </li>
                </ul>
              </div>
              <div className="vs vs-new">
                <h3>VifeMS</h3>
                <ul>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    Starts with your description.
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    Generates a blueprint.
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    Builds interfaces for your data.
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    Different workflows, one platform.
                  </li>
                </ul>
              </div>
            </div>
            <h2 className="statement" data-scrub>
              Your business shouldn't fit someone else's idea of business.
            </h2>
          </div>
        </section>

        {/* ============ SECURITY ============ */}
        <section id="security" className="pad" data-theme="7">
          <div className="wrap">
            <div className="sec-grid">
              <div>
                <p className="eyebrow">Security & Reliability</p>
                <h2 className="display" style={{ marginTop: "22px" }} data-split>
                  Built for data that matters.
                </h2>
                <p className="mut" style={{ marginTop: "16px" }} data-reveal>
                  Consistent records. Controlled access.
                </p>
                <div className="srows" id="srows">
                  <div className="srow">
                    <div className="ci">
                      <svg className="ic">
                        <use href="#i-shield" />
                      </svg>
                    </div>
                    <div>
                      <h3>Controlled Access</h3>
                      <p>Users only see what they're authorized for.</p>
                    </div>
                  </div>
                  <div className="srow">
                    <div className="ci">
                      <svg className="ic">
                        <use href="#i-db" />
                      </svg>
                    </div>
                    <div>
                      <h3>Structured Data</h3>
                      <p>Blueprints validated before provisioning.</p>
                    </div>
                  </div>
                  <div className="srow">
                    <div className="ci">
                      <svg className="ic">
                        <use href="#i-hist" />
                      </svg>
                    </div>
                    <div>
                      <h3>Reliable Transactions</h3>
                      <p>Payments verified server-side, traceable.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shield" aria-hidden="true">
                <div className="r" />
                <div className="r" />
                <div className="r" />
                <div className="core">
                  <svg className="ic" style={{ width: "1em", height: "1em" }}>
                    <use href="#i-shield" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section id="cta" style={{ padding: "clamp(40px,6vw,80px) 0 0" }} data-theme="8">
          <div className="wrap">
            <div className="cta" id="ctaBox">
              <div>
                <h2 className="display" data-split>
                  Your software should work like your business.{" "}
                  <span className="grad ital">Not the other way around.</span>
                </h2>
                <p>Describe what you run. Get a workspace.</p>
                <div className="btns">
                  <Link className="btn pri" href="/onboarding">
                    Build My Workspace{" "}
                    <svg className="ic">
                      <use href="#i-arrow" />
                    </svg>
                  </Link>
                  <a className="btn sec" href="#how">
                    See How It Works
                  </a>
                </div>
              </div>
              <svg className="branch" viewBox="0 0 400 300" aria-hidden="true">
                <defs>
                  <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#2563EB" />
                    <stop offset="1" stopColor="#0891B2" />
                  </linearGradient>
                </defs>
                <g id="brIn">
                  <path pathLength={1} d="M0 40 C 90 40, 110 150, 190 150" />
                  <path pathLength={1} d="M0 110 C 90 110, 120 150, 190 150" />
                  <path pathLength={1} d="M0 190 C 90 190, 120 150, 190 150" />
                  <path pathLength={1} d="M0 260 C 90 260, 110 150, 190 150" />
                </g>
                <g id="brOut">
                  <path pathLength={1} d="M210 150 C 290 150, 310 20, 400 20" />
                  <path pathLength={1} d="M210 150 C 290 150, 320 85, 400 85" />
                  <path pathLength={1} d="M210 150 C 290 150, 320 150, 400 150" />
                  <path pathLength={1} d="M210 150 C 290 150, 320 215, 400 215" />
                  <path pathLength={1} d="M210 150 C 290 150, 310 280, 400 280" />
                </g>
                <circle className="node" cx="200" cy="150" r="18" />
                <circle className="dot" cx="200" cy="150" r="5" />
              </svg>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="pad" data-theme="9" style={{ paddingBottom: 0 }}>
          <div className="faq-wrap">
            <p className="eyebrow">FAQ</p>
            <h2 className="display" data-split>
              Straight answers.
            </h2>
            <div id="faqList">
              <div className={`qi ${activeFaq === 0 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 0} aria-controls="a1" onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}>
                  <span>What is VifeMS?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a1" role="region">
                  <div>
                    <p>
                      An AI-assisted business operations platform. You describe how your business works, and it generates a
                      structured management workspace around that description.
                    </p>
                  </div>
                </div>
              </div>
              <div className={`qi ${activeFaq === 1 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 1} aria-controls="a2" onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}>
                  <span>How does it create a workspace?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a2" role="region">
                  <div>
                    <p>
                      You describe your business. It becomes a blueprint. The blueprint is validated, then provisioned into
                      a workspace you can immediately start using.
                    </p>
                  </div>
                </div>
              </div>
              <div className={`qi ${activeFaq === 2 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 2} aria-controls="a3" onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}>
                  <span>Do I need to code?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a3" role="region">
                  <div>
                    <p>No. Describe what you need. VifeMS handles the structure.</p>
                  </div>
                </div>
              </div>
              <div className={`qi ${activeFaq === 3 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 3} aria-controls="a4" onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}>
                  <span>Does it work for my type of business?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a4" role="region">
                  <div>
                    <p>
                      It's designed for different workflows on one platform — retail, service businesses, orders and
                      deliveries, small business ops. These are examples, not templates.
                    </p>
                  </div>
                </div>
              </div>
              <div className={`qi ${activeFaq === 4 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 4} aria-controls="a5" onClick={() => setActiveFaq(activeFaq === 4 ? null : 4)}>
                  <span>What is Tra-Sync?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a5" role="region">
                  <div>
                    <p>
                      A preview of a planned payment verification flow. Today it's illustrative — the current backend
                      records payments manually. Server-side verification is the next step.
                    </p>
                  </div>
                </div>
              </div>
              <div className={`qi ${activeFaq === 5 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 5} aria-controls="a6" onClick={() => setActiveFaq(activeFaq === 5 ? null : 5)}>
                  <span>Does Tra-Sync verify bank transfers yet?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a6" role="region">
                  <div>
                    <p>
                      Not yet. Payments are recorded manually. Only server-side provider verification will mark a sale as
                      paid.
                    </p>
                  </div>
                </div>
              </div>
              <div className={`qi ${activeFaq === 6 ? "open" : ""}`}>
                <button type="button" className="q" aria-expanded={activeFaq === 6} aria-controls="a7" onClick={() => setActiveFaq(activeFaq === 6 ? null : 6)}>
                  <span>Is VifeMS available now?</span>
                  <svg className="ic">
                    <use href="#i-plus" />
                  </svg>
                </button>
                <div className="a" id="a7" role="region">
                  <div>
                    <p>
                      Yes — start with Build My Workspace. Some capabilities (like Tra-Sync) are previews, clearly
                      labelled on the page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer data-theme="9">
        <div className="wrap">
          <div className="f-top">
            <div>
              <Link href="#cine" className="logo">
                <b>VifeMS</b>
              </Link>
              <p>Business operations, built around you.</p>
            </div>
            <div className="f-col">
              <h4>Explore</h4>
              <div className="f-links">
                <a href="#how">How It Works</a>
                <a href="#features">Features</a>
                <a href="#usecases">Use Cases</a>
                <Link href="/login">Sign In</Link>
                <Link href="/onboarding">Build My Workspace</Link>
              </div>
            </div>
          </div>
          <div className="f-bot">© {new Date().getFullYear()} VifeMS. All rights reserved.</div>
        </div>
        <div className="wordmark" id="wordmark" aria-hidden="true">
          VifeMS
        </div>
      </footer>
    </div>
  );
}
