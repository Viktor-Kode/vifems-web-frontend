"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [loaderPct, setLoaderPct] = useState("000");

  useEffect(() => {
    let gsapInstance: any = null;
    let ScrollTriggerInstance: any = null;
    let lenisInstance: any = null;
    let isCleanedUp = false;

    // Loader percentage simulation
    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(100, pct + Math.ceil(Math.random() * 9));
      setLoaderPct(("000" + pct).slice(-3));
      if (pct >= 100) clearInterval(interval);
    }, 90);

    const initAnimation = async () => {
      try {
        const gsapModule = await import("gsap");
        const stModule = await import("gsap/ScrollTrigger");
        const lenisModule = await import("lenis");

        if (isCleanedUp) return;

        gsapInstance = gsapModule.gsap || gsapModule.default;
        ScrollTriggerInstance = stModule.ScrollTrigger || stModule.default;
        const Lenis = lenisModule.default || lenisModule;

        gsapInstance.registerPlugin(ScrollTriggerInstance);
        ScrollTriggerInstance.config({ ignoreMobileResize: true, autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize" });

        const isTouchOrIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
          window.matchMedia("(pointer: coarse)").matches;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const animate = !reduce;
        const root = document.documentElement;
        if (!animate) root.classList.add("static");

        // Lenis Smooth Scroll only for desktop/pointer-fine devices to avoid iOS WebKit scroll locks
        if (animate && Lenis && !isTouchOrIOS) {
          lenisInstance = new Lenis({
            duration: 1.15,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
          });
          lenisInstance.on("scroll", ScrollTriggerInstance.update);
          gsapInstance.ticker.add((t: number) => {
            if (lenisInstance) lenisInstance.raf(t * 1000);
          });
          gsapInstance.ticker.lagSmoothing(0);
        }

        const $ = (s: string, c?: Element | Document) => (c || document).querySelector(s);
        const $$ = (s: string, c?: Element | Document) =>
          Array.prototype.slice.call((c || document).querySelectorAll(s));

        // Nav show/hide & solid state
        const top_ = $("#top");
        let lastY = 0;
        const onScrollNav = () => {
          const y = window.scrollY;
          if (top_) {
            top_.classList.toggle("solid", y > 40);
            if (y > lastY + 6 && y > 200) top_.classList.add("hide");
            else if (y < lastY - 6 || y < 200) top_.classList.remove("hide");
          }
          lastY = y;
        };
        window.addEventListener("scroll", onScrollNav, { passive: true });

        // Cursor ring
          const ring = $("#ring") as HTMLElement | null;
        if (ring && window.matchMedia("(pointer:fine)").matches) {
          let x = 0, y = 0, tx = 0, ty = 0;
          const onMouseMove = (e: MouseEvent) => {
            tx = e.clientX;
            ty = e.clientY;
            ring.classList.add("on");
          };
          const onMouseLeave = () => ring.classList.remove("on");
          window.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseleave", onMouseLeave);

          let rafId = requestAnimationFrame(function loop() {
            x += (tx - x) * 0.18;
            y += (ty - y) * 0.18;
            ring.style.transform = `translate(${x}px,${y}px)`;
            rafId = requestAnimationFrame(loop);
          });

          const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            ring.classList.toggle(
              "big",
              !!target?.closest("a,button,.card,.uc,.orb,.iorb")
            );
          };
          document.addEventListener("mouseover", onMouseOver);
        }

        // Spotlight effect on cards
        $$(".card").forEach((c: HTMLElement) => {
          c.addEventListener("mousemove", (e: MouseEvent) => {
            const r = c.getBoundingClientRect();
            c.style.setProperty("--mx", e.clientX - r.left + "px");
            c.style.setProperty("--my", e.clientY - r.top + "px");
          });
        });

        // FAQ accordion
        $$(".qi").forEach((item: HTMLElement) => {
          const q = $(".q", item);
          if (q) {
            q.addEventListener("click", () => {
              const open = item.classList.contains("open");
              $$(".qi.open").forEach((o: HTMLElement) => {
                o.classList.remove("open");
                $(".q", o)?.setAttribute("aria-expanded", "false");
              });
              if (!open) {
                item.classList.add("open");
                q.setAttribute("aria-expanded", "true");
              }
              setTimeout(() => {
                ScrollTriggerInstance.refresh();
              }, 620);
            });
          }
        });

        // Orbit Setup
        const peopleData = [
          { sym: "p1", label: "Shop owner", ang: -160, r: 1.05 },
          { sym: "p2", label: "Attendant", ang: -125, r: 1.0 },
          { sym: "p3", label: "Customer", ang: -52, r: 1.0 },
          { sym: "p4", label: "Supplier", ang: -18, r: 1.12 },
          { sym: "p5", label: "Courier", ang: 18, r: 1.02 },
          { sym: "p6", label: "Manager", ang: 52, r: 1.0 },
          { sym: "p7", label: "Accountant", ang: 140, r: 1.02 },
          { sym: "p8", label: "Cashier", ang: 172, r: 1.14 },
        ];
        const iconsData = [
          { sym: "i-pkg", ang: -158, r: 1.04 },
          { sym: "i-receipt", ang: -122, r: 1.0 },
          { sym: "i-card", ang: -55, r: 1.0 },
          { sym: "i-users", ang: -16, r: 1.1 },
          { sym: "i-grid", ang: 16, r: 1.04 },
          { sym: "i-chart", ang: 54, r: 1.0 },
          { sym: "i-truck", ang: 124, r: 1.0 },
          { sym: "i-shield", ang: 160, r: 1.08 },
        ];

        const orbitPeople = $("#orbitPeople");
        const orbitIcons = $("#orbitIcons");

        function placeOrbit(container: HTMLElement | null, data: any[], type: "p" | "i") {
          if (!container) return [];
          const els: any[] = [];
          data.forEach((d) => {
            const wrap = document.createElement("div");
            wrap.className = type === "p" ? "orb" : "iorb";
            const inner = document.createElement("div");
            inner.className = type === "p" ? "pp" : "ib";
            if (type === "p") {
              const lbl = document.createElement("span");
              lbl.className = "lbl";
              lbl.textContent = d.label;
              inner.style.overflow = "visible";
              inner.innerHTML = `<span style="display:block;width:100%;height:100%;border-radius:50%;overflow:hidden"><svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block"><use href="#${d.sym}"/></svg></span>`;
              inner.appendChild(lbl);
              wrap.appendChild(inner);
            } else {
              inner.innerHTML = `<svg class="ic"><use href="#${d.sym}"/></svg>`;
              wrap.appendChild(inner);
            }
            container.appendChild(wrap);
            gsapInstance.set(wrap, { xPercent: -50, yPercent: -50 });
            els.push({ el: wrap, inner, ang: d.ang, r: d.r, w: 60, h: 60, hidden: false });
          });
          return els;
        }

        const peopleEls = placeOrbit(orbitPeople as HTMLElement, peopleData, "p");
        const iconEls = placeOrbit(orbitIcons as HTMLElement, iconsData, "i");

        function measureText() {
          const textEl = $("#cineText") as HTMLElement | null;
          const title = $(".cine-title") as HTMLElement | null;
          let h = 0;
          if (textEl) {
            Array.prototype.forEach.call(textEl.children, (c: HTMLElement) => {
              const cs = getComputedStyle(c);
              h += c.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
            });
          }
          let w = 0;
          try {
            if (title) {
              const rg = document.createRange();
              rg.selectNodeContents(title);
              w = rg.getBoundingClientRect().width;
            }
          } catch (e) {}
          w = Math.max(w, Math.min(textEl?.offsetWidth || 0, 460));
          w = Math.min(w, textEl?.offsetWidth || w);
          return { w, h };
        }

        function layoutOrbit(els: any[], avoidW: number, avoidH: number, W: number, H: number, pad: number) {
          const placed: any[] = [];
          const narrow = W < 900;
          els.forEach((o) => {
            const hw = o.w / 2;
            const hh = o.h / 2;
            let found = false;
            const minX = -W / 2 + hw + 12;
            const maxX = W / 2 - hw - 12;
            const minY = -H / 2 + (narrow ? 80 : 92) + hh;
            const maxY = H / 2 - (narrow ? 56 : 76) - hh;
            const jit = [0, 10, -10, 20, -20, 32, -32, 46, -46];
            for (let s = 1; s <= 2.4 && !found; s += 0.07) {
              for (let j = 0; j < jit.length && !found; j++) {
                const a = ((o.ang + jit[j]) * Math.PI) / 180;
                const x = Math.cos(a) * (avoidW / 2 + pad + hw) * o.r * s;
                const y = Math.sin(a) * (avoidH / 2 + pad + hh) * o.r * s;
                if (x < minX || x > maxX || y < minY || y > maxY) continue;
                if (Math.abs(x) < avoidW / 2 + pad + hw && Math.abs(y) < avoidH / 2 + pad + hh) continue;
                const clash = placed.some(
                  (p) => Math.abs(p.x - x) < p.hw + hw + 14 && Math.abs(p.y - y) < p.hh + hh + 14
                );
                if (clash) continue;
                found = true;
                placed.push({ x, y, hw, hh });
                o.el.style.left = W / 2 + x + "px";
                o.el.style.top = H / 2 + y + "px";
              }
            }
            o.hidden = !found;
            o.el.style.display = found ? "" : "none";
          });
        }

        function layoutAll() {
          const pin = $("#cinePin") as HTMLElement | null;
          if (!pin) return;
          const W = pin.offsetWidth;
          const H = pin.offsetHeight;
          if (!W || !H) return;
          const narrow = W < 900;
          const tiny = W <= 520;
          const pSize = narrow ? 52 : 74;
          const iSize = narrow ? 44 : 56;
          const pad = narrow ? 16 : 44;

          peopleEls.forEach((o) => {
            o.w = Math.max(pSize, tiny ? pSize : pSize + 34);
            o.h = pSize + (tiny ? 0 : 34);
          });
          iconEls.forEach((o) => {
            o.w = iSize;
            o.h = iSize;
          });

          const t = measureText();
          const dash = $(".dash") as HTMLElement | null;
          const dw = dash ? dash.offsetWidth : 0;
          const dh = dash ? dash.offsetHeight : 0;

          layoutOrbit(peopleEls, t.w, t.h, W, H, pad);
          layoutOrbit(iconEls, Math.max(dw, 200), Math.max(dh, 200), W, H, pad);
        }

        if (animate) {
          layoutAll();
          window.addEventListener("resize", layoutAll);
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(layoutAll);
          }
        }

        function split(el: HTMLElement, mode: "mask" | "plain") {
          const out: HTMLElement[] = [];
          function walk(node: Node, cls: string) {
            Array.prototype.slice.call(node.childNodes).forEach((n: Node) => {
              if (n.nodeType === 3) {
                const frag = document.createDocumentFragment();
                (n.textContent || "").split(/(\s+)/).forEach((p) => {
                  if (!p) return;
                  if (/^\s+$/.test(p)) {
                    frag.appendChild(document.createTextNode(" "));
                    return;
                  }
                  const w = document.createElement("span");
                  w.className = mode === "mask" ? "w" : "sw";
                  const i = document.createElement("span");
                  i.className = "wi" + (cls ? " " + cls : "");
                  i.textContent = p;
                  w.appendChild(i);
                  frag.appendChild(w);
                  out.push(i);
                });
                n.parentNode?.replaceChild(frag, n);
              } else if (n.nodeType === 1 && (n as HTMLElement).tagName !== "BR") {
                const elem = n as HTMLElement;
                walk(n, ((cls ? cls + " " : "") + elem.className).trim());
                const kids = Array.prototype.slice.call(n.childNodes);
                kids.forEach((k) => n.parentNode?.insertBefore(k, n));
                n.parentNode?.removeChild(n);
              }
            });
          }
          walk(el, "");
          return out;
        }

        function intro() {
          if (!animate) return;
          const title = $(".cine-title") as HTMLElement | null;
          const titleWords = title ? split(title, "mask") : [];
          layoutAll();
          gsapInstance.set(titleWords, { yPercent: 118 });
          gsapInstance.set([".cine-text .eyebrow", ".cine-sub", ".cine-cta", ".cine-note"], {
            opacity: 0,
            y: 26,
          });
          const ppIn = peopleEls.map((o) => o.inner);
          gsapInstance.set(ppIn, { opacity: 0, scale: 0.4 });

          const tl = gsapInstance.timeline({ defaults: { ease: "power4.out" } });
          tl.to(".cine-text .eyebrow", { opacity: 1, y: 0, duration: 1 }, 0.2)
            .to(titleWords, { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0.3)
            .to([".cine-sub", ".cine-cta", ".cine-note"], { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.8)
            .to(ppIn, { opacity: 1, scale: 1, duration: 1.4, ease: "power3.out", stagger: { each: 0.08, from: "random" } }, 0.5);
        }

        // Hide Loader
        const loader = $("#loader");
        setTimeout(() => {
          if (loader) {
            gsapInstance.to(loader, {
              yPercent: -100,
              duration: 1.1,
              ease: "power4.inOut",
              onStart: intro,
              onComplete: () => setLoaderHidden(true),
            });
          } else {
            intro();
          }
        }, 1400);

        // Pinned Hero Animation
        function startCineScroll() {
          const cine = $("#cine");
          const textEl = $("#cineText");
          const dashEl = $("#cineDash");
          const scrollcue = $("#scrollcue");

          peopleEls.forEach((o) => {
            const a = (o.ang * Math.PI) / 180;
            o.flyX = Math.cos(a) * (220 + Math.random() * 140);
            o.flyY = Math.sin(a) * (160 + Math.random() * 120);
            o.rot = Math.random() * 40 - 20;
          });

          const cineTl = gsapInstance.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: cine,
              start: "top top",
              end: "+=150%",
              pin: "#cinePin",
              scrub: 0.6,
              anticipatePin: 1,
              refreshPriority: 3,
              invalidateOnRefresh: true,
            },
          });

          cineTl.fromTo(textEl, { opacity: 1, y: 0, scale: 1 }, { opacity: 0, y: -80, scale: 0.94, duration: 0.9 }, 0);
          cineTl.fromTo(scrollcue, { opacity: 1, y: 0 }, { opacity: 0, y: 20, duration: 0.4 }, 0);

          peopleEls.forEach((o, i) => {
            cineTl.fromTo(
              o.el,
              { opacity: 1, x: 0, y: 0, rotate: 0 },
              { opacity: 0, x: o.flyX, y: o.flyY, rotate: o.rot, duration: 0.9 },
              i * 0.015
            );
          });

          cineTl.fromTo(dashEl, { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, 0.45);

          iconEls.forEach((o, i) => {
            cineTl.fromTo(
              o.el,
              { opacity: 0, scale: 0.2, rotate: -25 },
              { opacity: 1, scale: 1, rotate: 0, duration: 1, ease: "power3.out" },
              0.6 + i * 0.025
            );
          });
          cineTl.to({}, { duration: 0.4 }, "+=0.1");

          const iconFloat: any[] = [];
          const peopleFloat: any[] = [];
          iconEls.forEach((o, i) => {
            iconFloat.push(
              gsapInstance.to(o.inner, {
                x: "+=" + Math.cos(i * 1.3) * 8,
                y: "+=" + Math.sin(i * 1.7) * 10,
                duration: 4 + i * 0.3,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                paused: true,
              })
            );
          });
          peopleEls.forEach((o, i) => {
            peopleFloat.push(
              gsapInstance.to(o.inner, {
                x: "+=" + Math.cos(i * 0.9) * 7,
                y: "+=" + Math.sin(i * 1.4) * 9,
                duration: 4.5 + i * 0.4,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              })
            );
          });

          ScrollTriggerInstance.create({
            trigger: cine,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self: any) => {
              const inS2 = self.progress > 0.55;
              const inS1 = self.progress < 0.35;
              iconFloat.forEach((t) => {
                if (inS2 && t.paused()) t.play();
                else if (!inS2 && !t.paused()) t.pause();
              });
              peopleFloat.forEach((t) => {
                if (inS1 && t.paused()) t.play();
                else if (!inS1 && !t.paused()) t.pause();
              });
            },
          });
        }

        // How it works
        function initHow() {
          const panels = $$(".panel");
          const nodes = $$(".st");
          gsapInstance.set(panels, { autoAlpha: 0, y: 50 });
          gsapInstance.set(panels[0], { autoAlpha: 1, y: 0 });

          function setHow(i: number) {
            nodes.forEach((n: HTMLElement, k: number) => {
              n.classList.toggle("on", k <= i);
              n.classList.toggle("cur", k === i);
            });
          }
          setHow(0);

          const howTl = gsapInstance.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".how-pin",
              start: "top top",
              end: "+=340%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              refreshPriority: 2,
              onUpdate: (s: any) => {
                setHow(Math.min(3, Math.floor(s.progress * 4)));
              },
            },
          });

          howTl.to("#railFill", { width: "75%", duration: 3 }, 0);
          for (let i = 1; i < 4; i++) {
            howTl
              .to(panels[i - 1], { autoAlpha: 0, y: -50, duration: 0.35 }, i - 0.32)
              .fromTo(panels[i], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.35 }, i - 0.08);
          }
          howTl.to({}, { duration: 0.6 }, 3.4);
        }

        // TraSync
        function initTraSync() {
          if (!$("#tsStage")) return;
          const s1 = $("#tsS1");
          const s2 = $("#tsS2");
          const s3 = $("#tsS3");
          const typeAmt = $("#typeAmt");
          const progs = $$("#tsProgress span");
          const keys = $$("#tsS1 .key");
          const okKey = $("#tsS1 .key.ok");
          const keyBy: Record<string, HTMLElement> = {};
          keys.forEach((k: HTMLElement) => {
            keyBy[k.textContent?.trim() || ""] = k;
          });
          const digits = "22500";
          const fmt = (d: string) => d.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          let typed = -1;
          let lastStep = -1;
          let lastOk: boolean | null = null;
          const state = { p: 0 };

          function render() {
            const p = state.p;
            const n = Math.round(Math.min(1, p / 0.34) * digits.length);
            if (n !== typed && typeAmt) {
              typed = n;
              typeAmt.textContent = n ? fmt(digits.slice(0, n)) : "0";
              keys.forEach((k: HTMLElement) => k.classList.remove("press"));
              if (n > 0 && p < 0.34 + 0.001 && n <= digits.length) {
                const k = keyBy[digits.charAt(n - 1)];
                if (k && p < 0.34) k.classList.add("press");
              }
            }
            const sendOn = p >= 0.34 && p < 0.43;
            if (sendOn !== lastOk && okKey) {
              lastOk = sendOn;
              okKey.classList.toggle("press", sendOn);
              if (sendOn) {
                keys.forEach((k: HTMLElement) => {
                  if (k !== okKey) k.classList.remove("press");
                });
              }
            }
            const step = p < 0.43 ? 0 : p < 0.7 ? 1 : 2;
            if (step !== lastStep) {
              lastStep = step;
              progs.forEach((el: HTMLElement, i: number) => {
                el.classList.toggle("on", i === step);
              });
            }
          }

          gsapInstance.set(s1, { opacity: 1, y: 0, scale: 1 });
          gsapInstance.set([s2, s3], { opacity: 0, y: 40, scale: 0.96 });

          const tl = gsapInstance.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: "#trasync",
              start: "top top",
              end: "+=240%",
              pin: ".ts-pin",
              scrub: 0.5,
              anticipatePin: 1,
              refreshPriority: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(state, { p: 1, duration: 1, onUpdate: render }, 0);
          tl.to(s1, { opacity: 0, y: -36, scale: 0.96, duration: 0.06 }, 0.4);
          tl.fromTo(s2, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.06, immediateRender: false }, 0.47);
          tl.to(s2, { opacity: 0, y: -36, scale: 0.96, duration: 0.06 }, 0.68);
          tl.fromTo(s3, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.06, immediateRender: false }, 0.75);

          render();
        }

        if (animate) {
          startCineScroll();
          initHow();
          initTraSync();

          ScrollTriggerInstance.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (s: any) => {
              gsapInstance.set("#progress", { scaleX: s.progress });
            },
          });

          gsapInstance
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.6,
              },
            })
            .fromTo(".b1", { x: "78vw", y: "4vh" }, { x: "12vw", y: "92vh" }, 0)
            .fromTo(".b2", { x: "8vw", y: "86vh" }, { x: "86vw", y: "12vh" }, 0)
            .fromTo(".b3", { x: "48vw", y: "-10vh" }, { x: "40vw", y: "104vh" }, 0)
            .fromTo("#bg .grid", { backgroundPosition: "0px 0px" }, { backgroundPosition: "0px -900px" }, 0);

          const r1 = $(".band .r1") as HTMLElement | null;
          const r2 = $(".band .r2") as HTMLElement | null;
          if (r1) {
            gsapInstance.fromTo(
              r1,
              { x: "4vw" },
              {
                x: () => -(r1.scrollWidth - window.innerWidth * 0.7),
                ease: "none",
                scrollTrigger: {
                  trigger: ".band",
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              }
            );
          }
          if (r2) {
            gsapInstance.fromTo(
              r2,
              { x: () => -(r2.scrollWidth - window.innerWidth * 0.9) },
              {
                x: "0vw",
                ease: "none",
                scrollTrigger: {
                  trigger: ".band",
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          $$("[data-split]").forEach((h: HTMLElement) => {
            const ws = split(h, "mask");
            gsapInstance.from(ws, {
              yPercent: 118,
              duration: 1.25,
              ease: "power4.out",
              stagger: 0.045,
              scrollTrigger: {
                trigger: h,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            });
          });

          $$("[data-scrub]").forEach((h: HTMLElement) => {
            const ws = split(h, "plain");
            gsapInstance.fromTo(
              ws,
              { opacity: 0.14 },
              {
                opacity: 1,
                stagger: 0.12,
                ease: "none",
                scrollTrigger: {
                  trigger: h,
                  start: "top 82%",
                  end: "bottom 48%",
                  scrub: true,
                },
              }
            );
          });

          $$("[data-reveal]").forEach((el: HTMLElement) => {
            if (window.innerWidth < 768) {
              gsapInstance.set(el, { opacity: 1, y: 0, clearProps: "transform" });
              return;
            }
            gsapInstance.from(el, {
              y: 40,
              opacity: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            });
          });

          $$("[data-speed]").forEach((el: HTMLElement) => {
            const s = parseFloat(el.dataset.speed || "0") * 260;
            gsapInstance.fromTo(
              el,
              { y: s },
              {
                y: -s,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          });

          $$(".pline").forEach((l: HTMLElement, i: number) => {
            gsapInstance.from(l, {
              scaleX: 0,
              duration: 1.4,
              ease: "power3.out",
              delay: i * 0.1,
              scrollTrigger: {
                trigger: l,
                start: "top 92%",
                toggleActions: "play none none reverse",
              },
            });
          });

          gsapInstance.from("#fgrid .card", {
            y: 90,
            opacity: 0,
            scale: 0.95,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: "#fgrid",
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          });

          gsapInstance.fromTo(
            "#shop",
            { clipPath: "inset(16% 14% 16% 14% round 56px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 28px)",
              ease: "none",
              scrollTrigger: {
                trigger: "#shop",
                start: "top 98%",
                end: "top 22%",
                scrub: true,
              },
            }
          );
          gsapInstance.fromTo(
            "#shopBack",
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: { trigger: "#shop", start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsapInstance.fromTo(
            "#shopFront",
            { yPercent: -16 },
            {
              yPercent: 16,
              ease: "none",
              scrollTrigger: { trigger: "#shop", start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsapInstance.fromTo(
            ".fchip.a",
            { y: 60 },
            {
              y: -60,
              ease: "none",
              scrollTrigger: { trigger: "#shop", start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsapInstance.fromTo(
            ".fchip.b",
            { y: 90 },
            {
              y: -90,
              ease: "none",
              scrollTrigger: { trigger: "#shop", start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsapInstance.from("#ucs .uc", {
            y: 70,
            opacity: 0,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: "#ucs",
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });

          gsapInstance
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: "#vsGrid",
                start: "top 78%",
                end: "bottom 45%",
                scrub: true,
              },
            })
            .fromTo(".vs-old", { opacity: 1, scale: 1 }, { opacity: 0.42, scale: 0.96 }, 0)
            .fromTo(".vs-new", { scale: 0.97, y: 30 }, { scale: 1.015, y: -10 }, 0)
            .from(".vs-new li", { opacity: 0.25, x: -18, stagger: 0.18 }, 0);

          gsapInstance.from("#srows .srow", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.14,
            scrollTrigger: {
              trigger: "#srows",
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          });
          gsapInstance.from(".shield", {
            scale: 0.7,
            opacity: 0,
            rotate: -20,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".shield",
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });

          gsapInstance.fromTo(
            "#ctaBox",
            { scale: 0.93, y: 60 },
            {
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: "#ctaBox",
                start: "top 98%",
                end: "top 40%",
                scrub: true,
              },
            }
          );
          gsapInstance.set(".branch path", { strokeDasharray: 1, strokeDashoffset: 1 });
          gsapInstance
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: "#ctaBox",
                start: "top 75%",
                end: "bottom 70%",
                scrub: true,
              },
            })
            .to("#brIn path", { strokeDashoffset: 0, stagger: 0.08, duration: 0.6 }, 0)
            .to("#brOut path", { strokeDashoffset: 0, stagger: 0.08, duration: 0.6 }, 0.5);

          gsapInstance.from("#faqList .qi", {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: {
              trigger: "#faqList",
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
          gsapInstance.fromTo(
            "#wordmark",
            { yPercent: 38, opacity: 0.2 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: "footer",
                start: "top 90%",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );

          const T = [
            { bg: "255,255,255", b1: "37,99,235", b2: "6,182,212", b3: "29,78,216" },
            { bg: "249,250,253", b1: "79,70,229", b2: "37,99,235", b3: "30,41,120" },
            { bg: "253,254,255", b1: "37,99,235", b2: "6,182,212", b3: "56,189,248" },
            { bg: "249,251,255", b1: "99,102,241", b2: "37,99,235", b3: "6,182,212" },
            { bg: "245,252,255", b1: "6,182,212", b2: "20,184,166", b3: "37,99,235" },
            { bg: "253,251,248", b1: "217,119,6", b2: "37,99,235", b3: "120,53,15" },
            { bg: "249,250,255", b1: "37,99,235", b2: "29,78,216", b3: "6,182,212" },
            { bg: "245,251,255", b1: "6,182,212", b2: "37,99,235", b3: "14,116,144" },
            { bg: "247,250,255", b1: "37,99,235", b2: "99,102,241", b3: "6,182,212" },
            { bg: "255,255,255", b1: "37,99,235", b2: "6,182,212", b3: "29,78,216" },
          ];
          const rgb = (s: string) => "rgb(" + s + ")";
          const vars = (t: any) => ({
            "--bgc": rgb(t.bg),
            "--b1": rgb(t.b1),
            "--b2": rgb(t.b2),
            "--b3": rgb(t.b3),
          });

          gsapInstance.set(root, vars(T[0]));
          let prev = 0;
          $$("[data-theme]").forEach((sec: HTMLElement, k: number) => {
            const i = +(sec.dataset.theme || 0);
            if (k > 0 && i !== prev) {
              gsapInstance.fromTo(
                root,
                vars(T[prev]),
                Object.assign({}, vars(T[i]), {
                  ease: "none",
                  immediateRender: false,
                  scrollTrigger: {
                    trigger: sec,
                    start: "top 88%",
                    end: "top 22%",
                    scrub: true,
                  },
                })
              );
            }
            prev = i;
          });

          const dotLinks = $$("#dots a");
          const setDot = (id: string) => {
            dotLinks.forEach((d: HTMLElement) => {
              d.classList.toggle("on", d.getAttribute("href") === "#" + id);
            });
          };

          ["cine", "problem", "how", "features", "trasync", "usecases", "why", "security"].forEach((id) => {
            ScrollTriggerInstance.create({
              trigger: "#" + id,
              start: "top 55%",
              end: "bottom 55%",
              onToggle: (s: any) => {
                if (s.isActive) setDot(id);
              },
            });
          });

          ScrollTriggerInstance.refresh();
          if (isTouchOrIOS) {
            setTimeout(() => {
              ScrollTriggerInstance.refresh();
            }, 500);
          }
        }

        // Shop procedural background
        function rnd(seed: number) {
          let s = seed;
          return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
          };
        }
        function scene(seed: number, rows: number, blur: number, dark: boolean) {
          const r = rnd(seed);
          const W = 1400;
          const H = 800;
          let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;
          svg += `<defs><linearGradient id="wl${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5F2ED"/><stop offset="1" stop-color="#EDE8E0"/></linearGradient><filter id="bl${seed}"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`;
          if (!dark)
            svg += `<rect width="${W}" height="${H}" fill="url(#wl${seed})"/><radialGradient id="gl${seed}" cx=".7" cy=".3" r=".7"><stop offset="0" stop-color="#f59e0b" stop-opacity=".15"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient><rect width="${W}" height="${H}" fill="url(#gl${seed})"/>`;
          svg += `<g filter="url(#bl${seed})">`;
          const cols = ["#c8a06a", "#e4cfa3", "#9c6b3c", "#b88a55", "#efe3c8", "#7a4e2a", "#d9b27a"];
          for (let i = 0; i < rows; i++) {
            let y = (H / (rows + 0.4)) * (i + 1) + (dark ? 40 : 0);
            let x = -20 + r() * 40;
            while (x < W + 40) {
              const w = (dark ? 90 : 46) + r() * (dark ? 120 : 60);
              const h = (dark ? 150 : 70) + r() * (dark ? 170 : 90);
              const c = cols[Math.floor(r() * cols.length)];
              const t = r();
              if (t < 0.55) {
                svg += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="${w * 0.14}" fill="${c}" opacity="${dark ? 0.9 : 0.85}"/>`;
                if (!dark)
                  svg += `<rect x="${x + w * 0.14}" y="${y - h * 0.62}" width="${w * 0.72}" height="${h * 0.32}" rx="3" fill="#2a1a0e" opacity=".25"/>`;
              } else if (t < 0.85) {
                svg += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="${w * 0.3}" fill="${c}" opacity=".8"/><rect x="${x + w * 0.22}" y="${y - h - 10}" width="${w * 0.56}" height="12" rx="3" fill="#5a3a1c"/>`;
              } else {
                svg += `<path d="M${x} ${y} L${x + w * 0.1} ${y - h * 0.85} L${x + w * 0.9} ${y - h * 0.85} L${x + w} ${y} Z" fill="${c}" opacity=".85"/>`;
              }
              x += w + (dark ? 60 : 14) + r() * (dark ? 120 : 30);
            }
            if (!dark)
              svg += `<rect x="0" y="${y}" width="${W}" height="14" fill="#c8b89e"/><rect x="0" y="${y + 14}" width="${W}" height="10" fill="#000" opacity=".12"/>`;
          }
          svg += "</g></svg>";
          return svg;
        }

        const b = $("#shopBack");
        const f = $("#shopFront");
        if (b) b.innerHTML = scene(7, 4, 0.6, false);
        if (f) {
          f.innerHTML = scene(19, 1, 14, true);
          (f as HTMLElement).style.opacity = ".35";
        }
      } catch (err) {
        console.error("Animation init error", err);
      }
    };

    initAnimation();

    return () => {
      isCleanedUp = true;
      clearInterval(interval);
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      if (ScrollTriggerInstance) {
        ScrollTriggerInstance.getAll().forEach((t: any) => t.kill());
      }
    };
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

      {/* Loader */}
      {!loaderHidden && (
        <div id="loader" aria-hidden="true">
          <div className="lc">
            <span className="logo">
              <b>VifeMS</b>
            </span>
            <div className="bar">
              <i />
            </div>
            <div className="pct" id="pct">
              {loaderPct}
            </div>
          </div>
        </div>
      )}

      <div id="progress" />
      <div id="bg">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="grid" />
        <div className="grain" />
      </div>
      <div className="ring" id="ring" />

      {/* Top Navbar */}
      <header id="top">
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
            <li>
              <a href="#trasync">Tra-Sync</a>
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
        <a href="#trasync" onClick={closeMenu}>
          Tra-Sync
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
        <a href="#trasync" data-l="Tra-Sync" aria-label="Tra-Sync" />
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

            {/* orbiting people + icons */}
            <div className="orbit" id="orbitPeople" aria-hidden="true" />
            <div className="orbit" id="orbitIcons" aria-hidden="true" />

            <div className="scrollcue" id="scrollcue">
              <span>Scroll</span>
              <i />
            </div>
          </div>
        </section>

        {/* ============ BAND ============ */}
        <section className="band" aria-hidden="true">
          <div className="row r1">
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
          </div>
          <div className="row r2">
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
              <div className="rail" id="rail">
                <div className="fill" id="railFill" />
                <div className="st">
                  <b>1</b>
                  <span>Describe</span>
                </div>
                <div className="st">
                  <b>2</b>
                  <span>Generate</span>
                </div>
                <div className="st">
                  <b>3</b>
                  <span>Provision</span>
                </div>
                <div className="st">
                  <b>4</b>
                  <span>Manage</span>
                </div>
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

        {/* ============ TRA-SYNC (3-scene story) ============ */}
        <section id="trasync" data-theme="4">
          <div className="ts-pin">
            <div className="wrap">
              <div className="ts-grid">
                <div className="ts-copy">
                  <div className="tag2">
                    <span className="eyebrow">Introducing Tra-Sync</span>
                    <span className="preview-badge">Preview</span>
                  </div>
                  <h2 className="display" data-split>
                    Watch a sale verify itself.
                  </h2>
                  <p className="l" data-reveal>
                    Attendant enters the price. Customer pays by transfer. Tra-Sync confirms it. Sale, stock and record —
                    updated automatically.
                  </p>
                  <div className="ts-pills" data-reveal>
                    <span className="ts-pill">
                      <svg className="ic">
                        <use href="#i-phone" />
                      </svg>
                      No POS needed
                    </span>
                    <span className="ts-pill">
                      <svg className="ic">
                        <use href="#i-shield" />
                      </svg>
                      Server-verified
                    </span>
                    <span className="ts-pill">
                      <svg className="ic">
                        <use href="#i-check" />
                      </svg>
                      Auto-recorded
                    </span>
                  </div>
                  <div className="ts-progress" id="tsProgress">
                    <span data-step="0" className="on">
                      1 · Enter
                    </span>
                    <span data-step="1">2 · Awaiting</span>
                    <span data-step="2" className="ok">
                      3 · Verified
                    </span>
                  </div>
                </div>

                <div className="ts-stage" id="tsStage">
                  {/* SCENE 1: attendant typing 22,500 */}
                  <div className="ts-scene ts-s1" id="tsS1">
                    <div className="top">
                      <span className="tag-blue">
                        <i />
                        New sale · attendant
                      </span>
                      <span className="brand">Tra-Sync</span>
                    </div>
                    <div className="who">
                      <span className="av">
                        <svg viewBox="0 0 100 100">
                          <use href="#p2" />
                        </svg>
                      </span>
                      <div className="meta">
                        <small>Entered by</small>
                        <b>Ada · Attendant</b>
                      </div>
                    </div>
                    <div className="display-amt">
                      <div className="cur">₦</div>
                      <div className="val">
                        <span id="typeAmt">0</span>
                        <span className="caret" />
                      </div>
                    </div>
                    <div className="keypad" aria-hidden="true">
                      <div className="key">1</div>
                      <div className="key">2</div>
                      <div className="key">3</div>
                      <div className="key">4</div>
                      <div className="key">5</div>
                      <div className="key">6</div>
                      <div className="key">7</div>
                      <div className="key">8</div>
                      <div className="key">9</div>
                      <div className="key op">.</div>
                      <div className="key">0</div>
                      <div className="key ok">↵</div>
                    </div>
                    <div className="hint">
                      <i />
                      Type the amount · then send
                    </div>
                  </div>

                  {/* SCENE 2: awaiting payment */}
                  <div className="ts-scene ts-s2" id="tsS2">
                    <div className="top">
                      <span className="tag-amber">
                        <i />
                        Awaiting payment
                      </span>
                      <span className="brand">Tra-Sync</span>
                    </div>
                    <div className="amt-wrap">
                      <div className="amt-label">Bank transfer</div>
                      <div className="amt-big">
                        <small>₦</small>22,500
                      </div>
                      <div className="sale-id">Sale · S-0043</div>
                    </div>
                    <div className="status-row">
                      <div className="status">
                        <span className="spinner" />
                        Waiting for payment
                      </div>
                    </div>
                  </div>

                  {/* SCENE 3: verified */}
                  <div className="ts-scene ts-s3" id="tsS3">
                    <div className="top">
                      <span className="tag-green">
                        <i />
                        Payment verified
                      </span>
                      <span className="brand">Tra-Sync</span>
                    </div>
                    <div className="check-wrap">
                      <div className="check-big">
                        <svg viewBox="0 0 24 24">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </div>
                      <div className="ok-label">Verified</div>
                      <div className="ok-amt">
                        <small>₦</small>22,500
                      </div>
                      {/* User requirement: "No POS Machine  needed. Just a phone." */}
                      <div className="ok-tagline">"No POS Machine  needed. Just a phone."</div>
                    </div>
                    <div className="status-row">
                      <div className="status">
                        <svg className="ic">
                          <use href="#i-check" />
                        </svg>
                        Sale · stock · record updated
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="ts-foot" data-reveal>
                <svg className="ic">
                  <use href="#i-lock" />
                </svg>
                Preview only. Sample data. Only server-side provider verification marks a sale paid.
              </p>
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a1">
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a2">
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a3">
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a4">
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a5">
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a6">
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
              <div className="qi">
                <button className="q" aria-expanded="false" aria-controls="a7">
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
                <a href="#trasync">Tra-Sync</a>
                <Link href="/login">Sign In</Link>
                <Link href="/onboarding">Build My Workspace</Link>
              </div>
            </div>
          </div>
          <div className="f-bot">© 2026 VifeMS. All rights reserved.</div>
        </div>
        <div className="wordmark" id="wordmark" aria-hidden="true">
          VifeMS
        </div>
      </footer>
    </div>
  );
}
