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
    <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-8 shadow-2xs">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-slate-600" />
        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Inferred Business Workflow & Relationships
        </h4>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-xs">
        {relationships.map((rel, idx) => {
          const fromName = entityMap.get(rel.fromEntityId) || "Entity A";
          const toName = entityMap.get(rel.toEntityId) || "Entity B";

          return (
            <React.Fragment key={rel.id || idx}>
              {idx > 0 && <span className="text-slate-300 font-bold px-1">•</span>}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                <span className="font-bold text-slate-900">{fromName}</span>
                <span className="text-[10px] text-slate-600 font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200">
                  ({rel.label})
                </span>
                <span className="text-slate-400">──►</span>
                <span className="font-bold text-slate-900">{toName}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
