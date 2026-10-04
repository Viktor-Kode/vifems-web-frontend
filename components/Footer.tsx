"use client";

import React from "react";
import Link from "next/link";
import VifeMSLogo from "@/components/VifeMSLogo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center">
          <VifeMSLogo theme="light" size="sm" />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
            How it works
          </a>
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">
            Security & Privacy
          </Link>
          <Link href="/signup" className="hover:text-slate-900 transition-colors">
            Create workspace
          </Link>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} VifeMS Engine. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
