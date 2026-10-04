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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
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
                className="px-3 py-1 bg-white border border-slate-300 rounded-xl text-slate-900 font-extrabold text-2xl sm:text-3xl focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight hover:text-black cursor-pointer flex items-center gap-2.5"
                title="Click to edit workspace name"
              >
                <span>{blueprint.workspaceName}</span>
                <Pencil className="w-4 h-4 text-slate-400" />
              </h1>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Review AI-generated domain models. You can rename entities, tweak fields, or add models before creating your workspace.
          </p>
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToPrompt}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Refine Description</span>
          </button>
          <button
            type="button"
            onClick={handleAddEntity}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
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
      <div className="sticky bottom-4 p-4 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600 text-center sm:text-left font-medium">
          <span className="text-slate-900 font-extrabold">✓ Blueprint Verified</span> • Ready to provision {blueprint.entities.length} dynamic models
        </div>

        <button
          type="button"
          onClick={onConfirmProvision}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
        >
          <span>Create My Workspace</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
