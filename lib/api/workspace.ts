export type FieldType =
  | "Text"
  | "Long text"
  | "Number"
  | "Decimal"
  | "Currency"
  | "Date"
  | "Date & Time"
  | "Boolean"
  | "Select"
  | "Relation"
  | "Email"
  | "Phone";

export type FieldBlueprint = {
  id: string;
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  targetModule?: string;
  targetField?: string;
  relatedEntityId?: string;
  exampleValue?: string;
};

export type EntityBlueprint = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  fields: FieldBlueprint[];
  views?: string[];
};

export type BlueprintRelationship = {
  id: string;
  name?: string;
  sourceModule?: string;
  sourceField?: string;
  targetModule?: string;
  targetField?: string;
  cardinality?: "many-to-one" | "one-to-many" | "many-to-many";
  required?: boolean;
  fromEntityId: string;
  toEntityId: string;
  label: string;
};

export type Blueprint = {
  workspaceName: string;
  description: string;
  entities: EntityBlueprint[];
  relationships: BlueprintRelationship[];
  generationId?: string;
};

export type OnboardingStep =
  | "prompt"
  | "generating"
  | "review"
  | "provisioning"
  | "ready";

export type OnboardingState = {
  businessDescription: string;
  workspaceName: string;
  blueprint: Blueprint | null;
  step: OnboardingStep;
  error: {
    stage: "generation" | "validation" | "provisioning";
    message: string;
  } | null;
};

export type WorkspaceModuleMeta = {
  id: string;
  name: string;
  slug: string;
  tableName?: string;
  description?: string;
  fields: FieldBlueprint[];
  views?: string[];
};

export type WorkspaceRecord = {
  id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  data: Record<string, any>;
  [key: string]: any;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Normalizes backend blueprint structure to match frontend entities contract.
 */
function normalizeBlueprint(data: any): Blueprint {
  const bp = data?.blueprint || data?.data?.blueprint || data;
  const generationId = data?.generationId || data?.data?.generationId || bp?.generationId;

  const rawEntities = bp?.entities || bp?.modules || [];
  const entities: EntityBlueprint[] = rawEntities.map((e: any, idx: number) => {
    const eSlug = e.slug || `mod_${idx + 1}`;
    const eId = e.id || `ent_${eSlug}`;

    return {
      id: eId,
      name: e.name || `Model ${idx + 1}`,
      slug: eSlug,
      description: e.description || "",
      fields: (e.fields || []).map((f: any, fIdx: number) => {
        let normType: FieldType = "Text";
        const tLower = (f.typeLower || f.type || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
        if (tLower === "long_text" || tLower === "textarea") normType = "Long text";
        else if (tLower === "datetime" || tLower === "date_time" || tLower === "timestamp") normType = "Date & Time";
        else if (tLower === "decimal" || tLower === "float") normType = "Decimal";
        else if (tLower === "currency" || tLower === "money") normType = "Currency";
        else if (tLower === "number" || tLower === "int") normType = "Number";
        else if (tLower === "boolean" || tLower === "bool") normType = "Boolean";
        else if (tLower === "date") normType = "Date";
        else if (tLower === "select") normType = "Select";
        else if (tLower === "relation") normType = "Relation";
        else if (tLower === "email") normType = "Email";
        else if (tLower === "phone") normType = "Phone";

        return {
          id: f.id || `f_${idx + 1}_${fIdx + 1}`,
          name: f.name || f.label || `field_${fIdx + 1}`,
          label: f.label || f.name || `Field ${fIdx + 1}`,
          type: normType,
          required: Boolean(f.required),
          options: f.options,
          targetModule: f.targetModule || f.relatedEntityId,
          targetField: f.targetField || "id",
          relatedEntityId: f.relatedEntityId || f.targetModule,
          exampleValue: f.exampleValue,
        };
      }),
      views: e.views || ["table", "form"],
    };
  });

  const relationships: BlueprintRelationship[] = (bp?.relationships || []).map((r: any, rIdx: number) => {
    const fromId = r.fromEntityId || r.sourceModule || r.fromModule;
    const toId = r.toEntityId || r.targetModule || r.toModule;
    return {
      id: r.id || `rel_${rIdx + 1}`,
      name: r.name,
      sourceModule: r.sourceModule,
      sourceField: r.sourceField,
      targetModule: r.targetModule,
      targetField: r.targetField || "id",
      cardinality: r.cardinality || "many-to-one",
      required: Boolean(r.required),
      fromEntityId: fromId,
      toEntityId: toId,
      label: r.label || "relates to",
    };
  });

  return {
    workspaceName: bp?.workspaceName || bp?.name || "My Business Workspace",
    description: bp?.description || "",
    entities,
    relationships,
    generationId,
  };
}

/**
 * Generates a structured workspace blueprint from a business description.
 * Requires authenticated user session.
 */
export async function generateBlueprint(description: string): Promise<Blueprint> {
  const res = await fetch(`${API_URL}/api/workspaces/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ description }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = body?.message || "Failed to generate workspace blueprint.";
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    throw err;
  }

  return normalizeBlueprint(body);
}

/**
 * Regenerates a blueprint from an existing generation ID.
 */
export async function regenerateBlueprint(generationId: string): Promise<Blueprint> {
  const res = await fetch(`${API_URL}/api/workspaces/generations/${generationId}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.message || "Failed to regenerate blueprint.");
  }

  return normalizeBlueprint(body);
}

/**
 * Provisions real workspace and dynamic PostgreSQL tables in Rumpty Cloud.
 */
export async function provisionWorkspace(
  blueprint: Blueprint
): Promise<{ workspaceId: string }> {
  const endpoint = blueprint.generationId
    ? `${API_URL}/api/workspaces/generations/${blueprint.generationId}/launch`
    : `${API_URL}/api/workspaces/provision`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      blueprint: {
        workspaceName: blueprint.workspaceName,
        name: blueprint.workspaceName,
        description: blueprint.description,
        modules: blueprint.entities,
        entities: blueprint.entities,
        relationships: blueprint.relationships,
      },
      generationId: blueprint.generationId,
    }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = body?.message || "Failed to provision workspace in database.";
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    throw err;
  }

  const workspaceId =
    body.workspaceId || body.data?.workspaceId || body.data?.id;

  if (!workspaceId) {
    throw new Error("Provisioning succeeded but no workspace ID was returned.");
  }

  return { workspaceId };
}

