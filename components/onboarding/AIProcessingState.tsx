"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2 } from "@/components/Icons";

interface AIProcessingStateProps {
  onComplete: () => void;
  /** Set to true once the generateBlueprint API call resolves */
  isReady: boolean;
}

const MILESTONES = [
  "Understanding your business structure...",
  "Identifying the information you need to manage...",
  "Designing your dynamic workspace blueprint...",
  "Preparing schema and relationships...",
];

export default function AIProcessingState({ onComplete, isReady }: AIProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [waitingForReady, setWaitingForReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < MILESTONES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setWaitingForReady(true);
          return prev;
        }
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (waitingForReady && isReady) {
      const t = setTimeout(() => onComplete(), 400);
      return () => clearTimeout(t);
    }
  }, [waitingForReady, isReady, onComplete]);

  const progressPct = Math.round(((currentStep + 1) / MILESTONES.length) * 100);

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="max-w-xl mx-auto py-12 px-4 text-center"
    >
      {/* Spinner */}
      <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ borderColor: "#D3DBE8", borderTopColor: "#2563EB" }}
        />
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-sm border"
          style={{ background: "#FFFFFF", borderColor: "#D3DBE8" }}
        >
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: "#2563EB" }} />
        </div>
      </div>

      <h2
        className="text-2xl font-extrabold tracking-tight"
        style={{ fontFamily: "'Familjen Grotesk', system-ui, sans-serif", color: "#0E1A2E" }}
      >
        VifeAI is Building Your Blueprint
      </h2>
      <p className="text-xs mt-2" style={{ color: "#475670" }}>
        Translating operational descriptions into dynamic entities &amp; relationships
      </p>

      {/* Progress Bar */}
      <div className="mt-8 mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-xs font-mono mb-2" style={{ color: "#475670" }}>
          <span>Processing Prompt</span>
          <span className="font-bold" style={{ color: "#0E1A2E" }}>{progressPct}%</span>
        </div>
        <div
          className="w-full h-2.5 rounded-full overflow-hidden border"
          style={{ background: "#EAEFF7", borderColor: "#D3DBE8" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%`, background: "#2563EB" }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div
        className="max-w-md mx-auto rounded-2xl p-5 text-left space-y-3 border"
        style={{ background: "#FFFFFF", borderColor: "#D3DBE8", boxShadow: "0 1px 4px rgba(14,26,46,.06)" }}
      >
        {MILESTONES.map((label, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className="flex items-center gap-3 text-xs transition-all duration-300"
              style={{
                color: isDone || isCurrent ? "#0E1A2E" : "#A2B2CB",
                fontWeight: isDone ? 600 : isCurrent ? 700 : 400,
              }}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#2563EB" }} />
                ) : isCurrent ? (
                  <span
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ background: "#2563EB" }}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D3DBE8" }} />
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
