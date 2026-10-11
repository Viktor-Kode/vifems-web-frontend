"use client";

import React from "react";
import { BlueprintRelationship, EntityBlueprint } from "@/lib/api/workspace";
import { Link2 } from "@/components/Icons";

interface RelationshipPreviewProps {
  relationships: BlueprintRelationship[];
  entities: EntityBlueprint[];
}

export default function RelationshipPreview({
  relationships,
  entities,
}: RelationshipPreviewProps) {
  if (!relationships || relationships.length === 0) return null;

  const entityMap = new Map(entities.map((e) => [e.id, e.name]));

  return (
    <div
      className="rounded-2xl p-5 mb-8 border"
      style={{ background: "#FFFFFF", borderColor: "#D3DBE8", boxShadow: "0 1px 4px rgba(14,26,46,.06)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4" style={{ color: "#475670" }} />
        <h4
          className="text-xs font-extrabold uppercase tracking-wider"
          style={{ color: "#0E1A2E" }}
        >
          Inferred Business Workflow &amp; Relationships
        </h4>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-xs">
        {relationships.map((rel, idx) => {
          const fromName = entityMap.get(rel.fromEntityId) || "Entity A";
          const toName = entityMap.get(rel.toEntityId) || "Entity B";

          return (
            <React.Fragment key={rel.id || idx}>
              {idx > 0 && (
                <span className="font-bold px-1" style={{ color: "#D3DBE8" }}>•</span>
              )}
              <div
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{ background: "#F4F6FA", borderColor: "#D3DBE8", color: "#0E1A2E" }}
              >
                <span className="font-bold" style={{ color: "#0E1A2E" }}>{fromName}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ background: "#FFFFFF", borderColor: "#D3DBE8", color: "#475670" }}
                >
                  ({rel.label})
                </span>
                <span style={{ color: "#A2B2CB" }}>──►</span>
                <span className="font-bold" style={{ color: "#0E1A2E" }}>{toName}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
