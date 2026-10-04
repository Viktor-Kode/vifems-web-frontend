"use client";

import React, { useState } from "react";
import GuidanceHelp from "./GuidanceHelp";

interface BusinessDescriptionStepProps {
  initialDescription: string;
  onSubmit: (description: string) => void;
  error?: string | null;
}

const MIN_CHARS = 50;
const MAX_CHARS = 5000;

export default function BusinessDescriptionStep({
  initialDescription,
  onSubmit,
  error,
}: BusinessDescriptionStepProps) {
  const [description, setDescription] = useState(initialDescription || "");
  const charCount = description.length;
  const isMinMet = charCount >= MIN_CHARS;
  const isMaxExceeded = charCount > MAX_CHARS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMinMet || isMaxExceeded) return;
    onSubmit(description.trim());
  };

  const handleSelectSample = (samplePrompt: string) => {
    setDescription(samplePrompt);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Step 1 of 3 • Business Prompt
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tell VifeMS about your business
        </h1>
        <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Describe what your business does and how you manage it. VifeAI will use this to design your workspace.
        </p>
      </div>

      {/* Error banner if previous attempt failed */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
          <span className="text-red-400 text-base font-bold">⚠️</span>
          <div>
            <p className="font-semibold text-red-200">AI Blueprint Generation Issue</p>
            <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1">
          <textarea
            rows={7}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="&quot;I run a custom cake bakery. Customers place orders for different types of cakes, and I need to track customers, cake designs, ingredients, payments, delivery dates, and order status.&quot;"
            className="w-full bg-transparent p-5 text-slate-100 placeholder:text-slate-500 text-sm leading-relaxed focus:outline-none resize-y min-h-[160px]"
          />

          {/* Character counter & min warning */}
          <div className="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-xs bg-slate-950/40 rounded-b-xl">
            <div>
              {!isMinMet && charCount > 0 ? (
                <span className="text-amber-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Need {MIN_CHARS - charCount} more characters for accuracy
                </span>
              ) : isMinMet ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Ready for AI Generation
                </span>
              ) : (
                <span className="text-slate-500">Minimum {MIN_CHARS} characters</span>
              )}
            </div>

            <div className="font-mono text-slate-400">
              <span className={charCount > MAX_CHARS ? "text-red-400 font-bold" : ""}>
                {charCount}
              </span>
              <span className="text-slate-600"> / {MAX_CHARS}</span>
            </div>
          </div>
        </div>

        {/* Guidance Help Section */}
        <GuidanceHelp onSelectSamplePrompt={handleSelectSample} />

        {/* Submit Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!isMinMet || isMaxExceeded}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <span>Generate Workspace Blueprint</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
