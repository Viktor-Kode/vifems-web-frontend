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
  typeLower?: string;
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

export type WorkspaceMetadata = {
  id: string;
  userId?: string;
  name: string;
  slug: string;
  description?: string | null;
  status?: string;
  modules: WorkspaceModuleMeta[];
};

export type WorkspaceOverview = {
  workspaceId: string;
  workspaceName: string;
  totalRecords: number;
  moduleStats: Array<{
    moduleId: string;
    moduleSlug: string;
    moduleName: string;
    recordCount: number;
  }>;
  recentActivity: Array<{
    recordId: string;
    moduleId: string;
    moduleSlug: string;
    moduleName: string;
    label: string;
    action: string;
    timestamp: string;
  }>;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
};

export type DynamicFieldValue = string | number | boolean | null;

export type WorkspaceRecord = {
  id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  data: Record<string, DynamicFieldValue>;
  [key: string]: DynamicFieldValue | Record<string, DynamicFieldValue>;
};

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number, public readonly data?: unknown) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type ApiObject = Record<string, unknown>;

function asObject(value: unknown): ApiObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiObject)
    : {};
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function makeRequestError(body: ApiObject, status: number, fallback: string): ApiRequestError {
  return new ApiRequestError(asString(body.message, fallback), status, body);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Normalizes backend blueprint structure to match frontend entities contract.
 */
function normalizeBlueprint(input: unknown): Blueprint {
  const root = asObject(input);
  const responseData = asObject(root.data);
  const bp = asObject(root.blueprint ?? responseData.blueprint ?? input);
  const generationId = root.generationId ?? responseData.generationId ?? bp.generationId;

  const rawEntities = Array.isArray(bp.entities)
    ? bp.entities
    : Array.isArray(bp.modules)
      ? bp.modules
      : [];
  const entities: EntityBlueprint[] = rawEntities.map((rawEntity, idx) => {
    const entity = asObject(rawEntity);
    const eSlug = asString(entity.slug, `mod_${idx + 1}`);
    const eId = asString(entity.id, `ent_${eSlug}`);
    const rawFields = Array.isArray(entity.fields) ? entity.fields : [];

    return {
      id: eId,
      name: asString(entity.name, `Model ${idx + 1}`),
      slug: eSlug,
      description: asString(entity.description, ""),
      fields: rawFields.map((rawField, fIdx) => {
        const field = asObject(rawField);
        let normType: FieldType = "Text";
        const tLower = asString(field.typeLower ?? field.type, "").toLowerCase().trim().replace(/[\s-]+/g, "_");
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
          id: asString(field.id, `f_${idx + 1}_${fIdx + 1}`),
          name: asString(field.name ?? field.label, `field_${fIdx + 1}`),
          label: asString(field.label ?? field.name, `Field ${fIdx + 1}`),
          type: normType,
          typeLower: tLower,
          required: Boolean(field.required),
          options: asStringArray(field.options),
          targetModule: typeof (field.targetModule ?? field.relatedEntityId) === "string"
            ? String(field.targetModule ?? field.relatedEntityId)
            : undefined,
          targetField: asString(field.targetField, "id"),
          relatedEntityId: typeof (field.relatedEntityId ?? field.targetModule) === "string"
            ? String(field.relatedEntityId ?? field.targetModule)
            : undefined,
          exampleValue: typeof field.exampleValue === "string" ? field.exampleValue : undefined,
        };
      }),
      views: asStringArray(entity.views) || ["table", "form"],
    };
  });

  const rawRelationships = Array.isArray(bp.relationships) ? bp.relationships : [];
  const relationships: BlueprintRelationship[] = rawRelationships.flatMap((rawRelationship, rIdx) => {
    const relationship = asObject(rawRelationship);
    const fromId = relationship.fromEntityId ?? relationship.sourceModule ?? relationship.fromModule;
    const toId = relationship.toEntityId ?? relationship.targetModule ?? relationship.toModule;
    if (typeof fromId !== "string" || typeof toId !== "string") return [];
    return {
      id: asString(relationship.id, `rel_${rIdx + 1}`),
      name: typeof relationship.name === "string" ? relationship.name : undefined,
      sourceModule: typeof relationship.sourceModule === "string" ? relationship.sourceModule : undefined,
      sourceField: typeof relationship.sourceField === "string" ? relationship.sourceField : undefined,
      targetModule: typeof relationship.targetModule === "string" ? relationship.targetModule : undefined,
      targetField: asString(relationship.targetField, "id"),
      cardinality: relationship.cardinality === "one-to-many" || relationship.cardinality === "many-to-many"
        ? relationship.cardinality
        : "many-to-one",
      required: Boolean(relationship.required),
      fromEntityId: fromId,
      toEntityId: toId,
      label: asString(relationship.label, "relates to"),
    };
  });

  return {
    workspaceName: asString(bp.workspaceName ?? bp.name, "My Business Workspace"),
    description: asString(bp.description, ""),
    entities,
    relationships,
    generationId: typeof generationId === "string" ? generationId : undefined,
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

  const body = asObject(await res.json().catch(() => ({})));

  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to generate workspace blueprint.");
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

  const body = asObject(await res.json().catch(() => ({})));

  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to regenerate blueprint.");
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

  const body = asObject(await res.json().catch(() => ({})));

  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to provision workspace.");
  }

  const workspaceIdValue =
    body.workspaceId || asObject(body.data).workspaceId || asObject(body.data).id;
  const workspaceId = typeof workspaceIdValue === "string" ? workspaceIdValue : "";

  if (!workspaceId) {
    throw new Error("Provisioning succeeded but no workspace ID was returned.");
  }

  return { workspaceId };
}

