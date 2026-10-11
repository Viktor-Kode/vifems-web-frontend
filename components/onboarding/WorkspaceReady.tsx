"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "@/components/Icons";

interface WorkspaceReadyProps {
  workspaceName: string;
}

export default function WorkspaceReady({ workspaceName }: WorkspaceReadyProps) {
  return (
    <div className="max-w-lg mx-auto py-12 px-4 text-center">
      {/* Success Icon */}
      <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: "#2563EB", color: "#FFFFFF" }}
        >
          <CheckCircle2 className="w-8 h-8" />
        </div>
      </div>

      <div
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
        style={{ background: "#E2EBFF", borderColor: "#D3DBE8", color: "#1D4ED8" }}
      >
        Workspace Provisioned &amp; Live
      </div>

      <h1
        className="text-3xl font-extrabold tracking-tight"
        style={{ fontFamily: "'Familjen Grotesk', system-ui, sans-serif", color: "#0E1A2E" }}
      >
        {workspaceName}
      </h1>

      <p className="mt-3 text-sm max-w-md mx-auto leading-relaxed" style={{ color: "#475670" }}>
        Your workspace blueprint has been successfully configured and saved. VifeAI has structured your dynamic models, tables, and workflows.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base shadow-md transition-all cursor-pointer group w-full sm:w-auto"
          style={{ background: "#2563EB", color: "#FFFFFF" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <p className="text-xs mt-6" style={{ color: "#A2B2CB" }}>
        You can return to onboarding anytime to generate or tweak new business workspace blueprints.
      </p>
    </div>
  );
}