/**
 * Fetches workspace metadata including provisioned dynamic modules.
 */
export async function getWorkspace(workspaceId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
    method: "GET",
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || "Workspace not found.");
  }

  return body.data || body;
}

/**
 * Fetches user's list of workspaces.
 */
export async function listWorkspaces(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/workspaces`, {
    method: "GET",
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) return [];
  return body.data || [];
}

/**
 * Lists records for a provisioned module with optional search query.
 */
export async function fetchRecords(
  workspaceId: string,
  moduleId: string,
  page = 1,
  limit = 50,
  search = ""
): Promise<{ records: WorkspaceRecord[]; total: number; module?: any }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search && search.trim()) {
    query.set("search", search.trim());
  }

  const res = await fetch(
    `${API_URL}/api/workspaces/${workspaceId}/modules/${moduleId}/records?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Failed to fetch module records.");
    (err as any).status = res.status;
    throw err;
  }

  return {
    records: body.data || [],
    total: body.pagination?.total || 0,
    module: body.module,
  };
}

/**
 * Creates a record in a dynamic module table.
 */
export async function createRecord(
  workspaceId: string,
  moduleId: string,
  data: Record<string, any>
): Promise<WorkspaceRecord> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/modules/${moduleId}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Failed to create record.");
    (err as any).status = res.status;
    throw err;
  }

  return body.data || body;
}

/**
 * Retrieves a single record from a dynamic module table.
 */
export async function getRecord(
  workspaceId: string,
  moduleId: string,
  recordId: string
): Promise<WorkspaceRecord> {
  const res = await fetch(
    `${API_URL}/api/workspaces/${workspaceId}/modules/${moduleId}/records/${recordId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Failed to retrieve record.");
    (err as any).status = res.status;
    throw err;
  }

  return body.data || body;
}

/**
 * Updates a record in a dynamic module table.
 */
export async function updateRecord(
  workspaceId: string,
  moduleId: string,
  recordId: string,
  data: Record<string, any>
): Promise<WorkspaceRecord> {
  const res = await fetch(
    `${API_URL}/api/workspaces/${workspaceId}/modules/${moduleId}/records/${recordId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Failed to update record.");
    (err as any).status = res.status;
    throw err;
  }

  return body.data || body;
}

/**
 * Deletes a record from a dynamic module table.
 */
export async function deleteRecord(
  workspaceId: string,
  moduleId: string,
  recordId: string
): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/workspaces/${workspaceId}/modules/${moduleId}/records/${recordId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Failed to delete record.");
    (err as any).status = res.status;
    throw err;
  }
}

/**
 * Retrieves schema-aware metrics and recent activity for a workspace.
 */
export async function getWorkspaceOverview(workspaceId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/overview`, {
    method: "GET",
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Failed to fetch workspace overview.");
    (err as any).status = res.status;
    throw err;
  }

  return body.data || body;
}

/**
 * Retrieves the currently authenticated user profile.
 */
export async function getCurrentUser(): Promise<any> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || "Authentication required.");
    (err as any).status = res.status;
    throw err;
  }

  return body.data?.user || body.user;
}

/**
 * Logs out the currently authenticated user.
 */
export async function logoutUser(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}
