"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase } from "@/components/Icons";

// ---------------------------------------------------------------------------
// Animation data
// ---------------------------------------------------------------------------
const BUSINESSES = [
  {
    k: "Bakery",
    p: "I run a bakery.",
    s: "bakery",
    items: [
      ["Customers", "Birthday regulars"],
      ["Orders", "14 cakes due today"],
      ["Ingredients", "Flour running low"],
      ["Deliveries", "3 on the road"],
      ["Payments", "Deposits tracked"],
    ],
  },
  {
    k: "Gym",
    p: "I run a gym.",
    s: "gym",
    items: [
      ["Members", "212 active"],
      ["Classes", "Spin at 6:30 am"],
      ["Trainers", "8 on shift"],
      ["Attendance", "QR check-in"],
      ["Payments", "Monthly plans"],
    ],
  },
  {
    k: "Auto workshop",
    p: "I run an auto workshop.",
    s: "workshop",
    items: [
      ["Customers", "Visit history"],
      ["Vehicles", "Linked to plate numbers"],
      ["Repairs", "5 in the bay"],
      ["Parts", "Brake pads: 4 left"],
      ["Invoices", "Numbered automatically"],
    ],
  },
  {
    k: "Fashion brand",
    p: "I run a fashion brand.",
    s: "fashion brand",
    items: [
      ["Customers", "Measurements saved"],
      ["Orders", "Made-to-measure queue"],
      ["Inventory", "Fabric by the yard"],
      ["Suppliers", "Reorder reminders"],
      ["Payments", "Part-payments"],
    ],
  },
];

