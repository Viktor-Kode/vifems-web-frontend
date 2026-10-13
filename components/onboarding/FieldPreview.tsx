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
    onUpdateFields(fields.map((f) => (f.id === fieldId ? { ...f, name: editingName.trim() } : f)));
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
      <div
        className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2"
        style={{ color: "#A2B2CB" }}
      >
        <span>Field Label</span>
        <span>Data Type</span>
      </div>

      {fields.map((field) => {
        const isEditing = editingFieldId === field.id;

        return (
          <div
            key={field.id}
            className="group flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs"
            style={{ background: "#F4F6FA", borderColor: "#D3DBE8" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#A2B2CB")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D3DBE8")}
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
                  className="px-2 py-1 rounded focus:outline-none w-full border text-xs"
                  style={{ background: "#FFFFFF", borderColor: "#2563EB", color: "#0E1A2E" }}
                />
              ) : (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    onClick={() => handleStartEdit(field)}
                    className="font-semibold cursor-pointer truncate"
                    style={{ color: "#0E1A2E" }}
                    title="Click to rename field"
                  >
                    {field.name}
                  </span>
                  {field.required && (
                    <span className="font-bold text-[10px]" style={{ color: "#475670" }} title="Required field">
                      *
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(field)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    style={{ color: "#A2B2CB" }}
                    title="Edit field name"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {field.type === "Select" && field.options && field.options.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono border hidden sm:inline"
                  style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#475670" }}
                  title={field.options.join(", ")}
                >
                  {field.options.length} options
                </span>
              )}
              {field.type === "Relation" && (field.targetModule || field.relatedEntityId) && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono border hidden sm:inline"
                  style={{ background: "#E2EBFF", borderColor: "#D3DBE8", color: "#2563EB" }}
                >
                  → {field.targetModule || field.relatedEntityId}
                </span>
              )}
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#475670" }}
              >
                {field.type}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveField(field.id)}
                className="opacity-0 group-hover:opacity-100 transition-all p-0.5"
                style={{ color: "#A2B2CB" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A2B2CB")}
                title="Remove field"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add Field */}
      {isAdding ? (
        <div
          className="mt-2 p-2.5 rounded-xl border flex flex-col sm:flex-row gap-2"
          style={{ background: "#F4F6FA", borderColor: "#D3DBE8" }}
        >
          <input
            type="text"
            placeholder="Field name (e.g., Status, Price, Date)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none"
            style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#0E1A2E" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#D3DBE8")}
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
            className="px-3 py-1.5 rounded-lg border text-xs focus:outline-none"
            style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#0E1A2E" }}
          >
            <option value="Text">Text</option>
            <option value="Long text">Long text</option>
            <option value="Number">Number</option>
            <option value="Decimal">Decimal</option>
            <option value="Currency">Currency</option>
            <option value="Date">Date</option>
            <option value="Date & Time">Date &amp; Time</option>
            <option value="Boolean">Boolean</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Select">Select</option>
            <option value="Relation">Relation</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAddField}
              className="px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors"
              style={{ background: "#2563EB" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1.5 text-xs"
              style={{ color: "#475670" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-2 w-full py-1.5 rounded-xl border border-dashed text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#475670" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563EB";
            e.currentTarget.style.color = "#2563EB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#D3DBE8";
            e.currentTarget.style.color = "#475670";
          }}
        >
          <span>+ Add Attribute Field</span>
        </button>
      )}
    </div>
  );
}
