"use client";

import React, { useEffect, useState } from "react";

interface ProvisioningStateProps {
  workspaceName: string;
  onComplete: () => void;
}

const PROVISION_STEPS = [
  "Creating workspace record & security context...",
  "Configuring dynamic data schemas & indexes...",
  "Generating responsive management interfaces & tables...",
];

export default function ProvisioningState({
  workspaceName,
  onComplete,
}: ProvisioningStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROVISION_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => onComplete(), 700);
          return prev;
        }
      });
    }, 800);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPct = Math.round(((currentStep + 1) / PROVISION_STEPS.length) * 100);

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center">
      {/* Animated Hex/Gear Provisioning Icon */}
      <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 animate-pulse blur-md opacity-60"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center animate-bounce text-xl font-bold">
            ⚡
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white tracking-tight">
        Provisioning {workspaceName}
      </h2>
      <p className="text-xs text-slate-400 mt-2">
        Setting up security policies, storage, and interface views
      </p>

      {/* Progress Bar */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
          <span>Provisioning Progress</span>
          <span className="text-emerald-400 font-bold">{progressPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Provisioning Checklist */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 text-left space-y-3.5 backdrop-blur-md">
        {PROVISION_STEPS.map((label, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone
                  ? "text-slate-300 font-medium"
                  : isCurrent
                  ? "text-emerald-300 font-semibold"
                  : "text-slate-600"
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {isDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
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