// ---------------------------------------------------------------------------
// Person SVG
// ---------------------------------------------------------------------------
function PersonSVG({ typing }: { typing: boolean }) {
  const keyXs = [56, 65, 74, 83, 92, 101, 110, 119, 128, 137];
  return (
    <svg viewBox="0 0 290 230" aria-hidden="true" style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id="hsg">
          <stop offset="0" stopColor="#1e293b" stopOpacity=".15" />
          <stop offset="1" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(38 222) scale(1.15)" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="80" cy="3" rx="140" ry="7" fill="#1e293b" opacity=".1" />
        <line x1="-28" y1="-70" x2="-33" y2="-152" stroke="#94a3b8" strokeWidth="9" />
        <rect x="-32" y="-72" width="68" height="10" rx="5" fill="#64748b" />
        <line x1="4" y1="-62" x2="4" y2="-10" stroke="#94a3b8" strokeWidth="5" />
        <line x1="-22" y1="-7" x2="30" y2="-7" stroke="#94a3b8" strokeWidth="5" />
        <path d="M14 -74L62 -79L66 -12" stroke="#64748b" strokeWidth="14" fill="none" />
        <rect x="58" y="-12" width="30" height="11" rx="5" fill="#475569" />
        <path d="M4 -74L54 -78L58 -12" stroke="#475569" strokeWidth="15" fill="none" />
        <rect x="50" y="-12" width="30" height="12" rx="5" fill="#334155" />
        <g style={{ animation: "hbreathe 3.6s ease-in-out infinite" }}>
          <line x1="0" y1="-78" x2="8" y2="-140" stroke="#1e293b" strokeWidth="38" />
          <line x1="-6" y1="-90" x2="-4" y2="-130" stroke="#334155" strokeWidth="10" />
          <line x1="14" y1="-148" x2="16" y2="-160" stroke="#666" strokeWidth="11" />
          <g transform="translate(14 -156)">
            <g style={{ animation: typing ? "hnod 1.3s ease-in-out infinite" : "hsway 5s ease-in-out infinite" }}>
              <circle cx="8" cy="-22" r="20" fill="#777" />
              <path d="M26 -26L34 -19L26 -15Z" fill="#777" />
              <path d="M8 -22L-1.1 -2.5A22 22 0 1 1 27.9 -29.8Z" fill="#334155" />
              <ellipse cx="1" cy="-18" rx="4" ry="6" fill="#555" />
              <g transform="translate(19 -24)">
                <circle r="2.3" fill="#334155" style={{ animation: "heyeblink 3.6s infinite" }} />
              </g>
              <path d="M14 -30L23 -30M20 -9L25 -9" stroke="#334155" strokeWidth="2" fill="none" />
              <circle cx="30" cy="-22" r="30" fill="url(#hsg)" style={{ mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"], animation: "hglow 2s ease-in-out infinite" }} />
            </g>
          </g>
        </g>
        <rect x="24" y="-118" width="232" height="9" rx="3" fill="#64748b" />
        <line x1="244" y1="-110" x2="244" y2="0" stroke="#475569" strokeWidth="8" />
        <rect x="48" y="-127" width="104" height="8" rx="3" fill="#888" />
        {keyXs.map((x, i) => (
          <rect key={i} x={x} y="-128" width="5" height="2" fill="#555" />
        ))}
        <line x1="150" y1="-124" x2="175" y2="-208" stroke="#aaa" strokeWidth="7" />
        <line x1="147" y1="-126" x2="170" y2="-206" stroke="#ccc" strokeWidth="2.5" opacity=".9" />
        <circle cx="140" cy="-170" r="50" fill="url(#hsg)" opacity=".5" style={{ animation: "hglow 2s ease-in-out infinite" }} />
        <g transform="translate(2 -135)">
          <line x1="0" y1="0" x2="29.3" y2="32.8" stroke="#334155" strokeWidth="13" />
          <g transform="translate(29.3 32.8)">
            <line x1="0" y1="0" x2="36.7" y2="-27.8" stroke="#334155" strokeWidth="11" />
            <ellipse cx="40.7" cy="-26.8" rx="8" ry="5" fill="#555" transform="rotate(9 40.7 -26.8)" />
            <line x1="45.7" y1="-27.8" x2="51.7" y2="-26.2" stroke="#555" strokeWidth="2.8" />
            <line x1="45.7" y1="-25.2" x2="51.7" y2="-23.6" stroke="#555" strokeWidth="2.8" />
          </g>
        </g>
        <g transform="translate(10 -137)">
          <line x1="0" y1="0" x2="33.6" y2="28.4" stroke="#1e293b" strokeWidth="13" />
          <g transform="translate(33.6 28.4)">
            <line x1="0" y1="0" x2="40.4" y2="-22.4" stroke="#1e293b" strokeWidth="11" />
            <ellipse cx="44.4" cy="-21.4" rx="8" ry="5" fill="#777" transform="rotate(9 44.4 -21.4)" />
            <line x1="49.4" y1="-22.4" x2="55.4" y2="-20.8" stroke="#777" strokeWidth="2.8" />
            <line x1="49.4" y1="-19.8" x2="55.4" y2="-18.2" stroke="#777" strokeWidth="2.8" />
            <line x1="49.4" y1="-17.2" x2="55.4" y2="-15.6" stroke="#777" strokeWidth="2.8" />
          </g>
        </g>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helper: compute cubic-bezier SVG path between two elements
// ---------------------------------------------------------------------------
function calcPath(
  fromEl: HTMLElement,
  toEl: HTMLElement,
  stageEl: HTMLElement
): string {
  const s = stageEl.getBoundingClientRect();
  const A = fromEl.getBoundingClientRect();
  const B = toEl.getBoundingClientRect();
  const x1 = A.right - s.left;
  const y1 = A.top + A.height / 2 - s.top;
  const x2 = B.left - s.left;
  const y2 = B.top + B.height / 2 - s.top;
  const m = (x1 + x2) / 2;
  return `M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}`;
}

// ---------------------------------------------------------------------------
// Connector pair (base + spark)
// ---------------------------------------------------------------------------
function Connector({ d, active }: { d: string; active: boolean }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="rgba(6,182,212,.7)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={active ? "0" : "1"}
        pathLength="1"
        style={{ transition: "stroke-dashoffset .8s cubic-bezier(.5,0,.2,1)" }}
      />
      <path
        d={d}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeDasharray=".03 .22"
        pathLength="1"
        style={{
          opacity: active ? 0.9 : 0,
          animation: active ? "hflow 1.6s linear infinite" : "none",
          transition: "opacity .4s .8s",
        }}
      />
    </g>
  );
}

// ---------------------------------------------------------------------------
// BusinessAnimation
// ---------------------------------------------------------------------------
function BusinessAnimation() {
  const [bizIndex, setBizIndex] = useState(0);
  const [bubble, setBubble] = useState("");
  const [typing, setTyping] = useState(false);
  const [coreStatus, setCoreStatus] = useState("Listening\u2026");
  const [thinking, setThinking] = useState(false);
  const [cards, setCards] = useState<{ title: string; sub: string; visible: boolean }[]>([]);
  const [link0Active, setLink0Active] = useState(false);
  const [cardLinks, setCardLinks] = useState<boolean[]>([]);
  const [paths, setPaths] = useState<{ link0: string; cards: string[] }>({ link0: "", cards: [] });

  const stageRef = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const runId = useRef(0);

  // Recalculate connector paths
  const recalcPaths = useCallback(() => {
    if (!stageRef.current || !personRef.current || !coreRef.current) return;
    const l0 = calcPath(personRef.current, coreRef.current, stageRef.current);
    const cs = cardRefs.current
      .filter(Boolean)
      .map((el) => el && coreRef.current && stageRef.current
        ? calcPath(coreRef.current, el, stageRef.current)
        : ""
      );
    setPaths({ link0: l0, cards: cs });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", recalcPaths);
    return () => window.removeEventListener("resize", recalcPaths);
  }, [recalcPaths]);

  // Recalc whenever cards change
  useEffect(() => {
    // slight delay so DOM has painted
    const t = setTimeout(recalcPaths, 30);
    return () => clearTimeout(t);
  }, [cards, recalcPaths]);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const runAnimation = useCallback(async (idx: number) => {
    const id = ++runId.current;
    const biz = BUSINESSES[idx];

    setTyping(false);
    setLink0Active(false);
    setThinking(false);
    setCoreStatus("Listening\u2026");
    setBubble("");
    setCards([]);
    setCardLinks([]);

    await sleep(200);
    if (id !== runId.current) return;

    // Type
    setTyping(true);
    for (let i = 1; i <= biz.p.length; i++) {
      if (id !== runId.current) return;
      setBubble(biz.p.slice(0, i));
      await sleep(70 + Math.random() * 80 + (biz.p[i - 1] === " " ? 50 : 0) + (Math.random() < 0.08 ? 160 : 0));
    }
    setTyping(false);

    recalcPaths();
    setLink0Active(true);
    await sleep(700);
    if (id !== runId.current) return;

    setCoreStatus(`Mapping your ${biz.s}\u2026`);
    setThinking(true);
    await sleep(500);
    if (id !== runId.current) return;

    const initialCards = biz.items.map((it) => ({ title: it[0], sub: it[1], visible: false }));
    setCards(initialCards);
    setCardLinks(new Array(biz.items.length).fill(false));
    await sleep(80);

    for (let k = 0; k < biz.items.length; k++) {
      if (id !== runId.current) return;
      await sleep(170);
      setCards((prev) => prev.map((c, i) => (i === k ? { ...c, visible: true } : c)));
      setCardLinks((prev) => prev.map((v, i) => (i === k ? true : v)));
      recalcPaths();
    }

    await sleep(biz.items.length * 170 + 900);
    if (id !== runId.current) return;

    setThinking(false);
    setCoreStatus(`Built around your ${biz.s}.`);

    await sleep(3800);
    if (id !== runId.current) return;

    setCards((prev) => prev.map((c) => ({ ...c, visible: false })));
    setCardLinks(new Array(biz.items.length).fill(false));
    setLink0Active(false);
    await sleep(600);
    if (id !== runId.current) return;

    // Untype
    for (let i = biz.p.length; i >= 0; i--) {
      if (id !== runId.current) return;
      setBubble(biz.p.slice(0, Math.max(0, i - 1)));
      await sleep(14);
    }
    setBubble("");
    if (id !== runId.current) return;

    const next = (idx + 1) % BUSINESSES.length;
    setBizIndex(next);
    runAnimation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recalcPaths]);

  useEffect(() => {
    runAnimation(0);
    return () => { runId.current = -1; };
  }, [runAnimation]);

  const handleChip = (i: number) => {
    setBizIndex(i);
    runAnimation(i);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <style>{`
        @keyframes hbreathe { 50% { transform: translateY(-1.2px); } }
        @keyframes hsway    { 50% { transform: rotate(1.5deg); } }
        @keyframes hnod     { 0%,100% { transform: rotate(4deg); } 50% { transform: rotate(6.5deg); } }
        @keyframes heyeblink{ 0%,94%,100% { transform: scaleY(1); } 97% { transform: scaleY(.08); } }
        @keyframes hglow    { 50% { opacity: .35; } }
        @keyframes hblink   { 50% { opacity: 0; } }
        @keyframes hring    { from { opacity: .8; transform: scale(1); } to { opacity: 0; transform: scale(1.35); } }
        @keyframes hflow    { to { stroke-dashoffset: -.25; } }
      `}</style>

      {/* Stage */}
      <div
        ref={stageRef}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(140px,1fr) minmax(160px,1fr) minmax(220px,1.5fr)",
          columnGap: "clamp(32px,6vw,80px)",
          alignItems: "center",
          minHeight: 400,
          padding: "0 0 12px",
        }}
      >
        {/* SVG overlay */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
        >
          {paths.link0 && <Connector d={paths.link0} active={link0Active} />}
          {paths.cards.map((d, k) => d ? <Connector key={k} d={d} active={cardLinks[k] ?? false} /> : null)}
        </svg>

        {/* Person */}
        <div ref={personRef} style={{ justifySelf: "center", width: "100%", maxWidth: 340, textAlign: "center", position: "relative" }}>
          <div
            aria-live="polite"
            style={{
              minHeight: 52,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px 16px 16px 4px",
              padding: "12px 16px",
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 12,
              textAlign: "left",
              color: "#334155",
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              wordBreak: "break-word",
              boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.05)",
            }}
          >
            {bubble}
            <span style={{ display: "inline-block", width: 2, height: "1em", background: "#1e293b", marginLeft: 2, verticalAlign: "-2px", animation: "hblink 1s steps(2) infinite" }} />
          </div>
          <PersonSVG typing={typing} />
        </div>

        {/* Core */}
        <div
          ref={coreRef}
          style={{
            justifySelf: "center",
            width: "clamp(140px,16vw,190px)",
            aspectRatio: "1",
            borderRadius: 32,
            display: "grid",
            placeContent: "center",
            textAlign: "center",
            position: "relative",
            background: "linear-gradient(145deg,#12307a,#0a1d4d)",
            border: "2px solid #06B6D4",
            boxShadow: "0 0 50px rgba(6,182,212,.3)",
          }}
        >
          {thinking && (
            <>
              <span style={{ position: "absolute", inset: -2, borderRadius: 32, border: "2px solid #06B6D4", opacity: 0, animation: "hring 1.4s ease-out infinite", pointerEvents: "none" }} />
              <span style={{ position: "absolute", inset: -2, borderRadius: 32, border: "2px solid #06B6D4", opacity: 0, animation: "hring 1.4s ease-out .7s infinite", pointerEvents: "none" }} />
            </>
          )}
          <div>
            <div style={{ font: "800 clamp(26px,3vw,36px)/1 'Bricolage Grotesque', system-ui, sans-serif", letterSpacing: "-.03em", color: "#eaf2ff" }}>
              Vife<span style={{ color: "#06B6D4" }}>MS</span>
            </div>
            <div style={{ fontSize: 14, color: "#9db4d9", marginTop: 10, padding: "0 8px", minHeight: "2.6em", lineHeight: 1.3 }}>
              {coreStatus}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.map((card, k) => (
            <div
              key={k}
              ref={(el) => { cardRefs.current[k] = el; }}
              style={{
                borderRadius: 14,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                padding: "12px 16px",
                opacity: card.visible ? 1 : 0,
                filter: card.visible ? "none" : "blur(6px)",
                transform: card.visible ? "translateX(0)" : "translateX(18px)",
                transition: "opacity .5s, filter .5s, transform .6s cubic-bezier(.2,.9,.3,1)",
              }}
            >
              <h3 style={{ margin: 0, font: "700 16px 'Bricolage Grotesque', system-ui, sans-serif", display: "flex", alignItems: "center", gap: 8, color: "#1e293b" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#06B6D4", boxShadow: "0 0 8px rgba(6,182,212,.5)", flexShrink: 0, display: "inline-block" }} />
                {card.title}
              </h3>
              <p style={{ margin: "4px 0 0 17px", fontSize: 14, color: "#64748b" }}>{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-20 sm:pt-28 pb-16 sm:pb-24 min-h-[100svh] flex items-center">
      <style>{`
        .hero-bg {
          --cell: 64px;
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px);
          background-size: var(--cell) var(--cell);
          background-position: center top;
          -webkit-mask-image: radial-gradient(75% 70% at 50% 35%, #000 20%, transparent 100%);
          mask-image: radial-gradient(75% 70% at 50% 35%, #000 20%, transparent 100%);
        }
        @media (max-width: 760px) {
          .hero-bg { --cell: 44px; }
        }
      `}</style>
      <div className="hero-bg" aria-hidden="true"></div>

      <div className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Left Content */}
        <div
          className={`lg:col-span-6 flex flex-col items-start text-left transition-all duration-700 ease-out transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >


          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.1] mb-5 sm:mb-6">
            Describe your business. <br className="hidden sm:block" />
            <span className="text-blue-600">We&apos;ll build the system.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-xl mb-6 sm:mb-8">
            VifeMS turns the way you run your business into a simple, customizable management workspace without requiring you to know how to build software.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-6">
            <Link
              href="/signup"
              className="relative inline-flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-slate-900 hover:bg-black rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-slate-800 group cursor-pointer"
            >
              <span>Create My Management System</span>
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-full transition-all cursor-pointer"
            >
              See How It Works
            </a>
          </div>

          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Right – Animation */}
        <div
          className={`lg:col-span-6 w-full transition-all duration-1000 delay-150 ease-out transform ${isLoaded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
            }`}
        >
          <div
            style={{
              borderRadius: 28,
              padding: "28px 20px 20px",
            }}
          >
            <BusinessAnimation />
          </div>
        </div>
      </div>

      {/* Full-width Marquee at the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden border-t border-slate-100 bg-white/50 backdrop-blur-sm py-4 z-20">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        <style>{`
          @keyframes hero-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-hero-marquee {
            animation: hero-marquee 35s linear infinite;
          }
        `}</style>
        <div className="flex w-max animate-hero-marquee gap-4 px-4">
          {[
            "Auto Workshops", "Bakeries", "Gyms & Fitness", "Consultancies",
            "Clinics", "Salons", "Retail Stores", "Agencies", "Restaurants",
            "Real Estate", "Law Firms", "Cleaning Services", "Coffee Shops",
            "Fashion Brands",
            // Duplicate for seamless loop
            "Auto Workshops", "Bakeries", "Gyms & Fitness", "Consultancies",
            "Clinics", "Salons", "Retail Stores", "Agencies", "Restaurants",
            "Real Estate", "Law Firms", "Cleaning Services", "Coffee Shops",
            "Fashion Brands"
          ].map((type, i) => (
            <div key={i} className="flex items-center gap-4 px-2 text-slate-600 text-sm font-semibold whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              {type}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

