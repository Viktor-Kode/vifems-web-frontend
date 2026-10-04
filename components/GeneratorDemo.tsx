"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Check } from "@/components/Icons";
import { BusinessExample } from "./BusinessTypes";

const DEFAULT_MODULES = ["Customers", "Orders", "Products", "Services", "Payments"];
const DEFAULT_PROMPT = "Describe what your business does, what services you offer, and what you need to track day to day...";

interface GeneratorDemoProps {
  selectedExample: BusinessExample | null;
}

export function GeneratorDemo({ selectedExample }: GeneratorDemoProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>(
    selectedExample ? selectedExample.modules : DEFAULT_MODULES
  );
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [generatedSuccess, setGeneratedSuccess] = useState(true);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");

  // IntersectionObserver to detect when user scrolls down to this section
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Typing effect triggered on scroll into view or template change
  useEffect(() => {
    setActiveModules(selectedExample ? selectedExample.modules : DEFAULT_MODULES);
    setSelectedModules({});
    setGeneratedSuccess(true);

    if (!hasEnteredView) return;

    const targetText = selectedExample ? selectedExample.prompt : DEFAULT_PROMPT;
    let charIndex = 0;
    setDisplayedPlaceholder("");

    const interval = setInterval(() => {
      if (charIndex < targetText.length) {
        setDisplayedPlaceholder(targetText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [selectedExample, hasEnteredView]);

  const handleToggleModule = (moduleName: string) => {
    setSelectedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedSuccess(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
    }, 850);
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-10 shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Tell VifeMS about your business
        </h3>

        <div className="relative mb-6">
          <textarea
            readOnly
            rows={3}
            className="w-full p-4 text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none cursor-not-allowed resize-none font-sans placeholder:text-slate-500"
            placeholder={displayedPlaceholder || (hasEnteredView ? (selectedExample?.prompt || DEFAULT_PROMPT) : "")}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-3 sm:mt-0 sm:absolute sm:right-3 sm:bottom-4 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow transition-all disabled:opacity-75 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                Generate <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Generated System Preview */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900">
              Your Management System
            </span>
            {generatedSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </div>

          {isGenerating ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-500">
              <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Analyzing domain & provisioning modules...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {activeModules.map((moduleName) => {
                const isChecked = !!selectedModules[moduleName];
                return (
                  <div
                    key={moduleName}
                    onClick={() => handleToggleModule(moduleName)}
                    className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${
                      isChecked
                        ? "bg-white border-slate-900 shadow-sm ring-1 ring-slate-900/10"
                        : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Checkbox Indicator */}
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>

                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {moduleName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
