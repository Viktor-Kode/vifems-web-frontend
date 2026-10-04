"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "@/components/Icons";

export default function AuthMockupPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 lg:h-screen lg:sticky lg:top-0 bg-slate-950 p-6 sm:p-8 lg:p-10 flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
      {/* Left Header Logo, Text & Subtext */}
      <div className="z-10 pt-2">
        <Link href="/" className="inline-block mb-6 group">
          <Image
            src="/logo/logo.png"
            alt="VifeMS"
            width={140}
            height={40}
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105 brightness-0 invert"
            priority
          />
        </Link>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Describe your business. <br />
          We&apos;ll build the system.
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md leading-relaxed">
          VifeMS turns the way you run your business into a simple, customizable management workspace.
        </p>
      </div>

      {/* Center: Full Squarish Glassmorphic Mockup Card */}
      <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10 w-full">
        <div className="w-full max-w-md bg-slate-900/95 rounded-2xl border border-slate-800/90 shadow-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl">
          {/* Shining Glassmorphism Light Effect Sheen */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-glass-shine"></div>
          </div>

          {/* Mockup Top Window Header Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90"></div>
              <span className="text-[11px] font-mono text-slate-300 font-semibold ml-1.5">
                VifeMS Workspace
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Sync
            </span>
          </div>

          {/* Business Entity Tabs */}
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800 text-[11px] font-medium overflow-x-auto no-scrollbar">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold shadow-xs">
              Dashboard
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300">
              Clients
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300">
              Bookings
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300">
              Invoices
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 my-3">
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Total Revenue</span>
              <span className="text-lg font-extrabold text-white mt-0.5 block">$24,850.00</span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">+18.5% this month</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Active Records</span>
              <span className="text-lg font-extrabold text-indigo-300 mt-0.5 block">128 Entities</span>
              <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">AI Auto-Structured</span>
            </div>
          </div>

          {/* Structured Entity Table / Records List */}
          <div className="border border-slate-800/80 rounded-xl p-2.5 bg-slate-950/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
              <span>Recent Records</span>
              <span className="text-slate-500 font-mono text-[9px]">Status</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">Lesson Booking #402</div>
                    <div className="text-[9px] text-slate-400">Driving School Entity</div>
                  </div>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Confirmed
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">Student Progress Report</div>
                    <div className="text-[9px] text-slate-400">Training Module</div>
                  </div>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Updated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
