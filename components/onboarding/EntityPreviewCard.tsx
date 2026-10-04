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
    <div className="group rounded-2xl bg-white border border-slate-200 hover:border-slate-400 transition-all p-5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Entity Card Header */}
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
                  className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-extrabold text-base w-full focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3
                  onDoubleClick={() => setIsEditingName(true)}
                  className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight hover:text-black cursor-pointer truncate"
                  title="Double click or tap edit to rename entity"
                >
                  {entity.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                  title="Rename entity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {entity.description && (
              <p className="text-xs text-slate-600 mt-1 leading-normal line-clamp-2">
                {entity.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
              Entity
            </span>
            <button
              type="button"
              onClick={() => onRemoveEntity(entity.id)}
              className="text-slate-400 hover:text-red-600 transition-colors p-1"
              title="Remove this entity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="my-4 border-t border-slate-100"></div>

        {/* Dynamic Fields List */}
        <FieldPreview fields={entity.fields} onUpdateFields={handleUpdateFields} />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>{entity.fields.length} Configured Attributes</span>
        <span className="text-slate-500 font-semibold">AI Schema</span>
      </div>
    </div>
  );
}
