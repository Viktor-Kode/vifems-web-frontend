"use client";

import React, { useState, useEffect } from "react";
import VifeMSLogo from "@/components/VifeMSLogo";
import BusinessDescriptionStep from "@/components/onboarding/BusinessDescriptionStep";
import AIProcessingState from "@/components/onboarding/AIProcessingState";
import BlueprintReview from "@/components/onboarding/BlueprintReview";
import ProvisioningState from "@/components/onboarding/ProvisioningState";
import WorkspaceReady from "@/components/onboarding/WorkspaceReady";
import {
  Blueprint,
  OnboardingState,
  generateBlueprint,
  provisionWorkspace,
} from "@/lib/api/workspace";

const STORAGE_KEY = "vifems_onboarding_state";

export default function OnboardingPage() {
  const [state, setState] = useState<OnboardingState>({
    businessDescription: "",
    workspaceName: "My Workspace",
    blueprint: null,
    step: "prompt",
    error: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Restore cached onboarding session from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessDescription) {
          setState((prev) => ({
            ...prev,
            ...parsed,
            step: parsed.step === "generating" || parsed.step === "provisioning" ? "prompt" : parsed.step,
          }));
        }
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save session state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write errors
    }
  }, [state, isInitialized]);

  // Step 1 Submission: Generate AI Blueprint
  const handleStartGeneration = async (description: string) => {
    setState((prev) => ({
      ...prev,
      businessDescription: description,
      step: "generating",
      error: null,
    }));

    try {
      const blueprint = await generateBlueprint(description);
      setState((prev) => ({
        ...prev,
        blueprint,
        workspaceName: blueprint.workspaceName,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        step: "prompt",
        error: {
          stage: "generation",
          message:
            "We couldn't build your workspace blueprint yet. Something went wrong while analyzing your business description.",
        },
      }));
    }
  };

  // Called when AI Processing State animation finishes
  const handleAIProcessingComplete = () => {
    if (state.blueprint) {
      setState((prev) => ({ ...prev, step: "review" }));
    } else {
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: "review" }));
      }, 500);
    }
  };

  // Step 2 Blueprint Review modifications
  const handleUpdateBlueprint = (updatedBlueprint: Blueprint) => {
    setState((prev) => ({
      ...prev,
      blueprint: updatedBlueprint,
      workspaceName: updatedBlueprint.workspaceName,
    }));
  };

  // Step 2 Submission: Provision Workspace
  const handleConfirmProvision = async () => {
    if (!state.blueprint) return;

    setState((prev) => ({ ...prev, step: "provisioning", error: null }));

    try {
      await provisionWorkspace(state.blueprint);
    } catch {
      setState((prev) => ({
        ...prev,
        step: "review",
        error: {
          stage: "provisioning",
          message:
            "Your workspace couldn't be created at this moment. You can retry provisioning with your saved blueprint.",
        },
      }));
    }
  };

  const handleProvisioningComplete = () => {
    setState((prev) => ({ ...prev, step: "ready" }));
  };

  // Step Navigation Progress Items
  const steps = [
    { key: "prompt", label: "1. Prompt" },
    { key: "generating", label: "2. AI Blueprint" },
    { key: "review", label: "3. Review & Edit" },
    { key: "provisioning", label: "4. Provision" },
    { key: "ready", label: "5. Ready" },
  ];

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Quiet, Distraction-Free Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VifeMSLogo theme="light" size="sm" />
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              Workspace Setup
            </span>
          </div>

          {/* Minimalist Progress Indicators */}
          <div className="flex items-center gap-1 sm:gap-2">
            {steps.map((s, idx) => {
              const isCurrent = state.step === s.key;
              const isPast =
                steps.findIndex((x) => x.key === state.step) > idx;

              return (
                <div
                  key={s.key}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    isCurrent
                      ? "bg-slate-900 text-white font-bold shadow-2xs"
                      : isPast
                      ? "text-slate-700 font-medium"
                      : "text-slate-400 hidden md:flex"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCurrent
                        ? "bg-white animate-pulse"
                        : isPast
                        ? "bg-slate-800"
                        : "bg-slate-300"
                    }`}
                  ></span>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col justify-center">
        {state.step === "prompt" && (
          <BusinessDescriptionStep
            initialDescription={state.businessDescription}
            onSubmit={handleStartGeneration}
            error={state.error?.stage === "generation" ? state.error.message : null}
          />
        )}

        {state.step === "generating" && (
          <AIProcessingState onComplete={handleAIProcessingComplete} />
        )}

        {state.step === "review" && state.blueprint && (
          <BlueprintReview
            blueprint={state.blueprint}
            onUpdateBlueprint={handleUpdateBlueprint}
            onConfirmProvision={handleConfirmProvision}
            onBackToPrompt={() => setState((prev) => ({ ...prev, step: "prompt" }))}
          />
        )}

        {state.step === "provisioning" && (
          <ProvisioningState
            workspaceName={state.workspaceName}
            onComplete={handleProvisioningComplete}
          />
        )}

        {state.step === "ready" && (
          <WorkspaceReady workspaceName={state.workspaceName} />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] text-slate-500 font-medium">
        VifeMS Engine • Dynamic AI Workspace Provisioning
      </footer>
    </div>
  );
}
