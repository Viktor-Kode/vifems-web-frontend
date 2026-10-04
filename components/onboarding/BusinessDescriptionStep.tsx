"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, AlertTriangle, CheckCircle2 } from "@/components/Icons";

interface BusinessDescriptionStepProps {
  initialDescription: string;
  onSubmit: (description: string) => void;
  error?: string | null;
}

const TEMPLATES = [
  {
    icon: "🧁",
    category: "Food & Bakery",
    title: "Custom Cake Bakery",
    prompt:
      "I run a custom cake bakery. Customers place orders for cakes, ingredients need tracking, and we manage delivery dates, payments, and order status.",
  },
  {
    icon: "🚗",
    category: "Automotive",
    title: "Auto Repair Workshop",
    prompt:
      "I own an auto repair shop. Customers bring vehicles for diagnostics and repairs. I track customers, vehicle models, spare parts inventory, jobs, and invoices.",
  },
  {
    icon: "🏢",
    category: "Real Estate",
    title: "Property Management",
    prompt:
      "I manage rental properties. Tenants sign leases, log maintenance tickets, and pay rent. I need to track properties, tenants, tickets, and payment history.",
  },
  {
    icon: "💻",
    category: "Services",
    title: "Digital Design Agency",
    prompt:
      "We are a digital design studio. Clients hire us for projects. We track client accounts, active projects, deliverables, team deadlines, and billing status.",
  },
  {
    icon: "🩺",
    category: "Healthcare",
    title: "Medical Clinic",
    prompt:
      "We run a private clinic. Patients schedule appointments with doctors. We track patient records, doctor schedules, prescriptions, and billing invoices.",
  },
  {
    icon: "🎓",
    category: "Education",
    title: "Learning Academy",
    prompt:
      "We manage a tutoring academy. Students register for courses taught by instructors. We track enrollment, class schedules, attendance, and tuition fees.",
  },
];

export default function BusinessDescriptionStep({
  initialDescription,
  onSubmit,
  error,
}: BusinessDescriptionStepProps) {
  const [description, setDescription] = useState(initialDescription || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(description.trim());
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span>AI Workspace Generator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Describe your business. <br className="hidden sm:inline" />
          <span className="text-slate-500 font-extrabold">We&apos;ll build your workspace.</span>
        </h1>
        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Type what your business does in plain language or choose a template below. VifeAI will instantly architect your custom database, forms, and workflows.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Blueprint Generation Notice</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl bg-white border-2 border-slate-200 focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/10 transition-all p-3 shadow-md">
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell VifeAI about your business... (e.g., 'I run a fitness gym. I need to track members, class schedules, trainer assignments, and monthly membership payments.')"
            className="w-full bg-transparent p-4 text-slate-900 placeholder:text-slate-400 text-base leading-relaxed focus:outline-none resize-y min-h-[140px] font-medium"
          />

          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
              <span>Plain language • No technical knowledge required</span>
            </div>

            <button
              type="submit"
              disabled={!description.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <span>Generate Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Quick Business Templates Grid */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Or Pick a Sample Business Template
            </h3>
            <span className="text-xs text-slate-400 font-medium">Click any to load prompt</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDescription(tmpl.prompt)}
                className="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tmpl.icon}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {tmpl.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-black mb-1">
                    {tmpl.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tmpl.prompt}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-xs font-semibold text-slate-900 group-hover:underline">
                  <span>Use Template →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
