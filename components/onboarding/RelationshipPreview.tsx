"use client";

import React from "react";
import { BlueprintRelationship, EntityBlueprint } from "@/lib/api/workspace";

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
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔗</span>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Inferred Business Workflow & Relationships
        </h4>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-xs">
        {relationships.map((rel, idx) => {
          const fromName = entityMap.get(rel.fromEntityId) || "Entity A";
          const toName = entityMap.get(rel.toEntityId) || "Entity B";

          return (
            <React.Fragment key={rel.id || idx}>
              {idx > 0 && <span className="text-slate-700 font-bold px-1">•</span>}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                <span className="font-semibold text-indigo-300">{fromName}</span>
                <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  ({rel.label})
                </span>
                <span className="text-slate-500">──►</span>
                <span className="font-semibold text-cyan-300">{toName}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
