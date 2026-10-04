"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Check, Lock, ShieldCheck, Briefcase } from "@/components/Icons";

interface DemoWorkspace {
  id: string;
  name: string;
  tabs: string[];
  activeTab: string;
  metrics: { label: string; value: string; sub: string; color: string }[];
  records: { id: string; col2: string; amount: string; status: string; statusBg: string }[];
  fieldCount: string;
}

const DEMO_WORKSPACES: DemoWorkspace[] = [
  {
    id: "bakery",
    name: "Sweet Crumbs Bakery Workspace",
    tabs: ["Orders (24)", "Customers", "Products", "Ingredients", "Deliveries"],
    activeTab: "Orders (24)",
    metrics: [
      { label: "Today's Sales", value: "$1,450.00", sub: "+14% vs yesterday", color: "text-emerald-600" },
      { label: "Active Orders", value: "12 Pending", sub: "3 Custom Cakes", color: "text-amber-600" },
      { label: "Deliveries", value: "8 Scheduled", sub: "On schedule", color: "text-blue-600" },
    ],
    records: [
      { id: "#ORD-1042", col2: "Sarah J. (Wedding Cake)", amount: "$350.00", status: "In Production", statusBg: "bg-amber-50 text-amber-700 border-amber-200" },
      { id: "#ORD-1041", col2: "Marcus C. (Cupcakes)", amount: "$180.00", status: "Delivered", statusBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { id: "#ORD-1040", col2: "Elena R. (Pastry Box)", amount: "$95.00", status: "Confirmed", statusBg: "bg-blue-50 text-blue-700 border-blue-200" },
    ],
    fieldCount: "5 Entities · 24 Custom Fields",
  },
  {
    id: "driving-school",
    name: "Apex Driving Academy Workspace",
    tabs: ["Lessons (18)", "Students", "Instructors", "Vehicles", "Payments"],
    activeTab: "Lessons (18)",
    metrics: [
      { label: "Booked Lessons", value: "18 Today", sub: "4 Exam Preps", color: "text-emerald-600" },
      { label: "Active Students", value: "64 Enrolled", sub: "+8 this week", color: "text-blue-600" },
      { label: "Vehicle Fleet", value: "6/6 Active", sub: "All insured", color: "text-slate-600" },
    ],
    records: [
      { id: "#LES-409", col2: "David K. (Highway Test)", amount: "$65.00", status: "In Progress", statusBg: "bg-blue-50 text-blue-700 border-blue-200" },
      { id: "#LES-408", col2: "Priya M. (Parallel Park)", amount: "$50.00", status: "Completed", statusBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { id: "#LES-407", col2: "Alex T. (Night Driving)", amount: "$55.00", status: "Scheduled", statusBg: "bg-slate-100 text-slate-700 border-slate-200" },
    ],
    fieldCount: "5 Entities · 22 Custom Fields",
  },
  {
    id: "retail",
    name: "TechPulse Electronics Retail",
    tabs: ["Sales (32)", "Products", "Suppliers", "Inventory", "Customers"],
    activeTab: "Sales (32)",
    metrics: [
      { label: "Daily Revenue", value: "$3,890.00", sub: "+22% peak sales", color: "text-emerald-600" },
      { label: "Low Stock Alert", value: "4 Items", sub: "Re-order sent", color: "text-rose-600" },
      { label: "Total Products", value: "240 SKUs", sub: "Synced live", color: "text-blue-600" },
    ],
    records: [
      { id: "#SALE-982", col2: "Wireless Earbuds (2x)", amount: "$240.00", status: "Completed", statusBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { id: "#SALE-981", col2: "4K Monitor 27in", amount: "$420.00", status: "Processing", statusBg: "bg-amber-50 text-amber-700 border-amber-200" },
      { id: "#SALE-980", col2: "USB-C Hub Pro", amount: "$75.00", status: "Completed", statusBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    ],
    fieldCount: "5 Entities · 28 Custom Fields",
  },
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger page load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle through workspace demos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % DEMO_WORKSPACES.length);
        setIsAnimating(false);
      }, 250);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const currentWorkspace = DEMO_WORKSPACES[activeIndex];

  const handleSelectWorkspace = (index: number) => {
    if (index === activeIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <section className="pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Left Content */}
        <div
          className={`lg:col-span-6 flex flex-col items-start text-left transition-all duration-700 ease-out transform ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-xs text-xs font-semibold uppercase tracking-wider text-slate-600 mb-5 sm:mb-6">
            <Briefcase className="w-3.5 h-3.5 text-slate-900" />
            <span>Smarter Business Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.1] mb-5 sm:mb-6">
            Describe your business. <br className="hidden sm:block" />
            We&apos;ll build the system.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-xl mb-6 sm:mb-8">
            VifeMS turns the way you run your business into a simple, customizable management workspace without requiring you to know how to build software.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-6">
            <Link
              href="/onboarding"
              className="relative inline-flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-slate-900 hover:bg-black rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-slate-800 group cursor-pointer"
            >
              <span>Create My Management System</span>
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-full transition-all cursor-pointer"
            >
              See How It Works
            </a>
          </div>

          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Right Animated Live Workspace Mockup with Heightt Pay style visual design */}
        <div
          className={`lg:col-span-6 w-full transition-all duration-1000 delay-150 ease-out transform ${
            isLoaded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
          }`}
        >
          {/* Outer Subtle Background Container with Soft Halo */}
          <div className="relative bg-slate-50/60 rounded-3xl border border-slate-200/80 shadow-2xl p-3 sm:p-4 overflow-hidden max-w-xl mx-auto">
            {/* Outer Rounded White Card Container */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 relative">
              {/* Card Top Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-auto flex items-center justify-center">
                    <Image
                      src="/logo/logo.png"
                      alt="VifeMS"
                      width={110}
                      height={32}
                      className="h-7 w-auto object-contain mix-blend-multiply"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-none transition-all duration-300">
                      {currentWorkspace.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase block mt-1">
                      AI WORKSPACE BLUEPRINT
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE</span>
                </div>
              </div>

              {/* Quick Workspace Switcher Dots */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Select Industry Blueprint
                </span>
                <div className="flex items-center gap-1.5">
                  {DEMO_WORKSPACES.map((demo, idx) => (
                    <button
                      key={demo.id}
                      onClick={() => handleSelectWorkspace(idx)}
                      aria-label={`Switch to ${demo.name}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeIndex
                          ? "w-6 bg-slate-900"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Dynamic Animated Content Area */}
              <div
                className={`transition-all duration-300 ${
                  isAnimating ? "opacity-30 scale-[0.99] blur-[1px]" : "opacity-100 scale-100 blur-0"
                }`}
              >
                {/* Generated Business Entity Tabs */}
                <div className="flex items-center gap-1.5 pb-3.5 border-b border-slate-100 overflow-x-auto no-scrollbar text-xs font-medium">
                  {currentWorkspace.tabs.map((tab, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        idx === 0
                          ? "bg-slate-900 text-white font-bold shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 my-4">
                  {currentWorkspace.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-slate-50/80 border border-slate-200/80 p-2.5 sm:p-3 rounded-xl">
                      <span className="text-[10px] font-medium text-slate-400 block truncate">{metric.label}</span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 block">{metric.value}</span>
                      <span className={`text-[10px] font-semibold block mt-0.5 ${metric.color}`}>
                        {metric.sub}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Structured Data Table */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs mb-4">
                  <div className="bg-slate-100/70 px-3 py-2 font-bold text-slate-700 grid grid-cols-12 text-[11px]">
                    <span className="col-span-3">RECORD ID</span>
                    <span className="col-span-4">ITEM / CLIENT</span>
                    <span className="col-span-2">AMOUNT</span>
                    <span className="col-span-3 text-right">STATUS</span>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white">
                    {currentWorkspace.records.map((record) => (
                      <div key={record.id} className="px-3 py-2 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors">
                        <span className="col-span-3 font-mono font-semibold text-slate-900 text-[11px]">{record.id}</span>
                        <span className="col-span-4 font-medium text-slate-700 truncate text-[11px]">{record.col2}</span>
                        <span className="col-span-2 font-bold text-slate-900 text-[11px]">{record.amount}</span>
                        <span className="col-span-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${record.statusBg}`}>
                            {record.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Row & Proof Tag */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>AI auto-structures 100% of records.</span>
                  </div>

                  <Link
                    href="/onboarding"
                    className="w-full sm:w-auto py-2.5 px-5 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Manage workspace</span>
                    <span className="text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
