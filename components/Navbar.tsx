"use client";

import React, { useState } from "react";
import Link from "next/link";
import VifeMSLogo from "@/components/VifeMSLogo";
import { ArrowRight, Menu, X } from "@/components/Icons";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <VifeMSLogo theme="light" size="md" className="transition-transform group-hover:scale-105" />
        </Link>

        {/* Desktop Navigation (md and up) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            FAQ
          </a>
          <Link
            href="/onboarding"
            className="relative inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-slate-800 group shrink-0"
          >
            <span>Get Started</span>
            <div className="w-5.5 h-5.5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all">
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle Button (md:hidden) */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/onboarding"
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-full shadow-xs"
          >
            <span>Get Started</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Dropdown Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 px-2 border-t border-slate-100 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              How it works
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/onboarding"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
