"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VifeMSLogo from "@/components/VifeMSLogo";
import { generateBlueprint, provisionWorkspace, Blueprint, EntityBlueprint } from "@/lib/api/workspace";
import "./onboarding.css";

type Step = "prompt" | "generating" | "review" | "provisioning" | "ready";

const STORAGE_KEY = "vifems_onboarding";

const GEN_LABELS = [
  "Understanding your business",
  "Identifying what you need to manage",
  "Designing your workspace",
  "Preparing how everything connects",
];
const PROV_LABELS = [
  "Creating your workspace",
  "Setting up your records",
  "Building your forms and tables",
];

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

/* ── Progress list component ── */
function ProgList({
  labels,
  isApiDone,
  onAllDone,
}: {
  labels: string[];
  isApiDone: boolean;
  onAllDone: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const atEnd = current >= labels.length - 1;

  // Advance one item every 1600ms; stop at last item and wait for isApiDone
  useEffect(() => {
    if (atEnd) return;
    const t = setTimeout(() => setCurrent((p) => p + 1), 1600);
    return () => clearTimeout(t);
  }, [current, atEnd]);

  // Once at end and API done, fire completion
  useEffect(() => {
    if (!atEnd || !isApiDone) return;
    const t = setTimeout(() => onAllDone(), 400);
    return () => clearTimeout(t);
  }, [atEnd, isApiDone, onAllDone]);

  return (
    <ul className="prog" aria-live="polite">
      {labels.map((label, i) => {
        const isDone = i < current;
        const isNow  = i === current;
        return (
          <li key={i} className={isDone ? "ok" : isNow ? "now" : ""}>
            <span className="dot">{isDone ? "✓" : ""}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Main onboarding page ── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]                 = useState<Step>("prompt");
  const [desc, setDesc]                 = useState("");
  const [blueprint, setBlueprint]       = useState<Blueprint | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string>("");
  const [genError, setGenError]         = useState(false);
  const [genErrorMessage, setGenErrorMessage] = useState("");
  const [provError, setProvError]       = useState(false);
  const [provErrorMessage, setProvErrorMessage] = useState("");
  const [genDone, setGenDone]           = useState(false);
  const [provDone, setProvDone]         = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Session restore
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.desc) setDesc(p.desc);
          if (p.blueprint) {
            setBlueprint(p.blueprint);
            setWorkspaceName(p.blueprint.workspaceName || "");
            setStep("review");
            return;
          }
        }
      } catch { /* ignore */ }
      setStep("prompt");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ desc, blueprint }));
    } catch { /* ignore */ }
  }, [desc, blueprint]);

  // Auto-redirect to dashboard when ready
  useEffect(() => {
    if (step === "ready" && createdWorkspaceId) {
      const t = setTimeout(() => {
        router.push(`/dashboard/${createdWorkspaceId}`);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [step, createdWorkspaceId, router]);

  // Char count / hint
  const trimLen  = desc.trim().length;
  const charCount = desc.length;
  const hint = trimLen === 0
    ? "At least 50 characters"
    : trimLen < 50
    ? `${50 - trimLen} more characters to go`
    : "Looks good";
  const canSubmit = trimLen >= 50 && !isSubmitting;

  // Step nav number
  const stepN = { prompt: 1, generating: 1, review: 2, provisioning: 3, ready: 3 }[step] ?? 1;

  /* ── Step 1: generate blueprint ── */
  const handleGenerate = async () => {
    if (isSubmitting || trimLen < 50) return;
    setIsSubmitting(true);
    setGenError(false);
    setGenErrorMessage("");
    setGenDone(false);
    setStep("generating");
    try {
      const bp = await generateBlueprint(desc.trim());
      setBlueprint(bp);
      setWorkspaceName(bp.workspaceName || "");
      setGenDone(true);
    } catch (error: unknown) {
      if (error instanceof Error && "status" in error && error.status === 401) {
        router.replace("/login");
        return;
      }
      setGenErrorMessage(error instanceof Error ? error.message : "Failed to generate workspace blueprint. Your description has been preserved.");
      setGenError(true);
      setStep("prompt");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGenComplete = useCallback(() => setStep("review"), []);

  /* ── Step 2: provision ── */
  const handleProvision = async () => {
    if (!blueprint || isSubmitting) return;
    setIsSubmitting(true);
    setProvError(false);
    setProvErrorMessage("");
    setProvDone(false);
    setStep("provisioning");
    try {
      const res = await provisionWorkspace({
        ...blueprint,
        workspaceName: workspaceName.trim() || blueprint.workspaceName,
        description: desc,
      });
      const wsId = res.workspaceId;
      setCreatedWorkspaceId(wsId);
      setProvDone(true);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch { /* ignore */ }
    } catch (error: unknown) {
      if (error instanceof Error && "status" in error && error.status === 401) {
        router.replace("/login");
        return;
      }
      setProvErrorMessage(error instanceof Error ? error.message : "Failed to provision workspace. Your reviewed blueprint is saved. You can retry.");
      setProvError(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleProvComplete = useCallback(() => setStep("ready"), []);

  /* ── Entity editing ── */
  const updateEntity = (updated: EntityBlueprint) => {
    if (!blueprint) return;
    setBlueprint({
      ...blueprint,
      entities: blueprint.entities.map((e) => (e.id === updated.id ? updated : e)),
    });
  };

  const removeEntity = (id: string) => {
    if (!blueprint) return;
    const targetEntity = blueprint.entities.find((e) => e.id === id);
    const targetSlug = targetEntity?.slug || "";

    // Clean up entities and relation fields referencing the deleted entity
    const updatedEntities = blueprint.entities
      .filter((e) => e.id !== id)
      .map((e) => ({
        ...e,
        fields: e.fields.filter(
          (f) =>
            f.type !== "Relation" ||
            (f.targetModule !== id &&
              f.targetModule !== targetSlug &&
              f.relatedEntityId !== id &&
              f.relatedEntityId !== targetSlug)
        ),
      }));

    // Clean up relationships
    const updatedRelationships = (blueprint.relationships || []).filter(
      (r) =>
        r.fromEntityId !== id &&
        r.fromEntityId !== targetSlug &&
        r.sourceModule !== targetSlug &&
        r.sourceModule !== id &&
        r.toEntityId !== id &&
        r.toEntityId !== targetSlug &&
        r.targetModule !== targetSlug &&
        r.targetModule !== id
    );

    setBlueprint({
      ...blueprint,
      workspaceName: blueprint.workspaceName || "",
      description: blueprint.description || "",
      entities: updatedEntities,
      relationships: updatedRelationships,
    });
  };

  const removeField = (entity: EntityBlueprint, fieldIdx: number) => {
    if (!blueprint) return;
    const fieldToRemove = entity.fields[fieldIdx];
    const updatedEntity = {
      ...entity,
      fields: entity.fields.filter((_, i) => i !== fieldIdx),
    };

    const cleanedRelationships = (blueprint.relationships || []).filter((r) => {
      const isThisSource =
        r.fromEntityId === entity.id ||
        r.fromEntityId === entity.slug ||
        r.sourceModule === entity.slug;
      if (isThisSource && r.sourceField && fieldToRemove) {
        return r.sourceField !== fieldToRemove.name && r.sourceField !== fieldToRemove.id;
      }
      return true;
    });

    setBlueprint({
      ...blueprint,
      workspaceName: blueprint.workspaceName || "",
      description: blueprint.description || "",
      entities: blueprint.entities.map((e) => (e.id === updatedEntity.id ? updatedEntity : e)),
      relationships: cleanedRelationships,
    });
  };

  return (
    <div className="ob-root">
      {/* ── Header ── */}
      <header className="ob-header">
        <Link href="/" className="ob-logo" style={{ textDecoration: "none" }}>
          <VifeMSLogo theme="light" size="sm" />
        </Link>
        <nav className="ob-steps" aria-label="Setup progress">
          <span className={stepN > 1 ? "done" : stepN === 1 ? "on" : ""}>
            <b />&nbsp;Describe
          </span>
          <span className={stepN > 2 ? "done" : stepN === 2 ? "on" : ""}>
            <b />&nbsp;Review
          </span>
          <span className={stepN >= 3 ? "on" : ""}>
            <b />&nbsp;Launch
          </span>
        </nav>
      </header>

      <main className="ob-main">

        {/* ── Step 1: Describe ── */}
        {step === "prompt" && (
          <div className="prompt-wrap">
            <div className="prompt-main">
              <h1>Tell VifeMS about your business</h1>
              <p className="sub">
                Describe what your business does and how you manage it. VifeAI will use this to design your workspace.
              </p>

              {genError && (
                <div className="err" role="alert">
                  {genErrorMessage || "We couldn't build your workspace blueprint yet. Something went wrong while analyzing your business description. Your text is still here."}
                </div>
              )}

              <div className="box">
                <textarea
                  maxLength={5000}
                  aria-label="Business description"
                  placeholder="Describe your business operations, what you sell or manage, and the daily records or workflows you want to organize..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <div className="meta">
                  <span>{hint}</span>
                  <span>{charCount} / 5000</span>
                </div>
              </div>

              <div className="row">
                <button className="btn" disabled={!canSubmit} onClick={handleGenerate}>
                  Design my workspace
                </button>
              </div>
            </div>

            <aside className="prompt-side">
              <div className="side-card">
                <div className="try">
                  <div className="side-label">Need ideas?</div>
                  <div className="side-sub">Tap an example to see how to write it, then make it yours.</div>
                  <div className="chips-wrap">
                    {CHIPS.map((c) => (
                      <button key={c.label} className="chip" onClick={() => setDesc(c.text)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="side-guide">
                  <div className="side-label">What should I mention?</div>
                  <ul>
                    <li>What you sell or manage</li>
                    <li>What you need to track every day</li>
                    <li>How your team shares work today</li>
                    <li>Paperwork you&apos;d like to organize</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── Generating ── */}
        {step === "generating" && (
          <div className="narrow center">
            <h1>Designing your workspace</h1>
            <p className="sub">This usually takes a few seconds.</p>
            <ProgList labels={GEN_LABELS} isApiDone={genDone} onAllDone={handleGenComplete} />
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === "review" && blueprint && (
          <div>
            <input
              className="title-in"
              aria-label="Workspace name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value || workspaceName)}
            />
            <p className="sub" style={{ margin: "10px 0 0" }}>
              Here&apos;s what VifeAI set up. Rename or remove anything you don&apos;t need. You can change more later in Settings.
            </p>


            {/* Entity grid */}
            <div className="grid">
              {blueprint.entities.map((entity) => (
                <article key={entity.id} className="ent">
                  <div className="ent-h">
                    <input
                      aria-label={`Rename ${entity.name}`}
                      defaultValue={entity.name}
                      onBlur={(e) =>
                        updateEntity({ ...entity, name: e.target.value.trim() || entity.name })
                      }
                    />
                    <button
                      className="x"
                      type="button"
                      aria-label={`Remove ${entity.name}`}
                      onClick={() => removeEntity(entity.id)}
                    >
                      ×
                    </button>
                  </div>
                  {entity.description && <p>{entity.description}</p>}
                  {(entity.fields || []).map((f, fi) => (
                    <div key={f.id || fi} className="f">
                      <span>{f.name}</span>
                      <span className={`tag${f.type === "Relation" ? " rel" : ""}`}>{f.type}</span>
                      <button
                        className="x"
                        type="button"
                        aria-label={`Remove field ${f.name}`}
                        onClick={() => removeField(entity, fi)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </article>
              ))}
            </div>

            {blueprint.entities.length === 0 && (
              <div className="err" role="alert">
                We couldn&apos;t validate this workspace structure. Adjust your records above, or go back and refine your description.
              </div>
            )}

            <div className="bar">
              <button className="btn ghost" onClick={() => setStep("prompt")}>
                Edit description
              </button>
              <button
                className="btn"
                disabled={blueprint.entities.length === 0}
                onClick={handleProvision}
              >
                Create my workspace
              </button>
            </div>
          </div>
        )}

        {/* ── Provisioning ── */}
        {step === "provisioning" && (
          <div className="narrow center">
            <h1>Setting things up</h1>
            <p className="sub">Almost there.</p>
            <ProgList labels={PROV_LABELS} isApiDone={provDone} onAllDone={handleProvComplete} />
            {provError && (
              <div className="err" role="alert">
                {provErrorMessage || "Your workspace couldn't be created at this moment. Your blueprint is saved."}
                <br />
                <button className="btn" style={{ marginTop: 10 }} onClick={handleProvision}>
                  Retry provisioning
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Ready ── */}
        {step === "ready" && (
          <div className="narrow center">
            <div className="ready-ic" aria-hidden="true">✓</div>
            <h1>{workspaceName}</h1>
            <p className="sub">is ready for daily operations.</p>
            <Link
              href={createdWorkspaceId ? `/dashboard/${createdWorkspaceId}` : "/dashboard"}
              className="btn"
            >
              Open workspace
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
