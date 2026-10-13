"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VifeMSLogo from "@/components/VifeMSLogo";
import "./dashboard.css";

// Blueprint Module Field: [key, label, type, options]
export type FieldOpts = {
  r?: number; // required (1 or 0)
  o?: string[]; // select options
  to?: string; // target module slug for relations
};

export type BlueprintField = [string, string, string, FieldOpts?];

export type BlueprintModule = {
  s: string; // slug
  n: string; // name
  d: string; // description
  f: BlueprintField[]; // fields
};

export type WorkspaceBlueprint = {
  name: string;
  cur: string;
  loc: string;
  mods: BlueprintModule[];
};

export type RecordItem = {
  id: string;
  at: number;
  [key: string]: any;
};

export type LogItem = {
  t: number;
  x: string;
};

export type UserProfile = {
  name: string;
  email: string;
};

export type OrgProfile = {
  industry: string;
  email: string;
  phone: string;
  web: string;
  addr: string;
};

// Default Blueprint specifications
const DEFAULT_BLUEPRINTS: Record<string, WorkspaceBlueprint> = {
  c: {
    name: "Meridian Consulting",
    cur: "USD",
    loc: "en-US",
    mods: [
      {
        s: "clients",
        n: "Clients",
        d: "People and companies you advise.",
        f: [
          ["name", "Name", "text", { r: 1 }],
          ["email", "Email", "text"],
          ["status", "Status", "select", { o: ["Active", "Prospect", "Churned"] }],
        ],
      },
      {
        s: "projects",
        n: "Projects",
        d: "Engagements delivered for clients.",
        f: [
          ["title", "Title", "text", { r: 1 }],
          ["client", "Client", "relation", { to: "clients", r: 1 }],
          ["status", "Status", "select", { o: ["Planned", "In progress", "Done"] }],
          ["budget", "Budget", "currency"],
          ["due", "Due date", "date"],
        ],
      },
      {
        s: "invoices",
        n: "Invoices",
        d: "Billing raised against projects.",
        f: [
          ["number", "Invoice no.", "text", { r: 1 }],
          ["project", "Project", "relation", { to: "projects", r: 1 }],
          ["amount", "Amount", "currency"],
          ["paid", "Paid", "boolean"],
          ["issued", "Issued", "date"],
        ],
      },
    ],
  },
  e: {
    name: "Volt Electronics",
    cur: "NGN",
    loc: "en-NG",
    mods: [
      {
        s: "customers",
        n: "Customers",
        d: "Shoppers who buy from you.",
        f: [
          ["name", "Name", "text", { r: 1 }],
          ["phone", "Phone", "text"],
        ],
      },
      {
        s: "suppliers",
        n: "Suppliers",
        d: "Where your stock comes from.",
        f: [
          ["name", "Name", "text", { r: 1 }],
          ["phone", "Phone", "text"],
        ],
      },
      {
        s: "products",
        n: "Products",
        d: "Items on your shelves.",
        f: [
          ["name", "Name", "text", { r: 1 }],
          ["supplier", "Supplier", "relation", { to: "suppliers", r: 1 }],
          ["price", "Price", "currency"],
          ["stock", "In stock", "number"],
        ],
      },
      {
        s: "sales",
        n: "Sales",
        d: "Orders placed by customers.",
        f: [
          ["customer", "Customer", "relation", { to: "customers", r: 1 }],
          ["date", "Date", "date"],
          ["status", "Payment", "select", { o: ["Pending", "Paid"] }],
          ["total", "Total", "currency"],
        ],
      },
      {
        s: "sale_items",
        n: "Sale Items",
        d: "Products inside each sale.",
        f: [
          ["sale", "Sale", "relation", { to: "sales", r: 1 }],
          ["product", "Product", "relation", { to: "products", r: 1 }],
          ["qty", "Quantity", "number"],
        ],
      },
    ],
  },
};

const DEFAULT_ORGS: Record<string, OrgProfile> = {
  c: {
    industry: "Management consulting",
    email: "info@meridian.example",
    phone: "+1 555 010 2030",
    web: "meridian.example",
    addr: "",
  },
  e: {
    industry: "Electronics retail",
    email: "sales@volt.example",
    phone: "+234 800 000 0000",
    web: "volt.example",
    addr: "",
  },
};

const H = 36e5;

const INITIAL_RAW: Record<string, Record<string, Array<[number, Record<string, any>]>>> = {
  c: {
    clients: [
      [200, { name: "Adaeze Foods", email: "hello@adaeze.example", status: "Active" }],
      [120, { name: "Lekki Labs", email: "team@lekkilabs.example", status: "Prospect" }],
      [70, { name: "Northgate Ltd", email: "ops@northgate.example", status: "Active" }],
    ],
    projects: [
      [100, { title: "Brand audit", client: "clients1", status: "In progress", budget: 4500, due: "2026-11-07" }],
      [40, { title: "Market entry plan", client: "clients3", status: "Planned", budget: 12000, due: "2026-12-15" }],
    ],
    invoices: [
      [60, { number: "INV-001", project: "projects1", amount: 2250, paid: true, issued: "2026-10-01" }],
      [8, { number: "INV-002", project: "projects1", amount: 2250, paid: false, issued: "2026-10-10" }],
    ],
  },
  e: {
    customers: [
      [90, { name: "Tunde Bakare", phone: "0803 000 1122" }],
      [30, { name: "Chioma Eze", phone: "0810 000 3344" }],
    ],
    suppliers: [
      [300, { name: "Ikeja Wholesale", phone: "0701 000 5566" }],
      [250, { name: "Alaba Imports", phone: "0902 000 7788" }],
    ],
    products: [
      [200, { name: "Phone charger", supplier: "suppliers1", price: 8500, stock: 40 }],
      [190, { name: "Bluetooth speaker", supplier: "suppliers2", price: 32000, stock: 12 }],
      [180, { name: "HDMI cable", supplier: "suppliers1", price: 3500, stock: 75 }],
    ],
    sales: [
      [50, { customer: "customers1", date: "2026-10-10", status: "Paid", total: 43500 }],
      [5, { customer: "customers2", date: "2026-10-12", status: "Pending", total: 3500 }],
    ],
    sale_items: [
      [50, { sale: "sales1", product: "products1", qty: 1 }],
      [50, { sale: "sales1", product: "products2", qty: 1 }],
      [5, { sale: "sales2", product: "products3", qty: 1 }],
    ],
  },
};

