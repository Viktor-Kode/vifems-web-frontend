"use client";

import React, { useEffect, useState } from "react";

interface AIProcessingStateProps {
  onComplete: () => void;
}

const MILESTONES = [
  "Understanding your business structure...",
  "Identifying the information you need to manage...",
  "Designing your dynamic workspace blueprint...",
  "Preparing schema and relationships...",
];

export default function AIProcessingState({ onComplete }: AIProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < MILESTONES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => onComplete(), 600);
          return prev;
        }
      });
    }, 900);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPct = Math.round(((currentStep + 1) / MILESTONES.length) * 100);

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="max-w-xl mx-auto py-12 px-4 text-center"
    >
      {/* Glowing AI Spinner Icon */}
      <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 animate-spin blur-md opacity-60"></div>
        <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-indigo-500/40 flex items-center justify-center shadow-2xl">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center animate-pulse">
            <span className="text-xl">✨</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white tracking-tight">
        VifeAI is Building Your Blueprint
      </h2>
      <p className="text-xs text-slate-400 mt-2">
        Translating operational descriptions into dynamic entities & relationships
      </p>

      {/* Progress Bar */}
      <div className="mt-8 mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
          <span>Processing Prompt</span>
          <span className="text-indigo-400 font-bold">{progressPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Milestones Checklist */}
      <div className="max-w-md mx-auto rounded-2xl bg-slate-900/80 border border-slate-800 p-5 text-left space-y-3.5 backdrop-blur-md">
        {MILESTONES.map((label, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isUpcoming = idx > currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone
                  ? "text-slate-300 font-medium"
                  : isCurrent
                  ? "text-indigo-300 font-semibold"
                  : "text-slate-600"
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                {isDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                )}
              </div>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