/**
 * Fetches workspace metadata including provisioned dynamic modules.
 */
export async function getWorkspace(workspaceId: string): Promise<WorkspaceMetadata> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
    method: "GET",
    credentials: "include",
  });

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Workspace not found.");
  }

  return (body.data || body) as WorkspaceMetadata;
}

/**
 * Updates workspace properties (e.g. name / business name).
 */
export async function updateWorkspace(
  workspaceId: string,
  payload: { name: string }
): Promise<WorkspaceMetadata> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to update workspace.");
  }

  return (body.data || body) as WorkspaceMetadata;
}

/**
 * Fetches user's list of workspaces.
 */
export async function listWorkspaces(): Promise<WorkspaceMetadata[]> {
  const res = await fetch(`${API_URL}/api/workspaces`, {
    method: "GET",
    credentials: "include",
  });

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) return [];
  return Array.isArray(body.data) ? body.data as WorkspaceMetadata[] : [];
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
): Promise<{ records: WorkspaceRecord[]; total: number; module?: WorkspaceModuleMeta }> {
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

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to fetch module records.");
  }

  return {
    records: Array.isArray(body.data) ? body.data as WorkspaceRecord[] : [],
    total: typeof asObject(body.pagination).total === "number" ? asObject(body.pagination).total as number : 0,
    module: body.module ? body.module as WorkspaceModuleMeta : undefined,
  };
}

/**
 * Creates a record in a dynamic module table.
 */
export async function createRecord(
  workspaceId: string,
  moduleId: string,
  data: Record<string, unknown>
): Promise<WorkspaceRecord> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/modules/${moduleId}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to create record.");
  }

  return (body.data || body) as WorkspaceRecord;
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

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to retrieve record.");
  }

  return (body.data || body) as WorkspaceRecord;
}

/**
 * Updates a record in a dynamic module table.
 */
export async function updateRecord(
  workspaceId: string,
  moduleId: string,
  recordId: string,
  data: Record<string, unknown>
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

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to update record.");
  }

  return (body.data || body) as WorkspaceRecord;
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

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to delete record.");
  }
}

/**
 * Retrieves schema-aware metrics and recent activity for a workspace.
 */
export async function getWorkspaceOverview(workspaceId: string): Promise<WorkspaceOverview> {
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/overview`, {
    method: "GET",
    credentials: "include",
  });

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Failed to fetch workspace overview.");
  }

  return (body.data || body) as WorkspaceOverview;
}

/**
 * Retrieves the currently authenticated user profile.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  const body = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    throw makeRequestError(body, res.status, "Authentication required.");
  }

  const data = asObject(body.data);
  return (data.user || body.user) as UserProfile;
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
