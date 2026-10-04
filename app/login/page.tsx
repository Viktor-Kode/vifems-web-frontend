"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Google, ArrowLeft, Eye, EyeOff } from "@/components/Icons";
import AuthMockupPanel from "@/components/AuthMockupPanel";
import VifeMSLogo from "@/components/VifeMSLogo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  email_exists_no_google:
    "This email is registered with a password. Please sign in with your password instead.",
  google_auth_failed: "Google sign-in failed. Please try again.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingSkeleton(false), 600);

    const oauthError = searchParams.get("error");
    const registered = searchParams.get("registered");

    if (oauthError) {
      setError(OAUTH_ERROR_MESSAGES[oauthError] || "Authentication failed. Please try again.");
    } else if (registered === "true") {
      setSuccessMessage("Account created! Sign in to continue.");
    }

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError("Network error. Is the backend running?");
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="max-w-md w-full mx-auto my-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="lg:hidden">
          <VifeMSLogo theme="light" size="sm" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
        <p className="text-slate-600 text-sm mt-2">Sign in to access your VifeMS business workspace.</p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          {successMessage}
        </div>
      )}

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
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          </div>
          <div className="h-12 bg-slate-900/20 rounded-xl w-full mt-6"></div>
          <div className="h-12 bg-slate-200 rounded-xl w-full mt-3"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                Signing in...
              </>
            ) : "Sign In"}
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">OR</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-2xs"
          >
            <Google className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-slate-900 hover:underline">Sign Up</Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-white lg:bg-slate-950 flex flex-col lg:flex-row text-slate-900 lg:text-slate-100 font-sans selection:bg-slate-100 selection:text-slate-900">
      <AuthMockupPanel />
      <div className="w-full lg:w-1/2 min-h-screen lg:h-screen lg:overflow-y-auto bg-white text-slate-900 p-6 sm:p-10 lg:p-16 flex flex-col justify-between">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
