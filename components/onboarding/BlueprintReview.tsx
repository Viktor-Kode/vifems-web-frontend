"use client";

import React, { useState } from "react";
import { Blueprint, EntityBlueprint } from "@/lib/api/workspace";
import EntityPreviewCard from "./EntityPreviewCard";
import RelationshipPreview from "./RelationshipPreview";

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
    const updatedEntities = blueprint.entities.map((e) =>
      e.id === updatedEntity.id ? updatedEntity : e
    );
    onUpdateBlueprint({ ...blueprint, entities: updatedEntities });
  };

  const handleRemoveEntity = (entityId: string) => {
    const updatedEntities = blueprint.entities.filter((e) => e.id !== entityId);
    const updatedRelationships = (blueprint.relationships || []).filter(
      (r) => r.fromEntityId !== entityId && r.toEntityId !== entityId
    );
    onUpdateBlueprint({
      ...blueprint,
      entities: updatedEntities,
      relationships: updatedRelationships,
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
    onUpdateBlueprint({
      ...blueprint,
      entities: [...blueprint.entities, newEntity],
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Step Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Step 2 of 3 • Inspect & Confirm Blueprint
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
                className="px-3 py-1 bg-slate-900 border border-indigo-500 rounded-xl text-white font-extrabold text-2xl sm:text-3xl focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight hover:text-indigo-300 cursor-pointer flex items-center gap-2"
                title="Click to edit workspace name"
              >
                <span>{blueprint.workspaceName}</span>
                <span className="text-slate-500 text-sm font-normal">✏️</span>
              </h1>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review AI-generated domain models. You can rename entities, tweak fields, or add models before creating your workspace.
          </p>
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToPrompt}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-all cursor-pointer"
          >
            ← Refine Description
          </button>
          <button
            type="button"
            onClick={handleAddEntity}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
          >
            + Add Model
          </button>
        </div>
      </div>

      {/* Structural Relationships Diagram */}
      <RelationshipPreview
        relationships={blueprint.relationships || []}
        entities={blueprint.entities}
      />

      {/* Entity Cards Grid */}
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

      {/* Primary Provision CTA */}
      <div className="sticky bottom-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          <span className="text-emerald-400 font-bold">✓ Blueprint Verified</span> • Ready to provision {blueprint.entities.length} dynamic operational models
        </div>

        <button
          type="button"
          onClick={onConfirmProvision}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer flex items-center justify-center gap-2 group"
        >
          <span>Create My Workspace</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}
