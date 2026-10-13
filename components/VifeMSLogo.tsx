"use client";

import React, { useId } from "react";

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
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, "");

  const iconSizes = {
    sm: 30,
    md: 36,
    lg: 42,
  };

  const fontSizes = {
    sm: "19px",
    md: "22px",
    lg: "26px",
  };

  const s = iconSizes[size];

  return (
    <span
      className={`brand inline-flex items-center gap-2.5 no-underline select-none shrink-0 ${className}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <svg
        viewBox="0 0 256 256"
        width={s}
        height={s}
        className="block shrink-0 rounded-[9px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3b78ff" />
            <stop offset="1" stopColor="#13226a" />
          </linearGradient>
          <linearGradient id={`gl-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`tl-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7cf5df" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <rect width="256" height="256" rx="60" fill={`url(#bg-${id})`} />
        <rect width="256" height="256" rx="60" fill={`url(#gl-${id})`} />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M62 68 L128 176 L194 68" stroke="#fff" strokeWidth="28" />
          <path d="M97 98 L128 148 L159 98" stroke={`url(#tl-${id})`} strokeWidth="16" />
        </g>
      </svg>
      <span
        className="brand-name"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: fontSizes[size],
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: isDark ? "#f1f5ff" : "#13226a",
        }}
      >
        Vife
        <b
          style={{
            fontWeight: 700,
            color: isDark ? "#6e9bff" : "#1d4ed8",
          }}
        >
          MS
        </b>
      </span>
    </span>
  );
}

export default VifeMSLogo;
