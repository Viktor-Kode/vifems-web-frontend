"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Sparkles, ArrowRight } from "@/components/Icons";

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100/70 border-t border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div
          className={`mb-16 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-2xs text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            From your idea to a working workspace
          </h2>
          <p className="text-slate-600 text-lg mt-3 max-w-2xl">
            A simple 3-step transformation from plain English into a fully operational business management system.
          </p>
        </div>

        {/* 3 Step Cards Grid with Staggered Entry Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <div
            className={`bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-700 transform ease-out group hover:-translate-y-1.5 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                01
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Step One
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
              Tell VifeMS about your business
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Describe what your business does, what services you offer, and what you need to track day to day in natural language.
            </p>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              <span>Natural language prompt</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 02 */}
          <div
            className={`bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-700 transform ease-out group hover:-translate-y-1.5 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                02
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Step Two
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
              Review the system VifeAI recommends
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              VifeAI constructs customized business entities, field structures, and relationships tailored precisely to your operations.
            </p>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              <span>Dynamic AI Blueprint</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 03 */}
          <div
            className={`bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-700 transform ease-out group hover:-translate-y-1.5 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "450ms" }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                03
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Step Three
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
              Start using your new workspace
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Confirm your workspace blueprint and immediately start managing records, tracking metrics, and performing CRUD actions.
            </p>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              <span>Ready for operations</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Feature Highlights Cards Grid with Staggered Fade */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-slate-800" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              No technical setup
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-slate-800" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              Built around the way your business actually operates
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-slate-800" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              Change your workspace as your business changes
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-slate-800" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              Your business data stays inside your workspace
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
