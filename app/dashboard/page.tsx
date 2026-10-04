"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VifeMSLogo from "@/components/VifeMSLogo";
import { Blueprint } from "@/lib/api/workspace";
import { Sparkles, CheckCircle2, ArrowRight } from "@/components/Icons";

const STORAGE_KEY = "vifems_onboarding_state";

export default function DashboardPage() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "entity" | "settings">("overview");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blueprint) {
          setBlueprint(parsed.blueprint);
          if (parsed.blueprint.entities?.length > 0) {
            setSelectedEntityId(parsed.blueprint.entities[0].id);
          }
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Default fallback if no blueprint in session
  const activeBlueprint: Blueprint = blueprint || {
    workspaceName: "Sweet Crumbs Bakery",
    description: "Custom bakery order tracking and inventory management.",
    entities: [
      {
        id: "ent_clients",
        name: "Customers",
        description: "People who place cake orders and request custom designs.",
        fields: [
          { id: "f_1", name: "Full Name", type: "Text", required: true, exampleValue: "Sarah Jenkins" },
          { id: "f_2", name: "Phone Number", type: "Text", exampleValue: "+1 (555) 234-5678" },
          { id: "f_3", name: "Email Address", type: "Text", exampleValue: "sarah@example.com" },
          { id: "f_4", name: "Joined Date", type: "Date", exampleValue: "2026-03-15" },
        ],
      },
      {
        id: "ent_orders",
        name: "Cake Orders",
        description: "Track custom cake specifications, budgets, and deadlines.",
        fields: [
          { id: "f_21", name: "Order Date", type: "Date", required: true, exampleValue: "2026-10-05" },
          { id: "f_22", name: "Status", type: "Select", options: ["Pending", "In Progress", "Ready", "Delivered"], exampleValue: "In Progress" },
          { id: "f_23", name: "Total Budget", type: "Currency", exampleValue: "$450.00" },
          { id: "f_24", name: "Delivery Needed", type: "Boolean", exampleValue: "True" },
          { id: "f_25", name: "Customer", type: "Relation", exampleValue: "Sarah Jenkins" },
        ],
      },
    ],
    relationships: [
      { id: "rel_1", fromEntityId: "ent_clients", toEntityId: "ent_orders", label: "places" },
    ],
  };

  const selectedEntity =
    activeBlueprint.entities.find((e) => e.id === selectedEntityId) ||
    activeBlueprint.entities[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Dashboard Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <VifeMSLogo theme="light" size="sm" />
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                {activeBlueprint.workspaceName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                Live Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
            >
              Re-provision / Setup New
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Workspace Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          {/* Main Navigation Tabs */}
          <div className="rounded-2xl bg-white border border-slate-200 p-2 shadow-2xs space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>Workspace Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "settings"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>Workspace Settings</span>
            </button>
          </div>

          {/* Dynamic AI Provisioned Entities List */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Provisioned Models</span>
              <span className="text-slate-900 font-bold">{activeBlueprint.entities.length}</span>
            </div>

            <div className="space-y-1.5">
              {activeBlueprint.entities.map((entity) => {
                const isSelected =
                  activeTab === "entity" && selectedEntityId === entity.id;

                return (
                  <button
                    key={entity.id}
                    onClick={() => {
                      setSelectedEntityId(entity.id);
                      setActiveTab("entity");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                      <span className="truncate">{entity.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {entity.fields.length} fields
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                  <span>VifeAI Operational Engine Active</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to {activeBlueprint.workspaceName}
                </h1>
                <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
                  Your custom business management workspace generated from plain text. All tables, forms, and attributes are provisioned and ready.
                </p>
              </div>

              {/* Statistics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dynamic Entities</div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">
                    {activeBlueprint.entities.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Auto-generated schema</div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Configured Attributes</div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">
                    {activeBlueprint.entities.reduce((acc, e) => acc + e.fields.length, 0)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Typed fields active</div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Workflow Links</div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">
                    {activeBlueprint.relationships?.length || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Entity relations linked</div>
                </div>
              </div>

              {/* Entity Cards Overview */}
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-4">
                  Provisioned Data Models
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBlueprint.entities.map((entity) => (
                    <div
                      key={entity.id}
                      onClick={() => {
                        setSelectedEntityId(entity.id);
                        setActiveTab("entity");
                      }}
                      className="rounded-2xl bg-white border border-slate-200 hover:border-slate-400 p-5 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-black transition-colors">
                          {entity.name}
                        </h3>
                        <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                          <span>{entity.fields.length} attributes</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {entity.description || "Custom AI model."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "entity" && selectedEntity && (
            <div className="space-y-6">
              {/* Entity Table Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-slate-900">
                      {selectedEntity.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                      Model View
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedEntity.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    + New {selectedEntity.name.replace(/s$/, "")}
                  </button>
                </div>
              </div>

              {/* Dynamic Entity Table View */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-4"># ID</th>
                        {selectedEntity.fields.map((field) => (
                          <th key={field.id} className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span>{field.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono normal-case">
                                ({field.type})
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {[1, 2, 3].map((rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-slate-400">#{rowIdx}</td>
                          {selectedEntity.fields.map((field) => (
                            <td key={field.id} className="p-4 font-semibold text-slate-900">
                              {field.exampleValue ||
                                (field.type === "Select"
                                  ? field.options?.[0] || "Active"
                                  : field.type === "Boolean"
                                  ? "True"
                                  : field.type === "Date"
                                  ? "2026-10-04"
                                  : field.type === "Currency"
                                  ? "$250.00"
                                  : `${field.name} Item ${rowIdx}`)}
                            </td>
                          ))}
                          <td className="p-4 text-right font-bold text-slate-900 hover:underline cursor-pointer">
                            Edit
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xs">
              <h1 className="text-xl font-bold text-slate-900">Workspace Configuration</h1>
              <p className="text-xs text-slate-600">
                Workspace Name: <span className="text-slate-900 font-bold">{activeBlueprint.workspaceName}</span>
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Description: {activeBlueprint.description}
              </p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/onboarding"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-all inline-block shadow-sm"
                >
                  Generate New Workspace Blueprint
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
