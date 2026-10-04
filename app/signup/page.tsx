"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Google,
  ArrowLeft,
  Sparkles
} from "@/components/Icons";

import AuthMockupPanel from "@/components/AuthMockupPanel";

import VifeMSLogo from "@/components/VifeMSLogo";

export default function SignupPage() {
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial loading form skeleton simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingSkeleton(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      window.location.href = "/onboarding";
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-white lg:bg-slate-950 flex flex-col lg:flex-row text-slate-900 lg:text-slate-100 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Left Column: Reusable Mockup Panel */}
      <AuthMockupPanel />

      {/* Right Column: Scrollable Form Panel with Back to Home Button & Mobile Logo at Top */}
      <div className="w-full lg:w-1/2 min-h-screen lg:h-screen lg:overflow-y-auto bg-white text-slate-900 p-6 sm:p-10 lg:p-16 flex flex-col justify-between">
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Top Form Navigation: Back to Home Link & Mobile Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>

            {/* Mobile Brand Logo */}
            <div className="lg:hidden">
              <VifeMSLogo theme="light" size="sm" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Enter your information below to register your business workspace.
            </p>
          </div>

          {/* Form Skeleton Loading State */}
          {isLoadingSkeleton ? (
            <div className="space-y-4 animate-pulse">
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-20"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-20"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-20"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-28"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="h-12 bg-slate-900/20 rounded-xl w-full mt-6"></div>
              <div className="h-12 bg-slate-200 rounded-xl w-full mt-3"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. First Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter your first name"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 2. Last Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter your last name"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 3. Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 4. Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 5. Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Sign In Primary Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  OR
                </span>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-2xs"
              >
                <Google className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>

              {/* Already registered link */}
              <div className="mt-8 text-center text-sm text-slate-600">
                Already Registered?{" "}
                <Link href="/login" className="font-bold text-slate-900 hover:underline">
                  Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
