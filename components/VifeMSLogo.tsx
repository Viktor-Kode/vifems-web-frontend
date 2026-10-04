"use client";

import React from "react";

interface VifeMSLogoProps {
  theme?: "light" | "dark";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VifeMSLogo({
  theme = "light",
  className = "",
  size = "md",
}: VifeMSLogoProps) {
  const isDark = theme === "dark";

  // Height scaling presets
  const heightClasses = {
    sm: "h-7 sm:h-8",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-11",
  };

  const markColor = isDark ? "#FFFFFF" : "#0F172A";
  const textColor = isDark ? "#FFFFFF" : "#0F172A";
  const msColor = isDark ? "#94A3B8" : "#1E293B";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${heightClasses[size]} ${className}`}>
      {/* Precision Vector VM Monogram Mark */}
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-square shrink-0 drop-shadow-md"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path
          d="M 12 18 L 32 62 C 34 66 38 66 40 62 L 54 30 C 56 26 59 26 61 30 L 74 62 C 76 66 80 66 82 62 L 88 18"
          stroke="url(#logoGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Text Mark: vifeMS */}
      <span className="font-sans font-bold tracking-tight text-xl sm:text-2xl flex items-center leading-none">
        <span style={{ color: textColor }} className="font-semibold tracking-tighter">
          vife
        </span>
        <span style={{ color: msColor }} className="font-extrabold tracking-tight ml-0.5">
          MS
        </span>
      </span>
    </div>
  );
}

export default VifeMSLogo;
