"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ShoppingBag,
  GraduationCap,
  Car,
  Briefcase,
} from "@/components/Icons";

export interface BusinessExample {
  id: string;
  title: string;
  icon: React.ReactNode;
  prompt: string;
  modules: string[];
  tags: string[];
}

export const BUSINESS_EXAMPLES: BusinessExample[] = [
  {
    id: "driving-school",
    title: "Driving School",
    icon: <Car className="w-5 h-5 text-slate-700" />,
    prompt: "I run a driving school. I manage students, instructors and vehicles. Students book lessons and pay per lesson.",
    modules: ["Students", "Instructors", "Vehicles", "Driving Lessons", "Payments"],
    tags: ["Students", "Instructors", "Vehicles", "Lessons", "Payments"],
  },
  {
    id: "retail",
    title: "Retail",
    icon: <ShoppingBag className="w-5 h-5 text-slate-700" />,
    prompt: "I run a retail store selling electronics. I need to track products, suppliers, customer sales, and store inventory stock.",
    modules: ["Products", "Suppliers", "Sales", "Inventory", "Customers"],
    tags: ["Products", "Suppliers", "Sales", "Inventory", "Customers"],
  },
  {
    id: "training-centre",
    title: "Training Centre",
    icon: <GraduationCap className="w-5 h-5 text-slate-700" />,
    prompt: "I manage a vocational training centre with course enrollments, student attendance tracking, trainers, and tuition fee payments.",
    modules: ["Students", "Courses", "Instructors", "Attendance", "Payments"],
    tags: ["Students", "Courses", "Attendance", "Payments"],
  },
  {
    id: "service-business",
    title: "Service Business",
    icon: <Briefcase className="w-5 h-5 text-slate-700" />,
    prompt: "I operate a digital consulting agency. I manage client accounts, ongoing project deliverables, invoices, and team tasks.",
    modules: ["Clients", "Projects", "Invoices", "Tasks", "Services"],
    tags: ["Clients", "Projects", "Invoices", "Tasks"],
  },
];

interface BusinessTypesProps {
  selectedExample: BusinessExample | null;
  onSelectExample: (example: BusinessExample) => void;
}

export function BusinessTypes({ selectedExample, onSelectExample }: BusinessTypesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-100/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        <div
          className={`mb-8 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Works for different types of businesses
          </h2>
          <p className="text-slate-600 mt-1 text-base">
            Click any example to try it in the generator below.
          </p>
        </div>

        {/* Business Cards Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BUSINESS_EXAMPLES.map((example, idx) => {
            const isSelected = selectedExample?.id === example.id;
            return (
              <div
                key={example.id}
                onClick={() => onSelectExample(example)}
                style={{ transitionDelay: `${idx * 120}ms` }}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-500 transform bg-white flex flex-col justify-between ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${
                  isSelected
                    ? "border-slate-900 ring-2 ring-slate-900/10 shadow-md"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60">
                      {example.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {example.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {example.tags.join(" · ")}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{isSelected ? "Selected" : "Try template"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
