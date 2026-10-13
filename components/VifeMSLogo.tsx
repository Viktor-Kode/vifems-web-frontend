"use client";

import React from "react";

interface VifeMSLogoProps {
  theme?: "light" | "dark";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VifeMSLogo({
  className = "",
  size = "md",
}: VifeMSLogoProps) {
  // Height scaling presets matching the brand proportions
  const heightClasses = {
    sm: "h-7 sm:h-8",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-11",
  };

  const src = "/logo/new.svg";

  return (
    <img
      src={src}
      alt="VifeMS"
      className={`${heightClasses[size]} w-auto object-contain block shrink-0 ${className}`}
    />
  );
}

export default VifeMSLogo;
