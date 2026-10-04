"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { BusinessTypes, BUSINESS_EXAMPLES, BusinessExample } from "@/components/BusinessTypes";
import { GeneratorDemo } from "@/components/GeneratorDemo";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const [selectedExample, setSelectedExample] = useState<BusinessExample | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <BusinessTypes
          selectedExample={selectedExample}
          onSelectExample={(ex) => setSelectedExample(ex)}
        />
        <GeneratorDemo selectedExample={selectedExample} />
        <HowItWorks />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
