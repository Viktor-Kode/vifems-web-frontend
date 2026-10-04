"use client";

import React, { useState } from "react";
import { FieldBlueprint, FieldType } from "@/lib/api/workspace";
import { Pencil, X } from "@/components/Icons";

interface FieldPreviewProps {
  fields: FieldBlueprint[];
  onUpdateFields: (updatedFields: FieldBlueprint[]) => void;
}

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
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        <span>Field Label</span>
        <span>Data Type</span>
      </div>

      {fields.map((field) => {
        const isEditing = editingFieldId === field.id;

        return (
          <div
            key={field.id}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-xs"
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
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none w-full"
                />
              ) : (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    onClick={() => handleStartEdit(field)}
                    className="font-semibold text-slate-900 hover:text-black cursor-pointer truncate"
                    title="Click to rename field"
                  >
                    {field.name}
                  </span>
                  {field.required && (
                    <span className="text-slate-500 font-bold text-[10px]" title="Required field">
                      *
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(field)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5"
                    title="Edit field name"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                {field.type}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveField(field.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all p-0.5"
                title="Remove field"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add Field Inline Control */}
      {isAdding ? (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Field name (e.g., Status, Date)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
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
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1.5 text-slate-600 hover:text-slate-900 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-2 w-full py-1.5 rounded-xl border border-dashed border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
        >
          <span>+ Add Attribute Field</span>
        </button>
      )}
    </div>
  );
}
