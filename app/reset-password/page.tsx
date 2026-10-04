"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "@/components/Icons";
import AuthMockupPanel from "@/components/AuthMockupPanel";
import VifeMSLogo from "@/components/VifeMSLogo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingSkeleton(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      // Redirect to login after 2.5s
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Is the backend running?");
      setIsSubmitting(false);
    }
  };

  // No token in URL — bad link
  if (!token) {
    return (
      <div className="max-w-md w-full mx-auto my-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto text-2xl font-bold">!</div>
        <h1 className="text-2xl font-extrabold text-slate-900">Invalid link</h1>
        <p className="text-sm text-slate-600">This password reset link is missing a token. Please request a new one.</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all mt-4"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto my-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Login</span>
        </Link>
        <div className="lg:hidden">
          <VifeMSLogo theme="light" size="sm" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set new password</h1>
        <p className="text-slate-600 text-sm mt-2">
          Choose a strong password for your VifeMS account.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {isLoadingSkeleton ? (
        <div className="space-y-4 animate-pulse">
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-24"></div>
            <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-32"></div>
            <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          </div>
          <div className="h-12 bg-slate-900/20 rounded-xl w-full mt-6"></div>
        </div>
      ) : isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
          <h3 className="text-lg font-bold text-slate-900">Password updated!</h3>
          <p className="text-sm text-slate-600">
            Your password has been reset successfully. Redirecting you to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Confirm Password */}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-6"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Resetting...
              </>
            ) : "Reset Password"}
          </button>

          <div className="mt-6 text-center text-sm text-slate-600">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-slate-900 hover:underline">
              Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-white lg:bg-slate-950 flex flex-col lg:flex-row text-slate-900 lg:text-slate-100 font-sans selection:bg-slate-100 selection:text-slate-900">
      <AuthMockupPanel />
      <div className="w-full lg:w-1/2 min-h-screen lg:h-screen lg:overflow-y-auto bg-white text-slate-900 p-6 sm:p-10 lg:p-16 flex flex-col justify-between">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
