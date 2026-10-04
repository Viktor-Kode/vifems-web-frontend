"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2 } from "@/components/Icons";

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
    <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Contextual Guidance & Tips
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {isOpen ? "Hide tips" : "Show tips"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Describe your business operations in natural plain language. Include details such as:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>What products or services you sell or manage</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>Key information you need to track daily</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>How your team communicates or moves work</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>Repetitive tasks or paperwork you want to organize</span>
            </li>
          </ul>

          {onSelectSamplePrompt && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Sample Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSamplePrompt(sample.prompt)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-slate-600" />
                    <span>{sample.title}</span>
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
