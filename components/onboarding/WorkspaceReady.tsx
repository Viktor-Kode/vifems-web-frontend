"use client";

import React from "react";
import Link from "next/link";

interface WorkspaceReadyProps {
  workspaceName: string;
}

export default function WorkspaceReady({ workspaceName }: WorkspaceReadyProps) {
  return (
    <div className="max-w-lg mx-auto py-12 px-4 text-center">
      {/* Celebration Icon */}
      <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
        <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-emerald-500/60 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
          <span className="text-4xl">🎉</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
        ✓ Workspace Provisioned & Live
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        {workspaceName}
      </h1>

      <p className="mt-3 text-base text-slate-300 max-w-md mx-auto leading-relaxed">
        Your tailored workspace is ready for daily operations. VifeAI has structured your dynamic models, tables, and workflows.
      </p>

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer group w-full sm:w-auto"
        >
          <span>Open Workspace</span>
          <span className="group-hover:translate-x-1.5 transition-transform">→</span>
        </Link>
      </div>

      <p className="text-xs text-slate-500 mt-6">
        You can customize entities, add team members, or generate new views anytime from Workspace Settings.
      </p>
    </div>
  );
}
