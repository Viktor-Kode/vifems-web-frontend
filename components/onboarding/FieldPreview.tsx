"use client";

import React, { useState } from "react";
import { FieldBlueprint, FieldType } from "@/lib/api/workspace";

interface FieldPreviewProps {
  fields: FieldBlueprint[];
  onUpdateFields: (updatedFields: FieldBlueprint[]) => void;
}

const TYPE_COLORS: Record<FieldType, { bg: string; text: string; border: string }> = {
  Text: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  Number: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  Currency: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  Date: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  Boolean: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  Select: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  Relation: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

export default function FieldPreview({ fields, onUpdateFields }: FieldPreviewProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("Text");

  const handleStartEdit = (field: FieldBlueprint) => {
    setEditingFieldId(field.id);
    setEditingName(field.name);
  };

  const handleSaveEdit = (fieldId: string) => {
    if (!editingName.trim()) return;
    const updated = fields.map((f) =>
      f.id === fieldId ? { ...f, name: editingName.trim() } : f
    );
    onUpdateFields(updated);
    setEditingFieldId(null);
  };

  const handleRemoveField = (fieldId: string) => {
    onUpdateFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    const newField: FieldBlueprint = {
      id: "f_" + Date.now(),
      name: newFieldName.trim(),
      type: newFieldType,
    };
    onUpdateFields([...fields, newField]);
    setNewFieldName("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        <span>Field Label</span>
        <span>Data Type</span>
      </div>

      {fields.map((field) => {
        const typeStyle = TYPE_COLORS[field.type] || TYPE_COLORS.Text;
        const isEditing = editingFieldId === field.id;

        return (
          <div
            key={field.id}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
          >
            <div className="flex items-center gap-2 flex-1 mr-3 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveEdit(field.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(field.id)}
                  className="px-2 py-1 bg-slate-800 border border-indigo-500 rounded text-slate-100 focus:outline-none w-full"
                />
              ) : (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    onClick={() => handleStartEdit(field)}
                    className="font-medium text-slate-200 hover:text-white cursor-pointer truncate"
                    title="Click to rename field"
                  >
                    {field.name}
                  </span>
                  {field.required && (
                    <span className="text-rose-400 font-bold text-[10px]" title="Required field">
                      *
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(field)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity"
                    title="Edit field name"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
              >
                {field.type}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveField(field.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1"
                title="Remove field"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* Add Field Inline Control */}
      {isAdding ? (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Field name (e.g., Status, Date)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="Text">Text</option>
            <option value="Number">Number</option>
            <option value="Currency">Currency</option>
            <option value="Date">Date</option>
            <option value="Boolean">Boolean</option>
            <option value="Select">Select</option>
            <option value="Relation">Relation</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAddField}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-2 w-full py-1.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>+ Add Attribute Field</span>
        </button>
      )}
    </div>
  );
}
