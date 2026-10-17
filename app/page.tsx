"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VifeMSLogo from "@/components/VifeMSLogo";
import "./landing.css";
import {
  Menu,
  X,
  ArrowRight,
  Store,
  Pause,
  Play,
  WandSparkles,
  Quote,
  Package,
  Boxes,
  Receipt,
  Users,
  Landmark,
  ListChecks,
  Check,
  CircleCheck,
  LockKeyhole,
  Unplug,
  Hourglass,
  Blocks,
  Network,
  LayoutDashboard,
  Workflow,
  Wrench,
  Truck,
  Briefcase,
  Minus,
  ShieldCheck,
  Database,
  History,
} from "lucide-react";

const HERO_DURATIONS = [5200, 3800, 4600, 4200, 7200];
const HERO_PROMPT =
  "I run a retail shop. I need to manage products, stock, sales, customers, and bank-transfer payments.";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hero interactive state
  const [heroStep, setHeroStep] = useState(0);
  const [heroPlaying, setHeroPlaying] = useState(true);
  const [heroTypedText, setHeroTypedText] = useState("");
  const [provDone, setProvDone] = useState(false);
  const [provStep, setProvStep] = useState(0); // 0 to 4
  const [appState, setAppState] = useState<"idle" | "wait" | "verify" | "ok">("idle");

  // Tra-Sync state (3 stages: 0 = Awaiting, 1 = Verifying, 2 = Verified)
  const [tsStage, setTsStage] = useState(0);
  const [tsPlaying, setTsPlaying] = useState(true);

  const heroVisibleRef = useRef(true);
  const tsVisibleRef = useRef(false);
  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape key for mobile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Intersection observers for reveal items
  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const rElements = document.querySelectorAll(".landing-root .rv");
    const rio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            rio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    rElements.forEach((el) => rio.observe(el));

    const hiwElements = document.querySelectorAll(".landing-root .hiw li");
    const hio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            hio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    hiwElements.forEach((el) => hio.observe(el));

    const heroSheet = document.querySelector(".landing-root .sheet");
    let sheetObserver: IntersectionObserver | null = null;
    if (heroSheet) {
      sheetObserver = new IntersectionObserver(
        (entries) => {
          heroVisibleRef.current = entries[0]?.isIntersecting ?? false;
        },
        { threshold: 0.2 }
      );
      sheetObserver.observe(heroSheet);
    }

    const tsPanel = document.querySelector(".landing-root .ts-card");
    let tsObserver: IntersectionObserver | null = null;
    if (tsPanel) {
      tsObserver = new IntersectionObserver(
        (entries) => {
          tsVisibleRef.current = entries[0]?.isIntersecting ?? false;
        },
        { threshold: 0.2 }
      );
      tsObserver.observe(tsPanel);
    }

    return () => {
      rio.disconnect();
      hio.disconnect();
      sheetObserver?.disconnect();
      tsObserver?.disconnect();
    };
  }, []);

  // Hero animation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (heroPlaying) {
      timer = setTimeout(() => {
        if (!heroVisibleRef.current) return;
        setHeroStep((prev) => (prev + 1) % 5);
      }, HERO_DURATIONS[heroStep]);
    }

    return () => clearTimeout(timer);
  }, [heroStep, heroPlaying]);

  // Handle scene-specific hero animations
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    const provTimers: NodeJS.Timeout[] = [];
    const appTimers: NodeJS.Timeout[] = [];

    if (heroStep === 0) {
      let i = 0;
      const typeNext = () => {
        i += 1;
        setHeroTypedText(HERO_PROMPT.slice(0, i));
        if (i < HERO_PROMPT.length) {
          typingTimer = setTimeout(typeNext, 30);
        }
      };
      typingTimer = setTimeout(() => {
        setHeroTypedText("");
        typeNext();
      }, 30);
    } else if (heroStep === 3) {
      provTimers.push(setTimeout(() => {
        setProvStep(0);
        setProvDone(false);
      }, 0));
      for (let n = 1; n <= 4; n++) {
        provTimers.push(
          setTimeout(() => {
            setProvStep(n);
            if (n === 4) setProvDone(true);
          }, 500 + n * 750)
        );
      }
    } else if (heroStep === 4) {
      appTimers.push(setTimeout(() => setAppState("idle"), 0));
      appTimers.push(
        setTimeout(() => {
          setAppState("wait");
        }, 800)
      );
      appTimers.push(
        setTimeout(() => {
          setAppState("verify");
        }, 2700)
      );
      appTimers.push(
        setTimeout(() => {
          setAppState("ok");
        }, 4600)
      );
    }

    return () => {
      clearTimeout(typingTimer);
      provTimers.forEach(clearTimeout);
      appTimers.forEach(clearTimeout);
    };
  }, [heroStep]);

  // Tra-Sync flow loop (2800ms per stage)
  useEffect(() => {
    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      return;
    }

    let timer: NodeJS.Timeout;
    if (tsPlaying) {
      timer = setTimeout(() => {
        if (tsVisibleRef.current) {
          setTsStage((prev) => (prev + 1) % 3);
        }
      }, 2800);
    }
    return () => clearTimeout(timer);
  }, [tsStage, tsPlaying]);

  const TS_STAGES = [
    {
      label: "Awaiting payment",
      tone: "amber" as const,
      done: 1,
      cells: [
        { label: "Awaiting transfer", tone: "amber" as const },
        { label: "Unchanged", tone: "mute" as const },
        { label: "Not recorded yet", tone: "mute" as const },
      ],
    },
    {
      label: "Verifying",
      tone: "blue" as const,
      done: 3,
      cells: [
        { label: "Event received", tone: "blue" as const },
        { label: "Unchanged", tone: "mute" as const },
        { label: "Pending", tone: "mute" as const },
      ],
    },
    {
      label: "Verified",
      tone: "green" as const,
      done: 6,
      cells: [
        { label: "Verified", tone: "green" as const },
        { label: "Stock updated", tone: "green" as const },
        { label: "Recorded", tone: "green" as const },
      ],
    },
  ];

  const currentTsStageData = TS_STAGES[tsStage];

  const TS_TIMELINE_STEPS = [
    { text: "An attendant creates a sale", actor: "Attendant" },
    { text: "Customer pays by bank transfer", actor: "Customer" },
    { text: "Proposed: provider sends a payment event", actor: "Provider" },
    { text: "Proposed: Tra-Sync verifies the transaction", actor: "Tra-Sync" },
    { text: "Proposed: sale and stock are updated", actor: "Tra-Sync" },
    { text: "Proposed: owner sees the verified record", actor: "Owner" },
  ];

  return (
    <div className="landing-root">
      <a className="skip" href="#main">
        Skip to content
      </a>

      {/* HEADER */}
      <header className={`hdr ${scrolled ? "scrolled" : ""}`} id="top">
        <div className="wrap hdr-in">
          <Link className="logo" href="/" aria-label="VifeMS home">
            <VifeMSLogo theme="light" size="md" />
          </Link>

          <nav className="nav" aria-label="Main">
            <a href="#how">How It Works</a>
            <a href="#features">Features</a>
            <a href="#use-cases">Use Cases</a>
            <a href="#tra-sync">Tra-Sync</a>
          </nav>

          <div className="acts">
            <Link className="signin" href="/login">
              Sign In
            </Link>
            <Link className="btn btn-primary btn-sm" href="/signup">
              Build My Workspace
            </Link>
          </div>

          <button
            className="menu-btn"
            id="menuBtn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mnav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mnav" id="mnav">
            <div className="wrap">
              <a href="#how" onClick={() => setMenuOpen(false)}>
                How It Works
              </a>
              <a href="#features" onClick={() => setMenuOpen(false)}>
                Features
              </a>
              <a href="#use-cases" onClick={() => setMenuOpen(false)}>
                Use Cases
              </a>
              <a href="#tra-sync" onClick={() => setMenuOpen(false)}>
                Tra-Sync
              </a>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link
                className="btn btn-primary"
                href="/signup"
                onClick={() => setMenuOpen(false)}
              >
                Build My Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">AI-powered business operations</p>
              <h1>
                <span>Your Business.</span> <span>Your Workflow.</span>{" "}
                <span>Your Workspace.</span>
              </h1>
              <p className="lede">
                Describe how your business works. VifeMS turns it into a structured
                management workspace.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/signup">
                  Build My Workspace <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a className="btn btn-ghost" href="#how">
                  See How It Works
                </a>
              </div>
              <p className="trust">
                <Store size={18} aria-hidden="true" />
                <span>
                  Built for real business workflows, not one-size-fits-all templates.
                </span>
              </p>
            </div>

            <div
              className="sheet"
              role="group"
              aria-label="Illustrative preview: from a business description to a working workspace"
            >
              <div className="sheet-top">
                <span className="badge">Illustrative preview</span>
                <button
                  className={`ctl ${!heroPlaying ? "is-paused" : ""}`}
                  type="button"
                  aria-label={heroPlaying ? "Pause the animation" : "Play the animation"}
                  onClick={() => setHeroPlaying(!heroPlaying)}
                >
                  {heroPlaying ? (
                    <>
                      <Pause size={14} aria-hidden="true" />
                      <span className="ctl-t">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} aria-hidden="true" />
                      <span className="ctl-t">Play</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className="steps"
                id="steps"
                style={{ "--dur": `${HERO_DURATIONS[heroStep]}ms` } as React.CSSProperties}
              >
                {[
                  "Describe",
                  "Understand",
                  "Structure",
                  "Build",
                  "Operate",
                ].map((name, index) => (
                  <button
                    key={name}
                    className={`stp ${heroStep === index ? "on" : ""}`}
                    type="button"
                    aria-label={`Step ${index + 1}: ${name}`}
                    aria-current={heroStep === index ? "step" : undefined}
                    onClick={() => {
                      setHeroPlaying(false);
                      setHeroStep(index);
                    }}
                  >
                    <span className="n">{index + 1}</span>
                    <span className="lbl">{name}</span>
                    <i className="bar"></i>
                  </button>
                ))}
              </div>

              <p className="sr-only">
                A five-step preview. First, an owner describes a retail shop in plain
                language. Second, the request splits into products, inventory, sales,
                customers and payments. Third, those parts connect through relationships:
                a sale links to a customer, line items link to products, and a payment
                links to its sale. Fourth, the workspace is provisioned. Fifth, a sample
                animation depicts a proposed sale moving from awaiting payment to verified;
                this flow is not connected to a payment provider.
              </p>

              <div
                className="stage"
                id="stage"
                style={{ "--dur": `${HERO_DURATIONS[heroStep]}ms` } as React.CSSProperties}
              >
                {/* Scene 1: Describe */}
                <div className={`scene ${heroStep === 0 ? "on" : ""}`} aria-hidden={heroStep !== 0}>
                  <div className="pane">
                    <div className="pane-h">
                      <WandSparkles size={14} /> Describe your business
                    </div>
                    <p className="prompt">
                      <span>{heroTypedText}</span>
                      <span className="caret"></span>
                    </p>
                  </div>
                </div>

                {/* Scene 2: Understand */}
                <div className={`scene ${heroStep === 1 ? "on" : ""}`} aria-hidden={heroStep !== 1}>
                  <div className="prompt-mini">
                    <Quote size={16} />
                    <span>
                      I run a retail shop. I need to manage products, stock, sales,
                      customers, and bank-transfer payments.
                    </span>
                  </div>
                  <div className="trunk"></div>
                  <div className="chips">
                    <div className="chip" style={{ "--i": 0 } as React.CSSProperties}>
                      <Package size={20} /> Products
                    </div>
                    <div className="chip" style={{ "--i": 1 } as React.CSSProperties}>
                      <Boxes size={20} /> Inventory
                    </div>
                    <div className="chip" style={{ "--i": 2 } as React.CSSProperties}>
                      <Receipt size={20} /> Sales
                    </div>
                    <div className="chip" style={{ "--i": 3 } as React.CSSProperties}>
                      <Users size={20} /> Customers
                    </div>
                    <div className="chip" style={{ "--i": 4 } as React.CSSProperties}>
                      <Landmark size={20} /> Payments
                    </div>
                  </div>
                </div>

                {/* Scene 3: Structure */}
                <div className={`scene ${heroStep === 2 ? "on" : ""}`} aria-hidden={heroStep !== 2}>
                  <div className="erd">
                    <div className="ent e-customer" style={{ "--i": 0 } as React.CSSProperties}>
                      <h4>
                        <Users size={14} /> Customer
                      </h4>
                      <ul>
                        <li>name<em>text</em></li>
                        <li>phone<em>text</em></li>
                        <li>joined<em>date</em></li>
                      </ul>
                    </div>
                    <span className="lk h lk-a" style={{ "--i": 0 } as React.CSSProperties}></span>

                    <div className="ent e-sale" style={{ "--i": 1 } as React.CSSProperties}>
                      <h4>
                        <Receipt size={14} /> Sale
                      </h4>
                      <ul>
                        <li>ref<em>text</em></li>
                        <li className="ref">customer<em>link</em></li>
                        <li>total<em>money</em></li>
                        <li>status<em>choice</em></li>
                      </ul>
                    </div>
                    <span className="lk h lk-b" style={{ "--i": 1 } as React.CSSProperties}></span>

                    <div className="ent e-pay" style={{ "--i": 2 } as React.CSSProperties}>
                      <h4>
                        <Landmark size={14} /> Payment
                      </h4>
                      <ul>
                        <li className="ref">sale<em>link</em></li>
                        <li>amount<em>money</em></li>
                        <li>provider_ref<em>text</em></li>
                        <li>status<em>choice</em></li>
                      </ul>
                    </div>
                    <span className="lk v lk-c" style={{ "--i": 2 } as React.CSSProperties}></span>

                    <div className="ent e-line" style={{ "--i": 3 } as React.CSSProperties}>
                      <h4>
                        <ListChecks size={14} /> Line item
                      </h4>
                      <ul>
                        <li className="ref">sale<em>link</em></li>
                        <li className="ref">product<em>link</em></li>
                        <li>qty<em>number</em></li>
                        <li>price<em>money</em></li>
                      </ul>
                    </div>
                    <span className="lk h lk-d" style={{ "--i": 3 } as React.CSSProperties}></span>

                    <div className="ent e-prod" style={{ "--i": 4 } as React.CSSProperties}>
                      <h4>
                        <Package size={14} /> Product
                      </h4>
                      <ul>
                        <li>name<em>text</em></li>
                        <li>sku<em>text</em></li>
                        <li>price<em>money</em></li>
                        <li>stock<em>number</em></li>
                      </ul>
                    </div>
                    <p className="legend">Lines show how records relate.</p>
                  </div>
                  <p className="rels">
                    Sale links to Customer. Line item links to Sale and Product. Payment links to Sale.
                  </p>
                </div>

                {/* Scene 4: Build */}
                <div className={`scene ${heroStep === 3 ? "on" : ""}`} aria-hidden={heroStep !== 3}>
                  <div className="prov">
                    <div className="prov-h">
                      <span>Provisioning workspace</span>
                      <span>{Math.round((provStep / 4) * 100)}%</span>
                    </div>
                    <div className="prov-bar">
                      <i style={{ width: `${(provStep / 4) * 100}%` }}></i>
                    </div>
                    <ul className="prov-list" id="provList">
                      {[
                        "Checking the blueprint against platform rules",
                        "Creating records and fields",
                        "Linking related records",
                        "Preparing management views",
                      ].map((itemText, idx) => {
                        const isDone = provStep > idx;
                        const isActive = provStep === idx;
                        return (
                          <li
                            key={idx}
                            className={isDone ? "is-done" : isActive ? "is-active" : ""}
                          >
                            <span className="ico">
                              <Check size={12} strokeWidth={3.2} />
                            </span>
                            {itemText}
                          </li>
                        );
                      })}
                    </ul>
                    <div className={`done ${provDone ? "show" : ""}`} id="provDone">
                      <CircleCheck size={18} />
                      Workspace ready: 5 modules, 4 relations
                      <small>Sample result</small>
                    </div>
                  </div>
                </div>

                {/* Scene 5: Operate */}
                <div className={`scene ${heroStep === 4 ? "on" : ""}`} aria-hidden={heroStep !== 4}>
                  <div className="app" id="app" data-st={appState}>
                    <div className="app-nav">
                      <span><Package size={14} /> Products</span>
                      <span><Boxes size={14} /> Inventory</span>
                      <span className="cur"><Receipt size={14} /> Sales</span>
                      <span><Users size={14} /> Customers</span>
                      <span><Landmark size={14} /> Payments</span>
                    </div>
                    <div className="app-main">
                      <div className="app-h">
                        <div>
                          <small>Sales</small>
                          <strong>Sale S-0042</strong>
                        </div>
                        <span className={`pill is-${appState}`} id="pill">
                          <span className="t">
                            {appState === "ok"
                              ? "Verified"
                              : appState === "verify"
                              ? "Verifying"
                              : "Awaiting payment"}
                          </span>
                        </span>
                      </div>
                      <table className="lines">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Ankara tote bag</td>
                            <td>2</td>
                            <td>₦18,000</td>
                          </tr>
                          <tr>
                            <td>Shea butter 250g</td>
                            <td>1</td>
                            <td>₦4,500</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2}>Total</td>
                            <td>₦22,500</td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="app-foot">
                        <div className="mini">
                          <span>Ankara tote bag in stock</span>
                          <strong id="stock" className={appState === "ok" ? "flash" : ""}>
                            {appState === "ok" ? "12" : "14"}
                          </strong>
                        </div>
                        <div className="mini">
                          <span>Transaction record</span>
                          <span className="txt" id="rec">
                            {appState === "ok"
                              ? "Verified transaction added to records"
                              : "No verified transaction yet"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="sheet-foot">Sample data only.</p>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="sec" id="problem" aria-labelledby="h-problem">
          <div className="wrap">
            <div className="intro">
              <div>
                <p className="eyebrow">The problem</p>
                <h2 id="h-problem">Stop forcing your business into software that doesn&apos;t fit.</h2>
              </div>
              <p className="lede">VifeMS starts with your business, then builds the workspace around it.</p>
            </div>
            <div className="probs">
              <article className="prob rv">
                <LockKeyhole size={26} strokeWidth={1.7} />
                <h3>Rigid Systems</h3>
                <p>Built around someone else&apos;s way of working.</p>
              </article>
              <article className="prob rv">
                <Unplug size={26} strokeWidth={1.7} />
                <h3>Disconnected Records</h3>
                <p>Spreadsheets, chats and paper that never line up.</p>
              </article>
              <article className="prob rv">
                <Hourglass size={26} strokeWidth={1.7} />
                <h3>Limited Technical Resources</h3>
                <p>You know what you need. You can&apos;t build it.</p>
              </article>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="sec how" id="how" aria-labelledby="h-how">
          <div className="wrap">
            <div className="intro">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 id="h-how">From a business idea to a working workspace.</h2>
              </div>
              <p className="lede">Four steps from description to daily use.</p>
            </div>
            <ol className="hiw">
              <li className="rv">
                <span className="node">1</span>
                <span className="k">Describe</span>
                <h3>Tell VifeMS how your business works.</h3>
                <div className="demo">
                  <p className="q">
                    “I run a boutique bakery and need to track custom cake orders, ingredients, customer details, and deliveries.”
                  </p>
                </div>
              </li>
              <li className="rv">
                <span className="node">2</span>
                <span className="k">Generate</span>
                <h3>Turn your description into a structured blueprint.</h3>
                <div className="demo">
                  <div className="mchips">
                    <span>Cake order</span>
                    <span>Ingredient</span>
                    <span>Customer</span>
                    <span>Delivery</span>
                  </div>
                </div>
              </li>
              <li className="rv">
                <span className="node">3</span>
                <span className="k">Provision</span>
                <h3>Create the workspace structure.</h3>
                <div className="demo">
                  <ul className="checks">
                    <li>
                      <Check size={16} strokeWidth={3} /> Blueprint validated
                    </li>
                    <li>
                      <Check size={16} strokeWidth={3} /> Platform rules enforced
                    </li>
                  </ul>
                </div>
              </li>
              <li className="rv">
                <span className="node">4</span>
                <span className="k">Manage</span>
                <h3>Start managing your business.</h3>
                <div className="demo">
                  <div className="mrows">
                    <div>
                      Cake order <small>sample</small>
                    </div>
                    <div>
                      Delivery <small>sample</small>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* FEATURES */}
        <section className="sec" id="features" aria-labelledby="h-feat">
          <div className="wrap">
            <div className="intro">
              <div>
                <p className="eyebrow">Core features</p>
                <h2 id="h-feat">A workspace built around the way you work.</h2>
              </div>
              <p className="lede">AI-assisted setup, structured business management.</p>
            </div>
            <div className="cells">
              <article className="cell">
                <span className="ibox"><WandSparkles size={21} /></span>
                <h3>AI Workspace Generation</h3>
                <p>Describe your business. Get a structured starting point.</p>
              </article>
              <article className="cell">
                <span className="ibox"><Blocks size={21} /></span>
                <h3>Dynamic Modules</h3>
                <p>Products, customers, orders, services and other supported records.</p>
              </article>
              <article className="cell">
                <span className="ibox"><Network size={21} /></span>
                <h3>Connected Business Data</h3>
                <p>Related records stay linked and consistent.</p>
              </article>
              <article className="cell">
                <span className="ibox"><LayoutDashboard size={21} /></span>
                <h3>Dynamic Management Interfaces</h3>
                <p>Generated tables, forms and views, not one fixed dashboard.</p>
              </article>
              <article className="cell">
                <span className="ibox"><Workflow size={21} /></span>
                <h3>Adaptable Workflows</h3>
                <p>Shaped around how your business actually runs.</p>
              </article>
              <article className="cell">
                <span className="ibox"><Users size={21} /></span>
                <h3>Team Operations</h3>
                <p>Team access and roles as they are enabled.</p>
              </article>
            </div>
          </div>
        </section>

        {/* TRA-SYNC */}
        <section className="ts-section" id="tra-sync" aria-labelledby="h-ts">
          <div className="ts-hero">
            {/* LEFT: message */}
            <div className="ts-copy">
              <div className="ts-eyebrow">
                <span className="label">Introducing Tra-Sync</span>
                <span className="ts-badge">Preview</span>
              </div>

              <h2 id="h-ts">
                A concept for payment verification. <span>Connected to your sales workflow.</span>
              </h2>

              <p className="ts-sub">
                Tra-Sync is a preview of a future provider-backed flow. The current backend records payments manually and does not verify settlement.
              </p>

              <div>
                <a className="ts-cta" href="#tra-sync">
                  Explore Tra-Sync
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06101F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>

              <div className="ts-trust">
                <div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>
                  Planned: server-side provider verification
                </div>
                <div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/></svg>
                  Planned: stock updates after verified payment
                </div>
                <div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/></svg>
                  Planned: verified sales appear in the owner&apos;s record
                </div>
              </div>
            </div>

            {/* RIGHT: live flow card */}
            <div className="ts-card" aria-label="Illustrative payment verification flow">
              <div className="ts-card-head">
                <div className="title"><i></i>Illustrative flow</div>
                <button
                  className="ts-pause"
                  type="button"
                  onClick={() => setTsPlaying((p) => !p)}
                  aria-label={tsPlaying ? "Pause verification flow" : "Play verification flow"}
                >
                  {tsPlaying ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9D4EC" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9D4EC" aria-hidden="true"><path d="M7 4.5v15a1 1 0 001.5.85l12-7.5a1 1 0 000-1.7l-12-7.5A1 1 0 007 4.5z"/></svg>
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>

              <div className="ts-tabs">
                {TS_STAGES.map((s, idx) => (
                  <button
                    key={idx}
                    className="ts-tab"
                    type="button"
                    data-tone={s.tone}
                    data-passed={idx < tsStage ? "true" : "false"}
                    aria-pressed={idx === tsStage}
                    onClick={() => {
                      setTsStage(idx);
                      setTsPlaying(false);
                    }}
                  >
                    <i></i>
                    {idx === 0 ? "Awaiting" : idx === 1 ? "Verifying" : "Verified"}
                  </button>
                ))}
              </div>

              <div className="ts-receipt">
                <div className="ts-row">
                  <span className="ts-sale-id">Sale S-0042</span>
                  <span className="ts-pill" data-tone={currentTsStageData.tone}>
                    <i></i>
                    <span>{currentTsStageData.label}</span>
                  </span>
                </div>
                <div className="ts-row" style={{ alignItems: "baseline" }}>
                  <span className="ts-amount">₦22,500</span>
                  <span className="ts-method">Bank transfer</span>
                </div>
                <div className="ts-cells">
                  <div className="ts-cell">
                    <span className="k">Provider check</span>
                    <span className="v" data-tone={currentTsStageData.cells[0].tone}>
                      <i></i>
                      <span>{currentTsStageData.cells[0].label}</span>
                    </span>
                  </div>
                  <div className="ts-cell">
                    <span className="k">Inventory</span>
                    <span className="v" data-tone={currentTsStageData.cells[1].tone}>
                      <i></i>
                      <span>{currentTsStageData.cells[1].label}</span>
                    </span>
                  </div>
                  <div className="ts-cell">
                    <span className="k">Owner record</span>
                    <span className="v" data-tone={currentTsStageData.cells[2].tone}>
                      <i></i>
                      <span>{currentTsStageData.cells[2].label}</span>
                    </span>
                  </div>
                </div>
              </div>

              <ol className="ts-timeline">
                {TS_TIMELINE_STEPS.map((step, idx) => {
                  const isDone = idx < currentTsStageData.done;
                  const isCurrent = idx === currentTsStageData.done;
                  const stateAttr = isDone ? "done" : isCurrent ? "current" : "pending";
                  const lineAttr = idx < currentTsStageData.done - 1 ? "done" : idx === currentTsStageData.done - 1 ? "lead" : "idle";

                  return (
                    <li key={idx} className="ts-step" data-state={stateAttr} data-line={lineAttr}>
                      <div className="ts-rail">
                        <div className="ts-dot">
                          <b>{idx + 1}</b>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#04140C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5"/>
                          </svg>
                        </div>
                        <div className="ts-line"></div>
                      </div>
                      <div className="ts-body">
                        <span className="ts-name">{step.text}</span>
                        <span className="ts-actor">{step.actor}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="ts-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FA0BF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
                Sample data. Only server-side provider verification marks a sale paid.
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="sec" id="use-cases" aria-labelledby="h-use">
          <div className="wrap">
            <div className="intro">
              <div>
                <p className="eyebrow">Use cases</p>
                <h2 id="h-use">Different businesses. Different workflows. One adaptable approach.</h2>
              </div>
              <p className="lede">One approach, shaped to each business.</p>
            </div>
            <div className="use-img-banner rv">
              <Image
                src="/use-case-owner.png"
                alt="A retail business owner managing inventory on a tablet in their shop"
                width={1180}
                height={480}
                className="use-img"
                priority
              />
              <div className="use-img-overlay">
                <span className="use-img-quote">
                  &quot;I needed something built for the way I actually run my shop — not a one-size-fits-all template.&quot;
                </span>
                <span className="use-img-label">Real business owners. Real workflows.</span>
              </div>
            </div>
            <div className="uses">
              <article className="use rv">
                <span className="ibox"><Store size={21} /></span>
                <h3>Retail and Inventory</h3>
                <div className="mchips">
                  <span>Products</span>
                  <span>Stock</span>
                  <span>Sales</span>
                </div>
              </article>
              <article className="use rv">
                <span className="ibox"><Wrench size={21} /></span>
                <h3>Service Businesses</h3>
                <div className="mchips">
                  <span>Requests</span>
                  <span>Jobs</span>
                  <span>Schedule</span>
                </div>
              </article>
              <article className="use rv">
                <span className="ibox"><Truck size={21} /></span>
                <h3>Orders and Deliveries</h3>
                <div className="mchips">
                  <span>Orders</span>
                  <span>Fulfillment</span>
                  <span>Delivery</span>
                </div>
              </article>
              <article className="use rv">
                <span className="ibox"><Briefcase size={21} /></span>
                <h3>Small Business Operations</h3>
                <div className="mchips">
                  <span>Records</span>
                  <span>Workflows</span>
                </div>
              </article>
            </div>
            <p className="note">Examples, not ready-made templates.</p>
          </div>
        </section>

        {/* DIFFERENT */}
        <section className="sec cmp" id="different" aria-labelledby="h-diff">
          <div className="wrap">
            <div className="intro stack">
              <div>
                <p className="eyebrow">What makes VifeMS different</p>
                <h2 id="h-diff">Not another fixed-template dashboard.</h2>
              </div>
              <p className="lede">Traditional software starts with a fixed system. VifeMS starts with your business.</p>
            </div>
            <div className="cmp-grid">
              <div className="col old">
                <h3>Traditional fixed-template software</h3>
                <ul>
                  <li><Minus size={18} />Starts with predefined modules.</li>
                  <li><Minus size={18} />You adapt to its process.</li>
                  <li><Minus size={18} />Unique needs can go unsupported.</li>
                  <li><Minus size={18} />Customizing is separate from daily work.</li>
                </ul>
              </div>
              <div className="col new">
                <h3>VifeMS</h3>
                <ul>
                  <li><Check size={18} />Starts with your description.</li>
                  <li><Check size={18} />Generates a structured workspace blueprint.</li>
                  <li><Check size={18} />Builds interfaces around your data.</li>
                  <li><Check size={18} />Designed for different workflows on one platform.</li>
                </ul>
              </div>
            </div>
            <p className="closer">Your business should not have to fit someone else&apos;s idea of how business works.</p>
          </div>
        </section>

        {/* SECURITY */}
        <section className="sec" id="security" aria-labelledby="h-sec">
          <div className="wrap">
            <div className="intro">
              <div>
                <p className="eyebrow">Security and reliability</p>
                <h2 id="h-sec">Built for business data that matters.</h2>
              </div>
              <p className="lede">Consistent records. Controlled access.</p>
            </div>
            <div className="secs">
              <div>
                <ShieldCheck size={30} strokeWidth={1.6} />
                <h3>Controlled Workspace Access</h3>
                <p>Users should only see what they&apos;re authorized to use.</p>
              </div>
              <div>
                <Database size={30} strokeWidth={1.6} />
                <h3>Structured Data Management</h3>
                <p>Blueprints should be validated before provisioning.</p>
              </div>
              <div>
                <History size={30} strokeWidth={1.6} />
                <h3>Reliable Transaction Processing</h3>
                <p>Payments should be verified server-side and traceable.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="sec" style={{ paddingTop: 0 }} aria-labelledby="h-cta">
          <div className="wrap">
            <div className="cta">
              <h2 id="h-cta">Your business has its own way of working. Your software should too.</h2>
              <p className="lede">Describe the business you run and get a structured workspace.</p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/signup">
                  Build My Workspace <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a className="btn btn-ghost" href="#how">
                  See How It Works
                </a>
              </div>
              <svg className="tree" viewBox="0 0 320 200" aria-hidden="true">
                <path d="M0 100H80" />
                <path d="M80 100C120 100 120 30 170 30H312" />
                <path d="M80 100C120 100 120 65 170 65H312" />
                <path d="M80 100H312" />
                <path d="M80 100C120 100 120 135 170 135H312" />
                <path d="M80 100C120 100 120 170 170 170H312" />
                <circle className="dot" cx="312" cy="30" r="4" />
                <circle className="dot" cx="312" cy="65" r="4" />
                <circle className="dot" cx="312" cy="100" r="4" />
                <circle className="dot" cx="312" cy="135" r="4" />
                <circle className="dot" cx="312" cy="170" r="4" />
              </svg>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sec" id="faq" style={{ paddingTop: 0 }} aria-labelledby="h-faq">
          <div className="wrap">
            <div className="intro stack">
              <div>
                <p className="eyebrow">FAQ</p>
                <h2 id="h-faq">Questions, answered plainly.</h2>
              </div>
            </div>
            <div className="faq">
              <details>
                <summary>What is VifeMS?</summary>
                <p>
                  An AI-native platform for creating and managing a workspace around how your business operates.
                </p>
              </details>
              <details>
                <summary>How does VifeMS create a workspace?</summary>
                <p>
                  You describe your business. AI drafts a blueprint, the platform validates it, then provisions the workspace.
                </p>
              </details>
              <details>
                <summary>Do I need programming skills?</summary>
                <p>No. You describe what you need in plain language.</p>
              </details>
              <details>
                <summary>Can VifeMS support different types of businesses?</summary>
                <p>
                  It&apos;s designed to. What&apos;s available depends on what the platform currently supports.
                </p>
              </details>
              <details>
                <summary>What is Tra-Sync?</summary>
                <p>
                  Tra-Sync is a concept preview for a future payment-verification flow; the current backend records payments manually.
                </p>
              </details>
              <details>
                <summary>Does Tra-Sync verify bank transfers?</summary>
                <p>
                  Provider-backed bank-transfer verification is not implemented yet. Screenshots are not verified by this preview.
                </p>
              </details>
              <details>
                <summary>Is VifeMS available now?</summary>
                <p id="faqAvail">
                  A showcase for the Devcenter x Rumpty Cloud Hacktober Sprint 2026. Items marked Preview aren&apos;t production-ready yet.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-grid">
            <div>
              <Link className="logo" href="/" aria-label="VifeMS home">
                <VifeMSLogo theme="light" size="sm" />
              </Link>
              <p className="tag-line">Business operations, built around you.</p>
            </div>

            <nav aria-label="Footer">
              <h4>Explore</h4>
              <ul>
                <li><a href="#how">How It Works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#use-cases">Use Cases</a></li>
                <li><a href="#tra-sync">Tra-Sync</a></li>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/signup">Build My Workspace</Link></li>
              </ul>
            </nav>
          </div>
          <p className="copy">© 2026 VifeMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
