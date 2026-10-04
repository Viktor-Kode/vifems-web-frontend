"use client";

import React, { useState } from "react";
import GuidanceHelp from "./GuidanceHelp";
import { ArrowRight, Sparkles, AlertTriangle, CheckCircle2, ChevronDown } from "@/components/Icons";

interface BusinessDescriptionStepProps {
  initialDescription: string;
  onSubmit: (description: string) => void;
  error?: string | null;
}

const SAMPLE_OPTIONS = [
  {
    title: "Custom Cake Bakery",
    prompt:
      "I run a custom cake bakery. Customers place orders for cakes, ingredients need tracking, and we manage delivery dates, payments, and order status.",
  },
  {
    title: "Auto Repair Workshop",
    prompt:
      "I own an auto repair shop. Customers bring vehicles for diagnostics and repairs. I track customers, vehicle models, spare parts inventory, jobs, and invoices.",
  },
  {
    title: "Property Management",
    prompt:
      "I manage rental properties. Tenants sign leases, log maintenance tickets, and pay rent. I need to track properties, tenants, tickets, and payment history.",
  },
  {
    title: "Digital Design Agency",
    prompt:
      "We are a digital design studio. Clients hire us for projects. We track client accounts, active projects, deliverables, team deadlines, and billing status.",
  },
  {
    title: "Medical Clinic",
    prompt:
      "We run a private clinic. Patients schedule appointments with doctors. We track patient records, doctor schedules, prescriptions, and billing invoices.",
  },
  {
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
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(description.trim());
  };

  const handleSelectDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    const found = SAMPLE_OPTIONS.find((opt) => opt.title === val);
    if (found) {
      setDescription(found.prompt);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span>AI Workspace Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Describe your business workspace
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Type your business operations in plain language or select a template from the dropdown menu. VifeAI will generate your dynamic system structure.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Blueprint Generation Notice</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown Menu Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Pick a Sample Business Template (Optional)
          </label>
          <div className="relative">
            <select
              value={selectedTemplate}
              onChange={handleSelectDropdown}
              className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 font-semibold cursor-pointer transition-all shadow-2xs pr-10"
            >
              <option value="">-- Select a sample business template --</option>
              {SAMPLE_OPTIONS.map((option, idx) => (
                <option key={idx} value={option.title}>
                  {option.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="rounded-3xl bg-white border-2 border-slate-200 focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/10 transition-all p-3 shadow-md">
          <textarea
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your business does... (e.g., 'I run a fitness gym. I need to track members, class schedules, trainer assignments, and monthly membership payments.')"
            className="w-full bg-transparent p-4 text-slate-900 placeholder:text-slate-400 text-base leading-relaxed focus:outline-none resize-y min-h-[150px] font-medium"
          />

          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
              <span>Plain language • No code required</span>
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

        {/* Guidance Help Section */}
        <GuidanceHelp />
      </form>
    </div>
  );
}
