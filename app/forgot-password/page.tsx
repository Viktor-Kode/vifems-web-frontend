"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Sparkles } from "@/components/Icons";
import AuthMockupPanel from "@/components/AuthMockupPanel";
import VifeMSLogo from "@/components/VifeMSLogo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingSkeleton(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSent(true);
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
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
              Reset your password
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Form Skeleton Loading State */}
          {isLoadingSkeleton ? (
            <div className="space-y-4 animate-pulse">
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="h-12 bg-slate-900/20 rounded-xl w-full mt-6"></div>
            </div>
          ) : isSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Reset link sent!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We have sent password reset instructions to <strong className="text-slate-900">{email}</strong>. Please check your inbox.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              {/* Return to Login */}
              <div className="mt-8 text-center text-sm text-slate-600">
                Remembered your password?{" "}
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
