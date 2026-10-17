"use client";

import React, { useState } from "react";

interface BusinessDescriptionStepProps {
  initialDescription: string;
  onSubmit: (description: string) => void;
  error?: string | null;
}

const CHIPS = [
  {
    label: "Consulting firm",
    text: "I run a consulting agency. I need to track client accounts, active projects, deliverables, team assignments, and billable hours.",
  },
  {
    label: "Medical clinic",
    text: "I run a small medical clinic. I need to keep patient records, book appointments with our doctors, track prescriptions, and send invoices after each visit.",
  },
  {
    label: "Auto repair shop",
    text: "I own an auto repair shop. I track customer vehicles, repair jobs, spare parts in stock, and invoices. Mechanics need to see which jobs are open.",
  },
];

export default function BusinessDescriptionStep({
  initialDescription,
  onSubmit,
  error,
}: BusinessDescriptionStepProps) {
  const [localDraft, setLocalDraft] = useState<{ initialValue: string; value: string } | null>(null);
  const description = localDraft?.initialValue === initialDescription
    ? localDraft.value
    : initialDescription || "";

  const charCount = description.length;
  const trimLen = description.trim().length;
  const isReady = trimLen >= 50;

  const hint =
    trimLen === 0
      ? "At least 50 characters"
      : trimLen < 50
      ? `${50 - trimLen} more characters to go`
      : "Looks good";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    onSubmit(description.trim());
  };

  return (
    <div className="ob-narrow">
      <h1 className="ob-h1">Tell VifeMS about your business</h1>
      <p className="ob-sub">
        Describe what your business does and how you manage it. VifeAI will use
        this to design your workspace.
      </p>

      {error && (
        <div className="ob-err" role="alert">
          {error} Your text is still here.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="ob-box">
          <textarea
            className="ob-ta"
            maxLength={5000}
            aria-label="Business description"
            placeholder="Describe your business operations, what you sell or manage, and the daily records or workflows you want to organize..."
            value={description}
            onChange={(e) => setLocalDraft({ initialValue: initialDescription, value: e.target.value })}
          />
          <div className="ob-meta">
            <span>{hint}</span>
            <span>{charCount} / 5000</span>
          </div>
        </div>

        <div className="ob-row">
          <button className="ob-btn" type="submit" disabled={!isReady}>
            Design my workspace
          </button>
        </div>
      </form>

      <p className="ob-try-label">
        Need ideas? Tap an example to see how to write it, then make it yours.
      </p>
      <div className="ob-chips">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            className="ob-chip"
            onClick={() => setLocalDraft({ initialValue: initialDescription, value: c.text })}
          >
            {c.label}
          </button>
        ))}
      </div>

      <details className="ob-details">
        <summary>What should I mention?</summary>
        <ul>
          <li>What you sell or manage</li>
          <li>What you need to track every day</li>
          <li>How your team shares work today</li>
          <li>Paperwork you&apos;d like to organize</li>
        </ul>
      </details>
    </div>
  );
}