function parseOnboardedBlueprint(savedData: any): {
  blueprint: WorkspaceBlueprint;
  org: OrgProfile;
  initialDb: Record<string, RecordItem[]>;
  initialLog: LogItem[];
} | null {
  try {
    if (!savedData || !savedData.blueprint || !savedData.blueprint.entities) return null;
    const bp = savedData.blueprint;
    const name = savedData.workspaceName || bp.workspaceName || "Custom Workspace";
    const desc = (savedData.description || "").toLowerCase();

    const isNgn = desc.includes("naira") || desc.includes("ngn") || desc.includes("lagos") || desc.includes("nigeria");
    const isGbp = desc.includes("uk") || desc.includes("london") || desc.includes("pound");
    const cur = isNgn ? "NGN" : isGbp ? "GBP" : "USD";
    const loc = isNgn ? "en-NG" : isGbp ? "en-GB" : "en-US";

    const mods: BlueprintModule[] = bp.entities.map((ent: any) => {
      const slug = ent.id.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const fields: BlueprintField[] = (ent.fields || []).map((f: any) => {
        const key = f.id.toLowerCase().replace(/[^a-z0-9_]/g, "_");
        const type = (f.type || "Text").toLowerCase();
        const opts: FieldOpts = {};
        if (f.required) opts.r = 1;
        if (f.options && f.options.length) opts.o = f.options;
        if (type === "relation") {
          let targetSlug = f.relatedEntityId?.toLowerCase().replace(/[^a-z0-9_]/g, "_");
          if (!targetSlug && bp.relationships) {
            const rel = bp.relationships.find((r: any) => r.toEntityId === ent.id || r.fromEntityId === ent.id);
            if (rel) {
              const otherId = rel.fromEntityId === ent.id ? rel.toEntityId : rel.fromEntityId;
              targetSlug = otherId?.toLowerCase().replace(/[^a-z0-9_]/g, "_");
            }
          }
          if (targetSlug) opts.to = targetSlug;
        }
        return [key, f.name, type, opts];
      });

      return {
        s: slug,
        n: ent.name,
        d: ent.description || `Manage and track ${ent.name.toLowerCase()}.`,
        f: fields,
      };
    });

    const initialDb: Record<string, RecordItem[]> = {};
    const initialLog: LogItem[] = [];

    mods.forEach((mod) => {
      initialDb[mod.s] = [];
      const primaryKey = mod.f[0][0];

      const rec1: RecordItem = { id: `${mod.s}1`, at: Date.now() - 48 * H };
      const rec2: RecordItem = { id: `${mod.s}2`, at: Date.now() - 12 * H };

      mod.f.forEach(([key, label, type, opts]) => {
        if (type === "number") {
          rec1[key] = 10;
          rec2[key] = 25;
        } else if (type === "currency") {
          rec1[key] = cur === "NGN" ? 15000 : 250;
          rec2[key] = cur === "NGN" ? 42000 : 780;
        } else if (type === "boolean") {
          rec1[key] = true;
          rec2[key] = false;
        } else if (type === "date") {
          rec1[key] = "2026-10-01";
          rec2[key] = "2026-10-11";
        } else if (type === "select") {
          rec1[key] = opts?.o?.[0] || "Active";
          rec2[key] = opts?.o?.[1] || opts?.o?.[0] || "Pending";
        } else if (type === "relation") {
          rec1[key] = opts?.to ? `${opts.to}1` : "";
          rec2[key] = opts?.to ? `${opts.to}1` : "";
        } else {
          rec1[key] = `${label} Alpha`;
          rec2[key] = `${label} Beta`;
        }
      });

      initialDb[mod.s].push(rec1, rec2);

      const singName = mod.n.replace(/s$/, "");
      initialLog.push({
        t: rec1.at,
        x: `New ${singName.toLowerCase()} added: ${rec1[primaryKey] || ""}`,
      });
      initialLog.push({
        t: rec2.at,
        x: `New ${singName.toLowerCase()} added: ${rec2[primaryKey] || ""}`,
      });
    });

    const org: OrgProfile = {
      industry: "Custom Operations",
      email: "contact@" + name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".example",
      phone: "+1 555 123 4567",
      web: name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".example",
      addr: "",
    };

    return {
      blueprint: { name, cur, loc, mods },
      org,
      initialDb,
      initialLog,
    };
  } catch (err) {
    console.error("Failed to parse onboarded blueprint:", err);
    return null;
  }
}

const sing = (m: BlueprintModule) => m.n.replace(/s$/, "");

/* ── MODALS ── */

