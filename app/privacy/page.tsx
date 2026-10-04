"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from "@/components/Icons";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Breadcrumb Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enterprise Security & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy & Security Policy
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            At VifeMS, we build business management systems around your operations with security and data privacy engineered into every layer.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-mono">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 1. Data Isolation */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Strict Workspace Data Isolation
              </h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Your business records, custom field structures, entity relationships, and customer data are completely isolated within your workspace container. No third-party business or outside organization ever has access to your data.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Isolated tenant data stores with encrypted access keys</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Role-based access control for team members and administrators</span>
              </li>
            </ul>
          </div>

          {/* 2. AI Privacy */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                AI Engine Privacy Standard
              </h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              VifeAI processes natural language descriptions solely to generate your custom workspace blueprints. Your business data is never used to train public AI models.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero model training on customer business operational data</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted prompt pipelines and ephemeral AI session processing</span>
              </li>
            </ul>
          </div>

          {/* 3. Encryption */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Encryption & Data Ownership
              </h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              All data transmitted between your browser and VifeMS servers is encrypted in transit using TLS 1.3 encryption. Data stored at rest is protected with AES-256 encryption. You retain 100% ownership of your business records at all times and can export or delete your workspace data on demand.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
