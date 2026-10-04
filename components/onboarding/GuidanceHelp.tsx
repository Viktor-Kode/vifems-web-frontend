"use client";

import React, { useState } from "react";

interface GuidanceHelpProps {
  onSelectSamplePrompt?: (prompt: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: "Custom Cake Bakery",
    prompt:
      "I run a custom cake bakery. Customers place orders for different types of cakes, and I need to track customers, cake designs, ingredients, payments, delivery dates, and order status.",
  },
  {
    title: "Auto Repair Workshop",
    prompt:
      "I own an auto repair shop. Customers bring vehicles in for diagnostic checks, routine maintenance, and repair jobs. I need to track customers, vehicle models, spare parts inventory, repair jobs, and invoices.",
  },
  {
    title: "Property Management",
    prompt:
      "I manage residential properties. Tenants lease apartments, submit maintenance requests, and pay monthly rent. I need to track properties, tenants, repair tickets, lease dates, and payment history.",
  },
  {
    title: "Creative Agency",
    prompt:
      "We are a digital design agency. Clients hire us for branding and software projects. We need to track client accounts, active projects, team task deadlines, deliverables, and billing status.",
  },
];

export default function GuidanceHelp({ onSelectSamplePrompt }: GuidanceHelpProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-6 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
            💡
          </div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide">
            Helpful Contextual Guidance
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isOpen ? "Hide tips" : "Show tips"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Provide light prompts in natural plain language. Include details such as:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold">•</span>
              <span>What products or services you sell or manage</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-indigo-400 font-bold">•</span>
              <span>Key information you need to track daily</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-cyan-400 font-bold">•</span>
              <span>How your team communicates or moves work</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-bold">•</span>
              <span>Repetitive tasks or paperwork you want to organize</span>
            </li>
          </ul>

          {onSelectSamplePrompt && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Click to try a sample description:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSamplePrompt(sample.prompt)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer hover:border-slate-500"
                  >
                    ✨ {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
