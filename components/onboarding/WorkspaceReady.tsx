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
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
          <CheckCircle2 className="w-8 h-8" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-4">
        Workspace Provisioned & Live
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        {workspaceName}
      </h1>

      <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        Your workspace blueprint has been successfully configured and saved. VifeAI has structured your dynamic models, tables, and workflows.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-base shadow-md transition-all cursor-pointer group w-full sm:w-auto"
        >
          <span>Return to Home</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <p className="text-xs text-slate-500 mt-6">
        You can return to onboarding anytime to generate or tweak new business workspace blueprints.
      </p>
    </div>
  );
}
