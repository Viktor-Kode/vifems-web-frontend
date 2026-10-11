"use client";

import React, { useState } from "react";
import { Blueprint, EntityBlueprint } from "@/lib/api/workspace";
import EntityPreviewCard from "./EntityPreviewCard";
import RelationshipPreview from "./RelationshipPreview";
import { ArrowRight, Pencil, ArrowLeft } from "@/components/Icons";

interface BlueprintReviewProps {
  blueprint: Blueprint;
  onUpdateBlueprint: (updatedBlueprint: Blueprint) => void;
  onConfirmProvision: () => void;
  onBackToPrompt: () => void;
}

export default function BlueprintReview({
  blueprint,
  onUpdateBlueprint,
  onConfirmProvision,
  onBackToPrompt,
}: BlueprintReviewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(blueprint.workspaceName);

  const handleSaveTitle = () => {
    if (!titleInput.trim()) return;
    onUpdateBlueprint({ ...blueprint, workspaceName: titleInput.trim() });
    setIsEditingTitle(false);
  };

  const handleUpdateEntity = (updatedEntity: EntityBlueprint) => {
    onUpdateBlueprint({
      ...blueprint,
      entities: blueprint.entities.map((e) => (e.id === updatedEntity.id ? updatedEntity : e)),
    });
  };

  const handleRemoveEntity = (entityId: string) => {
    onUpdateBlueprint({
      ...blueprint,
      entities: blueprint.entities.filter((e) => e.id !== entityId),
      relationships: (blueprint.relationships || []).filter(
        (r) => r.fromEntityId !== entityId && r.toEntityId !== entityId
      ),
    });
  };

  const handleAddEntity = () => {
    const newId = "ent_" + Date.now();
    const newEntity: EntityBlueprint = {
      id: newId,
      name: "New Data Model",
      description: "Custom operational entity created by user.",
      fields: [
        { id: "f_1", name: "Name", type: "Text", required: true },
        { id: "f_2", name: "Status", type: "Select", options: ["Draft", "Active", "Archived"] },
      ],
    };
    onUpdateBlueprint({ ...blueprint, entities: [...blueprint.entities, newEntity] });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Banner */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b"
        style={{ borderColor: "#D3DBE8" }}
      >
        <div>
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
            style={{ background: "#E2EBFF", borderColor: "#D3DBE8", color: "#2563EB" }}
          >
            Step 2 of 3 • Inspect &amp; Confirm Blueprint
          </div>
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className="px-3 py-1 rounded-xl font-extrabold text-2xl sm:text-3xl focus:outline-none border"
                style={{ background: "#FFFFFF", borderColor: "#2563EB", color: "#0E1A2E" }}
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl sm:text-3xl font-extrabold tracking-tight cursor-pointer flex items-center gap-2.5"
                style={{ fontFamily: "'Familjen Grotesk', system-ui, sans-serif", color: "#0E1A2E" }}
                title="Click to edit workspace name"
              >
                <span>{blueprint.workspaceName}</span>
                <Pencil className="w-4 h-4" style={{ color: "#A2B2CB" }} />
              </h1>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: "#475670" }}>
            Review AI-generated domain models. Rename entities, tweak fields, or add models before creating your workspace.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToPrompt}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5"
            style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#475670" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F4F6FA";
              e.currentTarget.style.borderColor = "#A2B2CB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.borderColor = "#D3DBE8";
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Refine Description</span>
          </button>
          <button
            type="button"
            onClick={handleAddEntity}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-white"
            style={{ background: "#2563EB" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
          >
            + Add Model
          </button>
        </div>
      </div>

      {/* Relationships */}
      <RelationshipPreview
        relationships={blueprint.relationships || []}
        entities={blueprint.entities}
      />

      {/* Entity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {blueprint.entities.map((entity) => (
          <EntityPreviewCard
            key={entity.id}
            entity={entity}
            onUpdateEntity={handleUpdateEntity}
            onRemoveEntity={handleRemoveEntity}
          />
        ))}
      </div>

      {/* Sticky CTA */}
      <div
        className="sticky bottom-4 p-4 rounded-2xl border backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: "rgba(255,255,255,0.96)", borderColor: "#D3DBE8" }}
      >
        <div className="text-xs text-center sm:text-left font-medium" style={{ color: "#475670" }}>
          <span className="font-extrabold" style={{ color: "#0E1A2E" }}>✓ Blueprint Verified</span>
          {" "}• Ready to provision {blueprint.entities.length} dynamic models
        </div>

        <button
          type="button"
          onClick={onConfirmProvision}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
          style={{ background: "#2563EB" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
        >
          <span>Create My Workspace</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
