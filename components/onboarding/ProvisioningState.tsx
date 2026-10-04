"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2 } from "@/components/Icons";

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
      {/* Sleek Provisioning Icon */}
      <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border-2 border-slate-200 border-t-slate-900 animate-spin"></div>
        <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Sparkles className="w-6 h-6 text-slate-900 animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Provisioning {workspaceName}
      </h2>
      <p className="text-xs text-slate-600 mt-2">
        Setting up security policies, storage, and interface views
      </p>

      {/* Progress Bar */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between text-xs text-slate-600 font-mono mb-2">
          <span>Provisioning Progress</span>
          <span className="text-slate-900 font-bold">{progressPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Provisioning Checklist */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 text-left space-y-3 shadow-2xs">
        {PROVISION_STEPS.map((label, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone
                  ? "text-slate-900 font-semibold"
                  : isCurrent
                  ? "text-slate-900 font-bold"
                  : "text-slate-400"
              }`}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-900" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping"></span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
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
