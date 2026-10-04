"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2 } from "@/components/Icons";

export default function GuidanceHelp() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Contextual Guidance & Prompt Tips
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
        </div>
      )}
    </div>
  );
}
