"use client";

import React, { useState } from "react";
import { EntityBlueprint, FieldBlueprint } from "@/lib/api/workspace";
import FieldPreview from "./FieldPreview";
import { Pencil, Trash2 } from "@/components/Icons";

interface EntityPreviewCardProps {
  entity: EntityBlueprint;
  onUpdateEntity: (updatedEntity: EntityBlueprint) => void;
  onRemoveEntity: (entityId: string) => void;
}

export default function EntityPreviewCard({
  entity,
  onUpdateEntity,
  onRemoveEntity,
}: EntityPreviewCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(entity.name);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    onUpdateEntity({ ...entity, name: nameInput.trim() });
    setIsEditingName(false);
  };

  const handleUpdateFields = (updatedFields: FieldBlueprint[]) => {
    onUpdateEntity({ ...entity, fields: updatedFields });
  };

  return (
    <div
      className="group rounded-2xl border transition-all p-5 flex flex-col justify-between"
      style={{ background: "#FFFFFF", borderColor: "#D3DBE8", boxShadow: "0 1px 4px rgba(14,26,46,.06)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#A2B2CB")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D3DBE8")}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="px-2.5 py-1 rounded-lg font-extrabold text-base w-full focus:outline-none border"
                  style={{ background: "#F4F6FA", borderColor: "#2563EB", color: "#0E1A2E" }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3
                  onDoubleClick={() => setIsEditingName(true)}
                  className="text-base sm:text-lg font-extrabold tracking-tight cursor-pointer truncate"
                  style={{ fontFamily: "'Familjen Grotesk', system-ui, sans-serif", color: "#0E1A2E" }}
                  title="Double click to rename"
                >
                  {entity.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="transition-colors p-1"
                  style={{ color: "#A2B2CB" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#475670")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#A2B2CB")}
                  title="Rename entity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {entity.description && (
              <p className="text-xs mt-1 leading-normal line-clamp-2" style={{ color: "#475670" }}>
                {entity.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
              style={{ background: "#E2EBFF", borderColor: "#D3DBE8", color: "#2563EB" }}
            >
              Entity
            </span>
            <button
              type="button"
              onClick={() => onRemoveEntity(entity.id)}
              className="transition-colors p-1"
              style={{ color: "#A2B2CB" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A2B2CB")}
              title="Remove this entity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="my-4 border-t" style={{ borderColor: "#EAEFF7" }} />

        {/* System Primary Key metadata */}
        <div
          className="mb-3 px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-[11px]"
          style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <span className="font-mono font-semibold text-slate-600 flex items-center gap-1.5">
            <span className="text-xs">🔑</span>
            <span>id</span>
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-slate-600 bg-white"
            style={{ borderColor: "#CBD5E1" }}
            title="Auto-generated stable record identifier (UUID / platform-managed)"
          >
            System Primary Key
          </span>
        </div>

        {/* Fields */}
        <FieldPreview fields={entity.fields} onUpdateFields={handleUpdateFields} />
      </div>

      <div
        className="mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono"
        style={{ borderColor: "#EAEFF7", color: "#A2B2CB" }}
      >
        <span>{entity.fields.length} Configured Attributes</span>
        <span className="font-semibold">AI Schema</span>
      </div>
    </div>
  );
}
