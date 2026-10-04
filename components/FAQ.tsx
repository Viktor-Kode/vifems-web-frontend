"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "@/components/Icons";

export const FAQS = [
  {
    question: "How does VifeMS generate my workspace?",
    answer:
      "You simply describe how your business operates in plain English. VifeAI analyzes your description, extracts key domain entities, attributes, and relationships, and automatically provisions a complete, tailor-made management workspace in seconds.",
  },
  {
    question: "Do I need coding or technical database knowledge?",
    answer:
      "No coding required whatsoever. VifeMS abstracts away all database complexity. You deal purely with business terms like Customers, Orders, Products, and Tasks.",
  },
  {
    question: "Can I customize my workspace after it is generated?",
    answer:
      "Yes! You can add, edit, or remove entities, custom fields, and relationships at any time using our visual Schema Editor without writing a single line of code.",
  },
  {
    question: "Is my business data secure and private?",
    answer:
      "Your workspace data is strictly isolated to your organization account. We utilize enterprise-grade encryption and secure access controls to ensure your business records remain entirely private.",
  },
  {
    question: "What happens if my business model changes over time?",
    answer:
      "VifeMS is built to evolve with you. As your operations expand or change, VifeAI can re-architect your workspace structure on demand while preserving your historical records.",
  },
];

export function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <section id="faq" ref={sectionRef} className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div
        className={`text-center mb-12 transition-all duration-700 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          QUESTIONS & ANSWERS
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-600 mt-2 text-base">
          Everything you need to know about VifeMS and AI-native workspace generation.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              style={{ transitionDelay: `${index * 100}ms` }}
              className={`bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-500 transform shadow-2xs ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-900 text-base sm:text-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