function RecordFormModal({
  module,
  existingRecord,
  currentDb,
  resolveRecordLabel,
  getCurrencySymbol,
  getModule,
  onSave,
  onClose,
}: {
  module: BlueprintModule;
  existingRecord: RecordItem | null;
  currentDb: Record<string, RecordItem[]>;
  resolveRecordLabel: (targetSlug: string, recordId: string) => string;
  getCurrencySymbol: () => string;
  getModule: (slug: string) => BlueprintModule | undefined;
  onSave: (recordData: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [formError, setFormError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const newRecordData: Record<string, any> = {};

    for (const f of module.f) {
      const key = f[0];
      const type = f[2];
      const isReq = Boolean(f[3]?.r);
      let val: any = formData.get(key);

      if (type === "boolean") {
        const checkboxEl = formEl.elements.namedItem(key) as HTMLInputElement | null;
        val = Boolean(checkboxEl?.checked);
      } else if (type === "number" || type === "currency") {
        val = val === "" || val === null ? undefined : parseFloat(String(val));
      } else {
        val = typeof val === "string" ? val.trim() : val;
      }

      if (isReq && (val === "" || val === undefined || val === null)) {
        setFormError(`${f[1]} is required.`);
        return;
      }

      newRecordData[key] = val;
    }

    onSave(newRecordData);
  };

  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div className="vf-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>
          {existingRecord ? "Edit" : "Add"} {sing(module)}
        </h2>
        <form onSubmit={handleSubmit}>
          {module.f.map((f) => {
            const key = f[0];
            const label = f[1];
            const type = f[2];
            const opts = f[3];
            const isReq = Boolean(opts?.r);
            const defaultVal = existingRecord ? existingRecord[key] : "";

            return (
              <label key={key} className="vf-fl">
                <span>
                  {label}
                  {isReq ? " *" : ""}
                </span>

                {type === "select" ? (
                  <select name={key} defaultValue={defaultVal ?? ""}>
                    <option value="">Choose…</option>
                    {(opts?.o || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : type === "relation" ? (
                  <select name={key} defaultValue={defaultVal ?? ""} required={isReq}>
                    <option value="">Choose {sing(getModule(opts?.to || "") || module).toLowerCase()}…</option>
                    {(currentDb[opts?.to || ""] || []).map((relRec) => (
                      <option key={relRec.id} value={relRec.id}>
                        {resolveRecordLabel(opts?.to || "", relRec.id)}
                      </option>
                    ))}
                  </select>
                ) : type === "boolean" ? (
                  <input type="checkbox" name={key} defaultChecked={Boolean(defaultVal)} />
                ) : type === "currency" ? (
                  <div className="vf-pre">
                    <b>{getCurrencySymbol()}</b>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name={key}
                      defaultValue={defaultVal ?? ""}
                      required={isReq}
                    />
                  </div>
                ) : (
                  <input
                    type={type === "number" ? "number" : type === "date" ? "date" : "text"}
                    step={type === "number" ? "any" : undefined}
                    name={key}
                    defaultValue={defaultVal ?? ""}
                    required={isReq}
                  />
                )}
              </label>
            );
          })}

          {formError && <p className="vf-er">{formError}</p>}

          <div className="vf-ft">
            <button type="button" className="vf-btn g" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="vf-btn">
              {existingRecord ? "Save changes" : `Add ${sing(module).toLowerCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PrerequisiteModal({
  module,
  parentModule,
  onAddParent,
  onClose,
}: {
  module: BlueprintModule;
  parentModule: BlueprintModule;
  onAddParent: () => void;
  onClose: () => void;
}) {
  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div className="vf-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create a {sing(parentModule).toLowerCase()} first</h2>
        <p style={{ color: "var(--vf-mut)", fontSize: 14 }}>
          {module.n} require an existing {sing(parentModule).toLowerCase()} to link with. Add one first, then come back to create this {sing(module).toLowerCase()}.
        </p>
        <div className="vf-ft">
          <button className="vf-btn g" onClick={onClose}>
            Cancel
          </button>
          <button className="vf-btn" onClick={onAddParent}>
            + Add {sing(parentModule)}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockedDeleteModal({
  module,
  blockers,
  onClose,
}: {
  module: BlueprintModule;
  blockers: string[];
  onClose: () => void;
}) {
  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div className="vf-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Can&apos;t delete this {sing(module).toLowerCase()}</h2>
        <p style={{ color: "var(--vf-mut)", fontSize: 14, lineHeight: 1.5 }}>
          It is still linked to {blockers.join(" and ")}. Remove or reassign those records first before deleting.
        </p>
        <div className="vf-ft">
          <button className="vf-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  module,
  onConfirm,
  onClose,
}: {
  module: BlueprintModule;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div className="vf-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Delete this {sing(module).toLowerCase()}?</h2>
        <p style={{ color: "var(--vf-mut)", fontSize: 14 }}>
          This record will be permanently removed. This action cannot be undone.
        </p>
        <div className="vf-ft">
          <button className="vf-btn g" onClick={onClose}>
            Cancel
          </button>
          <button className="vf-btn d" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD COMPONENT ── */

export default function DashboardPage() {
  const router = useRouter();

  // Registry of workspaces & organization profiles
  const [blueprints, setBlueprints] = useState<Record<string, WorkspaceBlueprint>>(DEFAULT_BLUEPRINTS);
  const [orgs, setOrgs] = useState<Record<string, OrgProfile>>(DEFAULT_ORGS);
  const [db, setDb] = useState<Record<string, Record<string, RecordItem[]>>>({});
  const [logs, setLogs] = useState<Record<string, LogItem[]>>({});

  // User Profile
  const [user, setUser] = useState<UserProfile>({
    name: "Code with Hife",
    email: "hello@codewithhife.example",
  });

  // Profile Active Tab ('p' = personal, 'o' = organization, 's' = security)
  const [profileTab, setProfileTab] = useState<"p" | "o" | "s">("p");

  // Profile Form States
  const [pName, setPName] = useState("Code with Hife");
  const [pEmail, setPEmail] = useState("hello@codewithhife.example");

  // Org Form States
  const [orgBusinessName, setOrgBusinessName] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgWeb, setOrgWeb] = useState("");
  const [orgAddr, setOrgAddr] = useState("");

  // Password Security Form States
  const [pwCur, setPwCur] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwCf, setPwCf] = useState("");
  const [pwError, setPwError] = useState("");

  // Active workspace & active view
  const [workspaceKey, setWorkspaceKey] = useState<string>("c");
  const [activeView, setActiveView] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mobile navigation & search toggles
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Dialog State
  type DialogState =
    | { type: "form"; moduleSlug: string; recordId?: string }
    | { type: "prerequisite"; moduleSlug: string; parentModuleSlug: string }
    | { type: "blockedDelete"; moduleSlug: string; blockers: string[] }
    | { type: "confirmDelete"; moduleSlug: string; recordId: string }
    | null;

  const [dialog, setDialog] = useState<DialogState>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize DB and Seed Data
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialDb: Record<string, Record<string, RecordItem[]>> = {};
      const initialLogs: Record<string, LogItem[]> = {};

      for (const w in INITIAL_RAW) {
        initialDb[w] = {};
        initialLogs[w] = [];
        const currentBp = DEFAULT_BLUEPRINTS[w];
        if (currentBp) {
          currentBp.mods.forEach((m) => {
            initialDb[w][m.s] = (INITIAL_RAW[w][m.s] || []).map(([h, o], i) => ({
              id: `${m.s}${i + 1}`,
              at: Date.now() - h * H,
              ...o,
            }));

            initialDb[w][m.s].forEach((r) => {
              const firstKey = m.f[0][0];
              initialLogs[w].push({
                t: r.at,
                x: `New ${sing(m).toLowerCase()} added: ${r[firstKey] || ""}`.replace(
                  /: (clients|projects|suppliers|sales|customers|products)\d+$/,
                  ""
                ),
              });
            });
          });
        }
      }

      // Check for newly onboarded workspace
      try {
        const onboardedRaw = localStorage.getItem("vifems_onboarded_workspace");
        if (onboardedRaw) {
          const parsed = JSON.parse(onboardedRaw);
          const onboardedParsed = parseOnboardedBlueprint(parsed);
          if (onboardedParsed) {
            const wsId = parsed.workspaceId || "onboarded_ws";
            setBlueprints((prev) => ({
              [wsId]: onboardedParsed.blueprint,
              ...prev,
            }));
            setOrgs((prev) => ({
              [wsId]: onboardedParsed.org,
              ...prev,
            }));
            initialDb[wsId] = onboardedParsed.initialDb;
            initialLogs[wsId] = onboardedParsed.initialLog;

            setWorkspaceKey(wsId);
          }
        }
      } catch (e) {
        console.warn("Could not load onboarded workspace:", e);
      }

      setDb(initialDb);
      setLogs(initialLogs);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sync Org form inputs whenever workspaceKey or blueprints change
  useEffect(() => {
    const curBp = blueprints[workspaceKey];
    const curOrg = orgs[workspaceKey] || {
      industry: "General Business",
      email: "info@business.example",
      phone: "",
      web: "",
      addr: "",
    };
    if (curBp) {
      setOrgBusinessName(curBp.name);
      setOrgIndustry(curOrg.industry);
      setOrgEmail(curOrg.email);
      setOrgPhone(curOrg.phone);
      setOrgWeb(curOrg.web);
      setOrgAddr(curOrg.addr);
    }
  }, [workspaceKey, blueprints, orgs]);

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2400);
  }, []);

  // Initials Helper
  const getInitials = useCallback(() => {
    return user.name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user.name]);

  // Current active workspace and module helpers
  const currentBlueprint = blueprints[workspaceKey] || blueprints["c"];
  const currentOrg = orgs[workspaceKey] || {
    industry: "General Business",
    email: "info@business.example",
    phone: "",
    web: "",
    addr: "",
  };
  const currentDb = db[workspaceKey] || {};
  const currentLog = logs[workspaceKey] || [];

  const getModule = useCallback(
    (slug: string): BlueprintModule | undefined => {
      return currentBlueprint?.mods.find((m) => m.s === slug);
    },
    [currentBlueprint]
  );

  const resolveRecordLabel = useCallback(
    (targetSlug: string, recordId: string): string => {
      const records = currentDb[targetSlug] || [];
      const record = records.find((x) => x.id === recordId);
      if (!record) return "Unknown record";
      const targetMod = getModule(targetSlug);
      if (!targetMod || !targetMod.f.length) return "Unknown record";
      const firstFieldKey = targetMod.f[0][0];
      return record[firstFieldKey] ?? "Record";
    },
    [currentDb, getModule]
  );

  const formatMoney = useCallback(
    (val: number | string | undefined): string => {
      const num = typeof val === "number" ? val : parseFloat(String(val || 0));
      if (isNaN(num)) return "—";
      try {
        return new Intl.NumberFormat(currentBlueprint?.loc || "en-US", {
          style: "currency",
          currency: currentBlueprint?.cur || "USD",
          maximumFractionDigits: 2,
        }).format(num);
      } catch {
        return `$${num.toFixed(2)}`;
      }
    },
    [currentBlueprint]
  );

  const getCurrencySymbol = useCallback((): string => {
    try {
      const parts = new Intl.NumberFormat(currentBlueprint?.loc || "en-US", {
        style: "currency",
        currency: currentBlueprint?.cur || "USD",
      }).formatToParts(0);
      const symbolPart = parts.find((p) => p.type === "currency");
      return symbolPart ? symbolPart.value : "$";
    } catch {
      return "$";
    }
  }, [currentBlueprint]);

  const formatDate = useCallback(
    (dateStr: string | undefined): string => {
      if (!dateStr) return "—";
      try {
        return new Date(`${dateStr}T00:00`).toLocaleDateString(currentBlueprint?.loc || "en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    },
    [currentBlueprint]
  );

  const formatAgo = useCallback((timestamp: number): string => {
    const mins = Math.round((Date.now() - timestamp) / 6e4);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
  }, []);

  const renderCell = useCallback(
    (field: BlueprintField, val: any) => {
      const type = field[2];
      if (val === undefined || val === null || val === "") {
        return <span style={{ color: "var(--vf-mut)" }}>—</span>;
      }
      if (type === "number") {
        return val;
      }
      if (type === "currency") {
        return formatMoney(val);
      }
      if (type === "date") {
        return formatDate(val);
      }
      if (type === "boolean") {
        return (
          <span className={`vf-bg ${val ? "vf-b1" : ""}`}>
            {val ? "Yes" : "No"}
          </span>
        );
      }
      if (type === "select") {
        const opts = field[3]?.o || [];
        const idx = Math.max(0, opts.indexOf(val)) % 4;
        return <span className={`vf-bg vf-b${idx}`}>{String(val)}</span>;
      }
      if (type === "relation") {
        const targetSlug = field[3]?.to || "";
        return resolveRecordLabel(targetSlug, val);
      }
      return (
        <span className="vf-tr" title={String(val)}>
          {String(val)}
        </span>
      );
    },
    [formatMoney, formatDate, resolveRecordLabel]
  );

  const navigateTo = (view: string) => {
    setActiveView(view);
    setSearchQuery("");
    setMobileNavOpen(false);
    setMobileSearchOpen(false);
  };

  const openRecordForm = (moduleSlug: string, recordId?: string) => {
    const mod = getModule(moduleSlug);
    if (!mod) return;

    const missingRelations = mod.f.filter(
      (f) => f[2] === "relation" && f[3]?.r && (!f[3]?.to || !(currentDb[f[3].to] || []).length)
    );

    if (missingRelations.length > 0 && !recordId) {
      const parentSlug = missingRelations[0][3]?.to || "";
      setDialog({
        type: "prerequisite",
        moduleSlug,
        parentModuleSlug: parentSlug,
      });
      return;
    }

    setDialog({
      type: "form",
      moduleSlug,
      recordId,
    });
  };

  const openDeleteDialog = (moduleSlug: string, recordId: string) => {
    const blockers: string[] = [];

    currentBlueprint?.mods.forEach((otherMod) => {
      otherMod.f.forEach((f) => {
        if (f[2] === "relation" && f[3]?.to === moduleSlug) {
          const count = (currentDb[otherMod.s] || []).filter((r) => r[f[0]] === recordId).length;
          if (count > 0) {
            blockers.push(`${count} ${count > 1 ? otherMod.n : sing(otherMod)}`.toLowerCase());
          }
        }
      });
    });

    if (blockers.length > 0) {
      setDialog({
        type: "blockedDelete",
        moduleSlug,
        blockers,
      });
      return;
    }

    setDialog({
      type: "confirmDelete",
      moduleSlug,
      recordId,
    });
  };

  const handleSaveRecord = (moduleSlug: string, recordId: string | undefined, recordData: Record<string, any>) => {
    const mod = getModule(moduleSlug);
    if (!mod) return;

    const firstKey = mod.f[0][0];
    const recordLabel = recordData[firstKey] && mod.f[0][2] !== "relation" ? String(recordData[firstKey]) : "";
    const now = Date.now();

    if (recordId) {
      setDb((prev) => {
        const wsDb = { ...prev[workspaceKey] };
        const list = [...(wsDb[moduleSlug] || [])];
        const idx = list.findIndex((r) => r.id === recordId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...recordData };
          wsDb[moduleSlug] = list;
        }
        return { ...prev, [workspaceKey]: wsDb };
      });

      setLogs((prev) => {
        const wsLogs = [...(prev[workspaceKey] || [])];
        wsLogs.unshift({
          t: now,
          x: `${sing(mod)} updated${recordLabel ? `: ${recordLabel}` : ""}`,
        });
        return { ...prev, [workspaceKey]: wsLogs };
      });

      showToast("Changes saved");
    } else {
      const newId = `${moduleSlug}${now}`;
      const fullRecord: RecordItem = {
        id: newId,
        at: now,
        ...recordData,
      };

      setDb((prev) => {
        const wsDb = { ...prev[workspaceKey] };
        const list = [...(wsDb[moduleSlug] || [])];
        list.push(fullRecord);
        wsDb[moduleSlug] = list;
        return { ...prev, [workspaceKey]: wsDb };
      });

      setLogs((prev) => {
        const wsLogs = [...(prev[workspaceKey] || [])];
        wsLogs.unshift({
          t: now,
          x: `New ${sing(mod).toLowerCase()} added${recordLabel ? `: ${recordLabel}` : ""}`,
        });
        return { ...prev, [workspaceKey]: wsLogs };
      });

      showToast(`${sing(mod)} added`);
    }

    setDialog(null);
  };

  const handleDeleteRecord = (moduleSlug: string, recordId: string) => {
    const mod = getModule(moduleSlug);
    if (!mod) return;
    const now = Date.now();

    setDb((prev) => {
      const wsDb = { ...prev[workspaceKey] };
      const list = (wsDb[moduleSlug] || []).filter((r) => r.id !== recordId);
      wsDb[moduleSlug] = list;
      return { ...prev, [workspaceKey]: wsDb };
    });

    setLogs((prev) => {
      const wsLogs = [...(prev[workspaceKey] || [])];
      wsLogs.unshift({
        t: now,
        x: `${sing(mod)} deleted`,
      });
      return { ...prev, [workspaceKey]: wsLogs };
    });

    setDialog(null);
    showToast(`${sing(mod)} deleted`);
  };

  // Profile Save Handlers
  const isPersonalDirty = pName.trim() !== user.name || pEmail.trim() !== user.email;

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      showToast("Display name cannot be empty");
      return;
    }
    setUser({
      name: pName.trim(),
      email: pEmail.trim(),
    });
    showToast("Profile saved");
  };

  const isOrgDirty =
    orgBusinessName.trim() !== currentBlueprint.name ||
    orgIndustry.trim() !== currentOrg.industry ||
    orgEmail.trim() !== currentOrg.email ||
    orgPhone.trim() !== currentOrg.phone ||
    orgWeb.trim() !== currentOrg.web ||
    orgAddr.trim() !== currentOrg.addr;

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgBusinessName.trim()) {
      showToast("Business name is required");
      return;
    }

    setBlueprints((prev) => ({
      ...prev,
      [workspaceKey]: {
        ...prev[workspaceKey],
        name: orgBusinessName.trim(),
      },
    }));

    setOrgs((prev) => ({
      ...prev,
      [workspaceKey]: {
        industry: orgIndustry.trim(),
        email: orgEmail.trim(),
        phone: orgPhone.trim(),
        web: orgWeb.trim(),
        addr: orgAddr.trim(),
      },
    }));

    showToast("Organization saved");
  };

  // Password Security Strength Calculation
  const pwStrength = useMemo(() => {
    if (!pwNew) return { score: 0, text: "Use at least 8 characters with a mix of letters and numbers." };
    let score = 0;
    if (pwNew.length >= 8) score++;
    if (/[a-z]/.test(pwNew) && /[A-Z]/.test(pwNew)) score++;
    if (/\d/.test(pwNew)) score++;
    if (/[^\w\s]/.test(pwNew)) score++;

    const textMap = ["Weak password", "Weak password", "Fair password", "Strong password", "Very strong password"];
    return {
      score,
      text: textMap[score] || "Weak password",
    };
  }, [pwNew]);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (pwNew.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pwNew === pwCur) {
      setPwError("New password must be different from the current one.");
      return;
    }
    if (pwNew !== pwCf) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwCur("");
    setPwNew("");
    setPwCf("");
    showToast("Password updated");
  };

  // Derived Overview Metrics
  const overviewMetrics = useMemo(() => {
    if (!currentBlueprint) return [];
    let totalRecords = 0;
    currentBlueprint.mods.forEach((m) => {
      totalRecords += (currentDb[m.s] || []).length;
    });

    const metrics: Array<{ label: string; value: string | number }> = [
      { label: "Total records", value: totalRecords },
      { label: "Modules", value: currentBlueprint.mods.length },
    ];

    currentBlueprint.mods.forEach((m) => {
      m.f
        .filter((f) => f[2] === "currency")
        .forEach((f) => {
          const records = currentDb[m.s] || [];
          if (records.length > 0 && metrics.length < 5) {
            const sum = records.reduce((acc, r) => acc + (parseFloat(r[f[0]]) || 0), 0);
            metrics.push({
              label: `${m.n}: total ${f[1].toLowerCase()}`,
              value: formatMoney(sum),
            });
          }
        });
    });

    return metrics;
  }, [currentBlueprint, currentDb, formatMoney]);

  const totalRecordsCount = useMemo(() => {
    if (!currentBlueprint) return 0;
    return currentBlueprint.mods.reduce((acc, m) => acc + (currentDb[m.s] || []).length, 0);
  }, [currentBlueprint, currentDb]);

  const currentModule = getModule(activeView);

  const filteredRows = useMemo(() => {
    if (!currentModule) return [];
    const rows = currentDb[currentModule.s] || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      return currentModule.f.some((f) => {
        const val =
          f[2] === "relation"
            ? resolveRecordLabel(f[3]?.to || "", r[f[0]])
            : r[f[0]] ?? "";
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [currentModule, currentDb, searchQuery, resolveRecordLabel]);

  const headerTitle =
    activeView === "overview"
      ? "Overview"
      : activeView === "settings"
        ? "Settings"
        : activeView === "profile"
          ? "Profile"
          : currentModule?.n || "Module";

  if (!isMounted) {
    return (
      <div className="vf-shell">
        <div className="vf-app">
          {/* Skeleton Sidebar */}
          <aside className="vf-aside" aria-label="Loading workspace navigation">
            <div className="brand" style={{ padding: "4px 8px 14px" }}>
              <VifeMSLogo theme="dark" size="md" />
            </div>
            <div className="vf-skel-dark" style={{ height: "38px", width: "100%", marginBottom: "16px", borderRadius: "8px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="vf-skel-dark" style={{ height: "36px", width: "100%", borderRadius: "8px" }} />
              <div className="vf-skel-dark" style={{ height: "36px", width: "88%", borderRadius: "8px" }} />
              <div className="vf-skel-dark" style={{ height: "36px", width: "94%", borderRadius: "8px" }} />
              <div className="vf-skel-dark" style={{ height: "36px", width: "80%", borderRadius: "8px" }} />
              <div className="vf-skel-dark" style={{ height: "36px", width: "84%", borderRadius: "8px" }} />
            </div>
            <div className="vf-sp" />
            <div className="vf-skel-dark" style={{ height: "48px", width: "100%", borderRadius: "10px" }} />
          </aside>

          {/* Skeleton Canvas */}
          <div className="vf-col">
            <header className="vf-header">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="vf-skel" style={{ height: "12px", width: "130px" }} />
                <div className="vf-skel" style={{ height: "22px", width: "170px" }} />
              </div>
              <div className="vf-sp" />
              <div className="vf-skel" style={{ height: "38px", width: "240px", borderRadius: "8px" }} />
            </header>

            <main className="vf-main">
              {/* Skeleton Hero Banner */}
              <div className="vf-skel" style={{ height: "86px", width: "100%", borderRadius: "14px", marginBottom: "22px" }} />

              {/* Skeleton Metrics */}
              <div className="vf-mets">
                <div className="vf-skel" style={{ height: "92px", borderRadius: "12px" }} />
                <div className="vf-skel" style={{ height: "92px", borderRadius: "12px" }} />
                <div className="vf-skel" style={{ height: "92px", borderRadius: "12px" }} />
                <div className="vf-skel" style={{ height: "92px", borderRadius: "12px" }} />
              </div>

              {/* Skeleton Modules Grid */}
              <div className="vf-mods">
                <div className="vf-skel" style={{ height: "138px", borderRadius: "12px" }} />
                <div className="vf-skel" style={{ height: "138px", borderRadius: "12px" }} />
                <div className="vf-skel" style={{ height: "138px", borderRadius: "12px" }} />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`vf-shell ${mobileNavOpen ? "vf-nav-open" : ""} ${mobileSearchOpen ? "vf-search-open" : ""}`}>
      {/* Mobile Backdrop placed outside .vf-app to avoid breaking grid columns */}
      <div className="vf-bk" onClick={() => setMobileNavOpen(false)} />

      <div className="vf-app">
        {/* ── Left Sidebar (3-pane layout architecture) ── */}
        <aside className="vf-aside" aria-label="Workspace navigation">
          <Link href="/" className="brand" aria-label="VifeMS home">
            <VifeMSLogo theme="dark" size="md" />
          </Link>

          {/* Workspace Switcher */}
          <select
            className="vf-select-ws"
            aria-label="Workspace"
            value={workspaceKey}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                router.push("/onboarding");
                return;
              }
              setWorkspaceKey(e.target.value);
              navigateTo("overview");
            }}
          >
            {Object.keys(blueprints).map((k) => (
              <option key={k} value={k}>
                {blueprints[k].name} {k !== "c" && k !== "e" ? "(Your Workspace)" : ""}
              </option>
            ))}
            <option value="__new__">+ New Workspace (Onboarding)</option>
          </select>

          {/* Overview Nav Item */}
          <button
            className={`vf-nv ${activeView === "overview" ? "on" : ""}`}
            onClick={() => navigateTo("overview")}
          >
            <i className="vf-ni">▦</i>
            Overview
          </button>

          {/* Dynamic Module Nav Items */}
          <div className="vf-sl">Modules</div>
          {currentBlueprint?.mods.map((m) => (
            <button
              key={m.s}
              className={`vf-nv ${activeView === m.s ? "on" : ""}`}
              onClick={() => navigateTo(m.s)}
            >
              <span>{m.n}</span>
              <span className="cn">{(currentDb[m.s] || []).length}</span>
            </button>
          ))}

          <div className="vf-sp" />

          {/* Settings Nav Item */}
          <button
            className={`vf-nv ${activeView === "settings" ? "on" : ""}`}
            onClick={() => navigateTo("settings")}
          >
            <i className="vf-ni">⚙</i>
            Settings
          </button>

          {/* Profile User Footer Button */}
          <button
            className={`vf-usr ${activeView === "profile" ? "on" : ""}`}
            onClick={() => navigateTo("profile")}
            aria-label="Open profile"
          >
            <span className="vf-av2">{getInitials()}</span>
            <div>
              <b>{user.name}</b>
              <small>View profile</small>
            </div>
          </button>
        </aside>

        {/* ── Main Column ── */}
        <div className="vf-col">
          {/* Top Header */}
          <header className="vf-header">
            <button
              className="vf-ic vf-mob"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>

            <Link href="/" className="vf-mob-logo" aria-label="VifeMS home">
              <VifeMSLogo theme="light" size="sm" />
            </Link>

            <div className="vf-hd-title-group">
              <div className="vf-crumb">
                {currentBlueprint?.name} / {headerTitle}
              </div>
              <h1 className="vf-h1">{headerTitle}</h1>
            </div>

            <div className="vf-sp" />

            {/* Global Search Bar */}
            <input
              className="vf-srch"
              type="search"
              placeholder={currentModule ? `Search ${currentModule.n.toLowerCase()}...` : "Search records"}
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!currentModule}
            />

            {/* Mobile Search Toggle */}
            <button
              className="vf-ic vf-mob"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Search"
            >
              ⌕
            </button>

            {/* Contextual Action Button */}
            {currentModule && (
              <button
                className="vf-btn vf-btn hd"
                onClick={() => openRecordForm(currentModule.s)}
              >
                + Add {sing(currentModule)}
              </button>
            )}

            {/* Header Profile Avatar */}
            <button
              className="vf-av"
              aria-label="Open profile"
              onClick={() => navigateTo("profile")}
              title={`Signed in as ${user.name}`}
            >
              {getInitials()}
            </button>
          </header>

          {/* Main Content Area */}
          <main className="vf-main vf-fi" key={activeView}>
            {/* VIEW 1: OVERVIEW */}
            {activeView === "overview" && (
              <>
                {/* Hero Banner */}
                <section className="vf-hero">
                  <div>
                    <h2>{currentBlueprint?.name}</h2>
                    <p>
                      {totalRecordsCount} {totalRecordsCount === 1 ? "record" : "records"} across{" "}
                      {currentBlueprint?.mods.length} modules.
                    </p>
                  </div>
                  <div className="vf-hb">
                    {currentBlueprint?.mods.slice(0, 2).map((m) => (
                      <button
                        key={m.s}
                        className="vf-btn"
                        onClick={() => openRecordForm(m.s)}
                      >
                        + Add {sing(m)}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Dynamic Metric Cards */}
                <div className="vf-mets">
                  {overviewMetrics.map((met, idx) => (
                    <div key={idx} className="vf-met">
                      <small>{met.label}</small>
                      <b>{met.value}</b>
                    </div>
                  ))}
                </div>

                {/* Modules Roster */}
                <h2 className="vf-h2">Modules</h2>
                <div className="vf-mods">
                  {currentBlueprint?.mods.map((m) => (
                    <div key={m.s} className="vf-mod">
                      <h3>
                        <button onClick={() => navigateTo(m.s)}>{m.n}</button>
                        <span>{(currentDb[m.s] || []).length}</span>
                      </h3>
                      <p>{m.d}</p>
                      <button
                        className="vf-btn g"
                        onClick={() => openRecordForm(m.s)}
                      >
                        + Add record
                      </button>
                    </div>
                  ))}
                </div>

                {/* Real Activity Stream */}
                <h2 className="vf-h2">Recent activity</h2>
                {currentLog.length > 0 ? (
                  <ul className="vf-log">
                    {currentLog.slice(0, 7).map((l, i) => (
                      <li key={i}>
                        <span>{l.x}</span>
                        <time>{formatAgo(l.t)}</time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="vf-empty">
                    <p>No activity yet. Changes to your records will appear here.</p>
                  </div>
                )}
              </>
            )}

            {/* VIEW 2: MODULE DYNAMIC CRUD TABLE */}
            {currentModule && (
              <>
                <p className="vf-sub">
                  {currentModule.d} <b>{(currentDb[currentModule.s] || []).length}</b>{" "}
                  {(currentDb[currentModule.s] || []).length === 1
                    ? sing(currentModule).toLowerCase()
                    : currentModule.n.toLowerCase()}{" "}
                  in total.
                </p>

                {(currentDb[currentModule.s] || []).length === 0 ? (
                  <div className="vf-empty">
                    <p>
                      No {currentModule.n.toLowerCase()} yet. Add your first {sing(currentModule).toLowerCase()} to get started.
                    </p>
                    <button
                      className="vf-btn"
                      onClick={() => openRecordForm(currentModule.s)}
                    >
                      + Add {sing(currentModule)}
                    </button>
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="vf-empty">
                    <p>No {currentModule.n.toLowerCase()} match &quot;{searchQuery}&quot;.</p>
                  </div>
                ) : (
                  <div className="vf-tw">
                    <table className="vf-table">
                      <thead>
                        <tr>
                          {currentModule.f.map((f) => (
                            <th
                              key={f[0]}
                              className={["number", "currency"].includes(f[2]) ? "vf-n" : ""}
                            >
                              {f[1]}
                            </th>
                          ))}
                          <th className="vf-act">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => (
                          <tr key={row.id}>
                            {currentModule.f.map((f, i) => (
                              <td
                                key={f[0]}
                                className={["number", "currency"].includes(f[2]) ? "vf-n" : ""}
                              >
                                {i === 0 && f[2] === "text" && row[f[0]] ? (
                                  <span className="vf-ch">
                                    <i className="vf-mono s">
                                      {String(row[f[0]]).charAt(0).toUpperCase()}
                                    </i>
                                    {renderCell(f, row[f[0]])}
                                  </span>
                                ) : (
                                  renderCell(f, row[f[0]])
                                )}
                              </td>
                            ))}
                            <td className="vf-act">
                              <button
                                onClick={() => openRecordForm(currentModule.s, row.id)}
                                aria-label="Edit record"
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => openDeleteDialog(currentModule.s, row.id)}
                                aria-label="Delete record"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* VIEW 3: PROFILE SECTION */}
            {activeView === "profile" && (
              <>
                {/* Profile Header Banner */}
                <section className="vf-pf">
                  <div className="vf-pb">
                    <span className="vf-pa">{getInitials()}</span>
                    <div className="vf-pi">
                      <h2>{user.name}</h2>
                      <p>
                        {user.email} · {currentBlueprint?.name}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Profile Tabs */}
                <div className="vf-tb" role="tablist">
                  <button
                    role="tab"
                    aria-selected={profileTab === "p"}
                    className={profileTab === "p" ? "on" : ""}
                    onClick={() => setProfileTab("p")}
                  >
                    Personal
                  </button>
                  <button
                    role="tab"
                    aria-selected={profileTab === "o"}
                    className={profileTab === "o" ? "on" : ""}
                    onClick={() => setProfileTab("o")}
                  >
                    Organization
                  </button>
                  <button
                    role="tab"
                    aria-selected={profileTab === "s"}
                    className={profileTab === "s" ? "on" : ""}
                    onClick={() => setProfileTab("s")}
                  >
                    Security
                  </button>
                </div>

                {/* Profile Tab Contents */}
                <div className="vf-pg">
                  {/* TAB 1: PERSONAL DETAILS */}
                  {profileTab === "p" && (
                    <div className="vf-cd">
                      <h2 className="vf-h2">Personal details</h2>
                      <form onSubmit={handleSavePersonal}>
                        <label className="vf-fl">
                          <span>Display name</span>
                          <input
                            value={pName}
                            onChange={(e) => setPName(e.target.value)}
                            required
                          />
                        </label>
                        <label className="vf-fl">
                          <span>Email</span>
                          <input
                            type="email"
                            value={pEmail}
                            onChange={(e) => setPEmail(e.target.value)}
                            required
                          />
                        </label>
                        <div className="vf-ft">
                          <button
                            type="button"
                            className="vf-btn g"
                            onClick={() => {
                              setPName(user.name);
                              setPEmail(user.email);
                            }}
                          >
                            Discard
                          </button>
                          <button
                            type="submit"
                            className="vf-btn"
                            disabled={!isPersonalDirty}
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 2: ORGANIZATION PROFILE */}
                  {profileTab === "o" && (
                    <div className="vf-cd">
                      <h2 className="vf-h2">Organization profile</h2>
                      <form onSubmit={handleSaveOrg}>
                        <label className="vf-fl">
                          <span>Business name</span>
                          <input
                            value={orgBusinessName}
                            onChange={(e) => setOrgBusinessName(e.target.value)}
                            required
                          />
                        </label>
                        <label className="vf-fl">
                          <span>Industry</span>
                          <input
                            value={orgIndustry}
                            onChange={(e) => setOrgIndustry(e.target.value)}
                          />
                        </label>
                        <div className="vf-two">
                          <label className="vf-fl">
                            <span>Business email</span>
                            <input
                              type="email"
                              value={orgEmail}
                              onChange={(e) => setOrgEmail(e.target.value)}
                            />
                          </label>
                          <label className="vf-fl">
                            <span>Phone</span>
                            <input
                              type="tel"
                              value={orgPhone}
                              onChange={(e) => setOrgPhone(e.target.value)}
                            />
                          </label>
                        </div>
                        <label className="vf-fl">
                          <span>Website</span>
                          <input
                            value={orgWeb}
                            onChange={(e) => setOrgWeb(e.target.value)}
                          />
                        </label>
                        <label className="vf-fl">
                          <span>Address</span>
                          <input
                            value={orgAddr}
                            onChange={(e) => setOrgAddr(e.target.value)}
                            placeholder="Street, area, city"
                          />
                        </label>
                        <div className="vf-ft">
                          <button
                            type="button"
                            className="vf-btn g"
                            onClick={() => {
                              setOrgBusinessName(currentBlueprint.name);
                              setOrgIndustry(currentOrg.industry);
                              setOrgEmail(currentOrg.email);
                              setOrgPhone(currentOrg.phone);
                              setOrgWeb(currentOrg.web);
                              setOrgAddr(currentOrg.addr);
                            }}
                          >
                            Discard
                          </button>
                          <button
                            type="submit"
                            className="vf-btn"
                            disabled={!isOrgDirty}
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 3: CHANGE PASSWORD / SECURITY */}
                  {profileTab === "s" && (
                    <div className="vf-cd">
                      <h2 className="vf-h2">Change password</h2>
                      <form onSubmit={handleSavePassword}>
                        <label className="vf-fl">
                          <span>Current password</span>
                          <input
                            type="password"
                            autoComplete="current-password"
                            value={pwCur}
                            onChange={(e) => setPwCur(e.target.value)}
                            required
                          />
                        </label>
                        <label className="vf-fl">
                          <span>New password</span>
                          <input
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            value={pwNew}
                            onChange={(e) => setPwNew(e.target.value)}
                            required
                          />
                        </label>
                        <div className="vf-str">
                          <i
                            style={{
                              width: pwNew ? `${Math.max(12, pwStrength.score * 25)}%` : "0%",
                              background:
                                pwStrength.score <= 1
                                  ? "#dc2626"
                                  : pwStrength.score === 2
                                    ? "#d97706"
                                    : "#059669",
                            }}
                          />
                        </div>
                        <p className="vf-hintp">{pwStrength.text}</p>
                        <label className="vf-fl">
                          <span>Confirm new password</span>
                          <input
                            type="password"
                            autoComplete="new-password"
                            value={pwCf}
                            onChange={(e) => setPwCf(e.target.value)}
                            required
                          />
                        </label>

                        {pwError && <p className="vf-er">{pwError}</p>}

                        <div className="vf-ft">
                          <button type="submit" className="vf-btn">
                            Update password
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Right Column Side Card */}
                  <div className="vf-ps">
                    {profileTab === "o" ? (
                      <div className="vf-cd">
                        <h2 className="vf-h2">Workspace</h2>
                        <dl>
                          <dt>Workspace</dt>
                          <dd>{currentBlueprint?.name}</dd>
                          <dt>Modules</dt>
                          <dd>{currentBlueprint?.mods.length}</dd>
                          <dt>Records</dt>
                          <dd>{totalRecordsCount}</dd>
                          <dt>Locale</dt>
                          <dd>
                            {currentBlueprint?.loc} · {currentBlueprint?.cur}
                          </dd>
                        </dl>
                      </div>
                    ) : (
                      <div className="vf-cd">
                        <h2 className="vf-h2">Session</h2>
                        <p className="vf-sub">You&apos;re signed in on this device.</p>
                        <button
                          className="vf-btn g"
                          onClick={() => showToast("Signed out (demo)")}
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* VIEW 4: WORKSPACE SETTINGS */}
            {activeView === "settings" && (
              <>
                <div className="vf-cd">
                  <h2 className="vf-h2">Workspace Details</h2>
                  <dl>
                    <dt>Name</dt>
                    <dd>{currentBlueprint?.name}</dd>
                    <dt>Locale</dt>
                    <dd>{currentBlueprint?.loc}</dd>
                    <dt>Currency</dt>
                    <dd>{currentBlueprint?.cur}</dd>
                    <dt>Modules</dt>
                    <dd>{currentBlueprint?.mods.length}</dd>
                  </dl>
                </div>

                <div className="vf-cd">
                  <h2 className="vf-h2">Active Schema Inspector</h2>
                  {currentBlueprint?.mods.map((m) => (
                    <div key={m.s} style={{ marginBottom: 14 }}>
                      <b style={{ color: "var(--vf-fg)" }}>{m.n}</b>
                      <br />
                      <span style={{ color: "var(--vf-mut)", fontSize: 13 }}>
                        {m.f
                          .map((f) => {
                            if (f[2] === "relation") {
                              const target = getModule(f[3]?.to || "");
                              return `${f[1]} → ${target ? target.n : f[3]?.to}`;
                            }
                            return `${f[1]} (${f[2]})`;
                          })
                          .join(", ")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="vf-cd">
                  <h2 className="vf-h2">Authentication &amp; Session</h2>
                  <p style={{ margin: "0 0 12px", color: "var(--vf-mut)" }}>
                    Signed in as <b>{user.name}</b> ({user.email})
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="vf-btn g"
                      onClick={() => showToast("Signed out (demo)")}
                    >
                      Sign out
                    </button>
                    <Link href="/onboarding" className="vf-btn">
                      + Launch New AI Workspace
                    </Link>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── MODALS / DIALOGS ── */}

      {dialog?.type === "form" && (() => {
        const mod = getModule(dialog.moduleSlug);
        if (!mod) return null;
        const existingRecord = dialog.recordId
          ? (currentDb[dialog.moduleSlug] || []).find((r) => r.id === dialog.recordId) || null
          : null;

        return (
          <RecordFormModal
            module={mod}
            existingRecord={existingRecord}
            currentDb={currentDb}
            resolveRecordLabel={resolveRecordLabel}
            getCurrencySymbol={getCurrencySymbol}
            getModule={getModule}
            onSave={(data) => handleSaveRecord(dialog.moduleSlug, dialog.recordId, data)}
            onClose={() => setDialog(null)}
          />
        );
      })()}

      {dialog?.type === "prerequisite" && (() => {
        const mod = getModule(dialog.moduleSlug);
        const parentMod = getModule(dialog.parentModuleSlug);
        if (!mod || !parentMod) return null;

        return (
          <PrerequisiteModal
            module={mod}
            parentModule={parentMod}
            onAddParent={() => {
              setDialog(null);
              navigateTo(parentMod.s);
              openRecordForm(parentMod.s);
            }}
            onClose={() => setDialog(null)}
          />
        );
      })()}

      {dialog?.type === "blockedDelete" && (() => {
        const mod = getModule(dialog.moduleSlug);
        if (!mod) return null;

        return (
          <BlockedDeleteModal
            module={mod}
            blockers={dialog.blockers}
            onClose={() => setDialog(null)}
          />
        );
      })()}

      {dialog?.type === "confirmDelete" && (() => {
        const mod = getModule(dialog.moduleSlug);
        if (!mod) return null;

        return (
          <ConfirmDeleteModal
            module={mod}
            onConfirm={() => handleDeleteRecord(dialog.moduleSlug, dialog.recordId)}
            onClose={() => setDialog(null)}
          />
        );
      })()}

      {/* ── Toast Notification ── */}
      <div className={`vf-toast ${toastVisible ? "on" : ""}`} role="status">
        {toastMessage}
      </div>
    </div>
  );
}
