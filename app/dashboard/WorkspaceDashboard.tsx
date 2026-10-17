"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  ApiRequestError,
  DynamicFieldValue,
  getWorkspace,
  updateWorkspace,
  listWorkspaces,
  getWorkspaceOverview,
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  getCurrentUser,
  logoutUser,
  WorkspaceRecord,
  WorkspaceMetadata,
  WorkspaceModuleMeta,
  WorkspaceOverview,
  UserProfile,
} from "@/lib/api/workspace";
import {
  getFinancialCapabilities,
  FinancialCapabilities,
  Invoice,
  Payment,
  Receipt,
} from "@/lib/api/financial";
import InvoicesView from "@/components/financial/InvoicesView";
import PaymentsReceiptsView from "@/components/financial/PaymentsReceiptsView";
import CreateInvoiceModal from "@/components/financial/CreateInvoiceModal";
import InvoiceModal from "@/components/financial/InvoiceModal";
import RecordPaymentModal from "@/components/financial/RecordPaymentModal";
import ReceiptModal from "@/components/financial/ReceiptModal";
import "./dashboard.css";

export interface WorkspaceDashboardProps {
  initialWorkspaceId?: string;
}
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isDynamicFieldValue(value: unknown): value is DynamicFieldValue {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

export default function WorkspaceDashboard({ initialWorkspaceId }: WorkspaceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Selected workspace identifier
  const workspaceId =
    initialWorkspaceId ||
    searchParams.get("workspaceId") ||
    "";

  // Authentication & User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Workspaces list
  const [workspacesList, setWorkspacesList] = useState<WorkspaceMetadata[]>([]);

  // Workspace Data & Metadata
  const [workspace, setWorkspace] = useState<WorkspaceMetadata | null>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState<{ status?: number; message: string } | null>(null);

  // Overview / Metrics Data
  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);

  // Active View: "overview" | moduleIdOrSlug | "settings"
  const [activeView, setActiveView] = useState<string>("overview");

  // Module records state: { [moduleId]: WorkspaceRecord[] }
  const [moduleRecords, setModuleRecords] = useState<Record<string, WorkspaceRecord[]>>({});
  const [recordsTotal, setRecordsTotal] = useState<Record<string, number>>({});
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsPage, setRecordsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Cache of all records across modules for relationship resolving: { [moduleSlugOrId]: WorkspaceRecord[] }
  const [relCache, setRelCache] = useState<Record<string, WorkspaceRecord[]>>({});

  // Dialog State
  type DialogState =
    | { type: "add"; moduleId: string }
    | { type: "edit"; moduleId: string; record: WorkspaceRecord }
    | { type: "view"; moduleId: string; record: WorkspaceRecord }
    | { type: "delete"; moduleId: string; recordId: string }
    | null;

  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogError, setDialogError] = useState<string>("");
  const [isDialogSubmitting, setIsDialogSubmitting] = useState(false);

  // Financial Engine State
  const [financialCapabilities, setFinancialCapabilities] = useState<FinancialCapabilities | null>(null);

  type FinancialModalState =
    | { type: "createInvoice"; sourceModule?: WorkspaceModuleMeta; sourceRecord?: WorkspaceRecord | null }
    | { type: "viewInvoice"; invoiceId: string }
    | { type: "recordPayment"; invoice: Invoice }
    | { type: "viewReceipt"; receipt: Receipt }
    | null;

  const [financialModal, setFinancialModal] = useState<FinancialModalState>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Mobile navigation
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [mobileNavRoute, setMobileNavRoute] = useState<string | null>(null);
  const mobileNavOpen = mobileNavRoute === routeKey;
  const setMobileNavOpen = (open: boolean) => setMobileNavRoute(open ? routeKey : null);

  // Editable Workspace Name
  const [isEditingWsName, setIsEditingWsName] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isUpdatingWsName, setIsUpdatingWsName] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const handleStartEditWsName = () => {
    setNewWsName(workspace?.name || "");
    setIsEditingWsName(true);
  };

  const handleCancelEditWsName = () => {
    setIsEditingWsName(false);
    setNewWsName("");
  };

  const handleSaveWsName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newWsName.trim();
    if (!trimmed) {
      showToast("Workspace name cannot be empty.");
      return;
    }
    if (trimmed === workspace?.name) {
      setIsEditingWsName(false);
      return;
    }

    setIsUpdatingWsName(true);
    try {
      const updated = await updateWorkspace(workspaceId, { name: trimmed });
      setWorkspace((previous) => previous ? { ...previous, name: updated.name || trimmed } : previous);
      setWorkspacesList((prevList) =>
        prevList.map((w) => (w.id === workspaceId ? { ...w, name: trimmed } : w))
      );
      setIsEditingWsName(false);
      showToast("Workspace name updated successfully.");
    } catch (error) {
      showToast(errorMessage(error, "Failed to update workspace name."));
    } finally {
      setIsUpdatingWsName(false);
    }
  };

  // 1. Authenticate user
  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((usr) => {
        if (mounted) {
          setUser(usr);
          setAuthChecking(false);
        }
      })
      .catch(() => {
        if (mounted) {
          router.replace("/login");
        }
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  // 2. Fetch list of user's workspaces
  useEffect(() => {
    if (authChecking) return;
    listWorkspaces()
      .then((list) => {
        setWorkspacesList(list);
        // If no workspaceId provided, select first available or redirect to onboarding
        if (!workspaceId) {
          if (list && list.length > 0) {
            router.replace(`/dashboard/${list[0].id}`);
          } else {
            router.replace("/onboarding");
            setWsLoading(false);
          }
        }
      })
      .catch((error: unknown) => {
        setWsError({
          message: errorMessage(error, "Failed to load workspaces list."),
        });
        setWsLoading(false);
      });
  }, [authChecking, workspaceId, router]);

  // 3. Load active workspace & overview
  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId || authChecking) return;

    try {
      const wsData = await getWorkspace(workspaceId);
      setWsError(null);
      setWorkspace(wsData);

      // Load overview metrics
      try {
        const ovData = await getWorkspaceOverview(workspaceId);
        setOverview(ovData);
      } catch (ovErr) {
        console.warn("Could not load overview:", ovErr);
      }

      // Pre-load records for all modules to populate relation options
      const mods = wsData.modules || [];
      const cacheAcc: Record<string, WorkspaceRecord[]> = {};
      for (const m of mods) {
        try {
          const recRes = await fetchRecords(workspaceId, m.id, 1, 50);
          cacheAcc[m.id] = recRes.records;
          cacheAcc[m.slug] = recRes.records;
        } catch {
          // A module without readable records should not prevent other modules from loading.
        }
      }
      setRelCache(cacheAcc);

      // Load financial capabilities
      try {
        const caps = await getFinancialCapabilities(workspaceId);
        setFinancialCapabilities(caps);
      } catch (capErr) {
        console.warn("Could not load financial capabilities:", capErr);
      }
    } catch (error) {
      setWsError({
        status: error instanceof ApiRequestError ? error.status : undefined,
        message: errorMessage(error, "Failed to load workspace."),
      });
    } finally {
      setWsLoading(false);
    }
  }, [workspaceId, authChecking]);

  useEffect(() => {
    const timer = setTimeout(() => { void loadWorkspaceData(); }, 0);
    return () => clearTimeout(timer);
  }, [loadWorkspaceData]);

  // Find active module object
  const activeModule = useMemo(() => {
    if (!workspace || !workspace.modules) return null;
    return workspace.modules.find(
      (module) => module.id === activeView || module.slug === activeView
    );
  }, [workspace, activeView]);

  // Load records for active module
  const loadActiveModuleRecords = useCallback(async () => {
    if (!workspaceId || !activeModule) return;
    setRecordsLoading(true);
    try {
      const res = await fetchRecords(
        workspaceId,
        activeModule.id,
        recordsPage,
        50,
        searchQuery
      );
      setModuleRecords((prev) => ({ ...prev, [activeModule.id]: res.records }));
      setRecordsTotal((prev) => ({ ...prev, [activeModule.id]: res.total }));

      // Also update relationship cache
      setRelCache((prev) => ({
        ...prev,
        [activeModule.id]: res.records,
        [activeModule.slug]: res.records,
      }));
    } catch (error) {
      showToast(errorMessage(error, "Failed to fetch module records."));
    } finally {
      setRecordsLoading(false);
    }
  }, [workspaceId, activeModule, recordsPage, searchQuery, showToast]);

  useEffect(() => {
    let cancelled = false;
    const loadRecords = async () => {
      if (!activeModule) return;
      try {
        const result = await fetchRecords(workspaceId, activeModule.id, recordsPage, 50, searchQuery);
        if (cancelled) return;
        setModuleRecords((previous) => ({ ...previous, [activeModule.id]: result.records }));
        setRecordsTotal((previous) => ({ ...previous, [activeModule.id]: result.total }));
        setRelCache((previous) => ({
          ...previous,
          [activeModule.id]: result.records,
          [activeModule.slug]: result.records,
        }));
      } catch (error) {
        if (!cancelled) showToast(errorMessage(error, "Failed to fetch module records."));
      }
    };
    void loadRecords();
    return () => { cancelled = true; };
  }, [activeModule, recordsPage, searchQuery, showToast, workspaceId]);

  // Helper to resolve human-readable record label
  const resolveRecordLabel = useCallback(
    (targetSlugOrId: string, recordId: string): string => {
      if (!recordId) return "—";
      const records = relCache[targetSlugOrId] || [];
      const match = records.find((r) => r.id === recordId);
      if (!match) return recordId;

      // Check fields for best label
      const mod = workspace?.modules?.find(
        (module) => module.id === targetSlugOrId || module.slug === targetSlugOrId
      );
      const fields = mod?.fields || [];
      const labelField = fields.find((field) =>
        ["name", "full_name", "title", "label", "number", "item_name", "customer_name", "client_name"].includes(
          field.name
        )
      ) || fields[0];

      if (labelField && match[labelField.name]) {
        return String(match[labelField.name]);
      }
      if (labelField && match.data?.[labelField.name]) {
        return String(match.data[labelField.name]);
      }
      return match.id;
    },
    [relCache, workspace]
  );

  // Helper for singular name
  const sing = (name: string) => name.replace(/s$/, "");

  // Helper for user initials
  const initials = useMemo(() => {
    if (!user?.fullName) return "VF";
    return user.fullName
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  // Handle Record Creation
  const handleSaveRecord = async (formData: Record<string, DynamicFieldValue>) => {
    if (!dialog || !workspaceId) return;
    setIsDialogSubmitting(true);
    setDialogError("");

    try {
      if (dialog.type === "add") {
        await createRecord(workspaceId, dialog.moduleId, formData);
        showToast("Record created successfully.");
      } else if (dialog.type === "edit") {
        await updateRecord(workspaceId, dialog.moduleId, dialog.record.id, formData);
        showToast("Record updated successfully.");
      }
      setDialog(null);
      await loadActiveModuleRecords();
      // Refresh overview
      getWorkspaceOverview(workspaceId).then(setOverview).catch(() => { });
    } catch (error) {
      setDialogError(errorMessage(error, "Failed to save record."));
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  // Handle Record Deletion
  const handleDeleteRecord = async () => {
    if (!dialog || dialog.type !== "delete" || !workspaceId) return;
    setIsDialogSubmitting(true);
    setDialogError("");

    try {
      await deleteRecord(workspaceId, dialog.moduleId, dialog.recordId);
      showToast("Record deleted successfully.");
      setDialog(null);
      await loadActiveModuleRecords();
      getWorkspaceOverview(workspaceId).then(setOverview).catch(() => { });
    } catch (error) {
      setDialogError(errorMessage(error, "Failed to delete record."));
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  /* ── RENDER STATES ── */

  if (authChecking || wsLoading) {
    return <DashboardSkeleton />;
  }

  if (wsError) {
    return (
      <div className="vf-shell" style={{ display: "grid", placeItems: "center", padding: 24 }}>
        <div className="vf-card" style={{ maxWidth: 480, width: "100%", padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--vf-err)", marginBottom: 12 }}>
            {wsError.status === 403
              ? "Access Denied"
              : wsError.status === 404
                ? "Workspace Not Found"
                : "Unable to Load Workspace"}
          </h2>
          <p style={{ color: "var(--vf-mut)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            {wsError.status === 403
              ? "You do not have authorization to view this workspace. Please select a workspace you own."
              : wsError.message}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/onboarding" className="vf-btn">
              Create New Workspace
            </Link>
            {workspacesList.length > 0 && (
              <button
                className="vf-btn g"
                onClick={() => router.push(`/dashboard/${workspacesList[0].id}`)}
              >
                Go to My Workspaces
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const modules: WorkspaceModuleMeta[] = workspace?.modules || [];
  const activeRecords = activeModule ? moduleRecords[activeModule.id] || [] : [];
  const activeTotal = activeModule ? recordsTotal[activeModule.id] || 0 : 0;

  return (
    <div className="vf-shell">
      {/* ── MOBILE HEADER (Sticky top, visible only on mobile < lg) ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#09122c] border-b border-slate-800 text-slate-100 lg:hidden shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-base text-white truncate max-w-[240px]" title={workspace?.name || "Workshop"}>
            {workspace?.name || "Workshop"}
          </span>
        </div>
      </header>

      {/* ── BACKDROP OVERLAY FOR MOBILE DRAWER ── */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      <div className="vf-app">
        {/* ── SIDEBAR NAVIGATION (Desktop Fixed & Mobile Slide-Over Drawer) ── */}
        <aside
          className={`vf-aside ${mobileNavOpen ? "open" : ""}`}
          style={
            mobileNavOpen
              ? { transform: "translateX(0)", zIndex: 100 }
              : undefined
          }
        >
          {/* Brand header / Drawer top */}
          <div className="vf-lg flex items-center justify-between gap-2">
            <span
              className="font-bold text-lg text-white truncate max-w-[200px]"
              title={workspace?.name || "Workshop"}
            >
              {workspace?.name || "Workshop"}
            </span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="vf-sl">MAIN</div>
          <button
            className={`vf-nv ${activeView === "overview" ? "on" : ""}`}
            onClick={() => {
              setActiveView("overview");
              setMobileNavOpen(false);
            }}
          >
            <span>Overview</span>
          </button>

          <div className="vf-sl">MODULES</div>
          {modules.map((m) => (
            <button
              key={m.id}
              className={`vf-nv ${activeView === m.id || activeView === m.slug ? "on" : ""}`}
              onClick={() => {
                setActiveView(m.id);
                setRecordsPage(1);
                setSearchQuery("");
                setMobileNavOpen(false);
              }}
            >
              <span style={{ flex: 1, textAlign: "left" }}>{m.name}</span>
              {overview?.moduleStats && (
                <span className="vf-badge" style={{ fontSize: 11 }}>
                  {overview.moduleStats.find((stat) => stat.moduleId === m.id)?.recordCount ?? 0}
                </span>
              )}
            </button>
          ))}

          {/* FINANCIAL MODULES */}
          {financialCapabilities?.enabled && (
            <>
              <div className="vf-sl" style={{ marginTop: 12 }}>FINANCIAL</div>
              <button
                className={`vf-nv ${activeView === "invoices" ? "on" : ""}`}
                onClick={() => {
                  setActiveView("invoices");
                  setMobileNavOpen(false);
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>Invoices</span>
              </button>
              <button
                className={`vf-nv ${activeView === "payments" ? "on" : ""}`}
                onClick={() => {
                  setActiveView("payments");
                  setMobileNavOpen(false);
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>Payments &amp; Receipts</span>
              </button>
            </>
          )}

          <div style={{ marginTop: "auto" }}>
            <div className="vf-sl">SYSTEM</div>
            <button
              className={`vf-nv ${activeView === "settings" ? "on" : ""}`}
              onClick={() => {
                setActiveView("settings");
                setMobileNavOpen(false);
              }}
            >
              <span>Settings &amp; Account</span>
            </button>
            <Link
              href="/onboarding"
              onClick={() => setMobileNavOpen(false)}
              className="vf-nv"
              style={{ textDecoration: "none", color: "#9fb3ee", marginTop: 4 }}
            >
              <span>+ New Workspace</span>
            </Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="vf-main">
          {/* Top Navbar on Desktop / Content Header (Hidden on Mobile) */}
          <header className="vf-top hidden lg:flex">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <h1 className="vf-title" style={{ fontSize: 18, margin: 0 }}>
                  {activeView === "overview"
                    ? workspace?.name || "Workspace Overview"
                    : activeView === "settings"
                      ? "Settings & Account"
                      : activeView === "invoices"
                        ? "Invoices & Billing"
                        : activeView === "payments"
                          ? "Payments & Receipts"
                          : activeModule?.name}
                </h1>
                {activeView !== "overview" && (
                  <p className="vf-sub" style={{ margin: 0, fontSize: 12.5 }}>
                    {activeView === "settings"
                      ? `Authenticated as ${user?.email}`
                      : activeView === "invoices"
                        ? "Issue, track, and manage invoices connected to workspace records"
                        : activeView === "payments"
                          ? "Verified payments and official tamper-evident receipts"
                          : `Live records in ${activeModule?.name}`}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
            {/* ── OVERVIEW TAB ── */}
            {activeView === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Metrics Cards Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="vf-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-mut)", textTransform: "uppercase" }}>
                      Total Business Records
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--vf-fg)", marginTop: 8 }}>
                      {overview?.totalRecords ?? 0}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--vf-mut)", marginTop: 4 }}>
                      Across {modules.length} provisioned dynamic modules
                    </div>
                  </div>

                  {modules.map((m) => {
                    const count =
                      overview?.moduleStats?.find((stat) => stat.moduleId === m.id)?.recordCount ?? 0;
                    return (
                      <div key={m.id} className="vf-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-mut)", textTransform: "uppercase" }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--vf-fg)", marginTop: 8 }}>
                          {count}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button
                            className="vf-btn"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() => {
                              setActiveView(m.id);
                              setDialog({ type: "add", moduleId: m.id });
                            }}
                          >
                            + Add {sing(m.name)}
                          </button>
                          <button
                            className="vf-btn g"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() => setActiveView(m.id)}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Operational Activity */}
                <div className="vf-card" style={{ padding: 24, border: "none", boxShadow: "none" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                    Recent Operational Activity
                  </h2>

                  {overview?.recentActivity && overview.recentActivity.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {overview.recentActivity.map((act, idx) => (
                        <div
                          key={act.recordId || idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "var(--vf-bg)",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600 }}>{act.moduleName}: </span>
                            <span>{act.label}</span>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--vf-mut)" }}>
                            {act.timestamp ? new Date(act.timestamp).toLocaleString() : "Just now"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--vf-mut)" }}>
                      <p style={{ margin: 0, fontSize: 14 }}>
                        No records created yet in this workspace.
                      </p>
                      <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                        Use the module cards above or the sidebar navigation to create your first business record.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── INVOICES VIEW ── */}
            {activeView === "invoices" && (
              <InvoicesView
                workspaceId={workspaceId}
                currency={financialCapabilities?.defaultCurrency || "USD"}
                onOpenCreate={() => setFinancialModal({ type: "createInvoice" })}
                onOpenDetails={(invId) => setFinancialModal({ type: "viewInvoice", invoiceId: invId })}
                onOpenPay={(inv) => setFinancialModal({ type: "recordPayment", invoice: inv })}
                onOpenReceipt={(rec) => setFinancialModal({ type: "viewReceipt", receipt: rec })}
              />
            )}

            {/* ── PAYMENTS & RECEIPTS VIEW ── */}
            {activeView === "payments" && (
              <PaymentsReceiptsView
                workspaceId={workspaceId}
                currency={financialCapabilities?.defaultCurrency || "USD"}
                onOpenReceipt={(rec) => setFinancialModal({ type: "viewReceipt", receipt: rec })}
              />
            )}

            {/* ── DYNAMIC MODULE RECORDS VIEW ── */}
            {activeModule && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Action Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                    <input
                      type="text"
                      className="vf-srch"
                      placeholder={`Search ${activeModule.name.toLowerCase()}…`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setRecordsPage(1);
                      }}
                      style={{ maxWidth: 300 }}
                    />
                    <span style={{ fontSize: 13, color: "var(--vf-mut)" }}>
                      {activeTotal} {activeTotal === 1 ? "record" : "records"}
                    </span>
                  </div>

                  <button
                    className="vf-btn"
                    onClick={() => setDialog({ type: "add", moduleId: activeModule.id })}
                  >
                    + Add {sing(activeModule.name)}
                  </button>
                </div>

                {/* Records Table */}
                <div className="vf-card" style={{ overflow: "hidden" }}>
                  {recordsLoading ? (
                    <div style={{ padding: 48, textAlign: "center", color: "var(--vf-mut)" }}>
                      Loading {activeModule.name} records…
                    </div>
                  ) : activeRecords.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center", color: "var(--vf-mut)" }}>
                      <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                        {searchQuery
                          ? `No records found matching "${searchQuery}".`
                          : `No ${activeModule.name.toLowerCase()} yet.`}
                      </p>
                      <p style={{ fontSize: 13, marginTop: 6 }}>
                        {!searchQuery && `Click "+ Add ${sing(activeModule.name)}" to create the first record.`}
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="vf-tb">
                        <thead>
                          <tr>
                            <th>Record ID</th>
                            {(activeModule.fields || []).map((f) => (
                              <th key={f.name || f.id}>{f.label || f.name}</th>
                            ))}
                            <th>Created</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeRecords.map((r) => (
                            <tr key={r.id}>
                              <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                                {r.id.substring(0, 14)}…
                              </td>
                              {(activeModule.fields || []).map((f) => {
                                const val = r[f.name] ?? r.data?.[f.name];
                                const typeLower = (f.typeLower || f.type || "").toLowerCase();

                                if (typeLower === "relation") {
                                  const targetSlug = f.targetModule || f.relatedEntityId || "";
                                  const resolved = resolveRecordLabel(targetSlug, String(val ?? ""));
                                  return (
                                    <td key={f.name}>
                                      {val ? (
                                        <span className="vf-tag" style={{ background: "var(--vf-pril)", color: "var(--vf-pri)" }}>
                                          {resolved}
                                        </span>
                                      ) : (
                                        "—"
                                      )}
                                    </td>
                                  );
                                }

                                if (typeLower === "boolean") {
                                  return (
                                    <td key={f.name}>
                                      <span
                                        className="vf-tag"
                                        style={{
                                          background: val ? "#dcfce7" : "#fee2e2",
                                          color: val ? "#15803d" : "#b91c1c",
                                        }}
                                      >
                                        {val ? "Yes" : "No"}
                                      </span>
                                    </td>
                                  );
                                }

                                if (typeLower === "select") {
                                  return (
                                    <td key={f.name}>
                                      {val ? <span className="vf-tag">{String(val)}</span> : "—"}
                                    </td>
                                  );
                                }

                                if (typeLower === "currency" && val !== null && val !== undefined) {
                                  return (
                                    <td key={f.name} style={{ fontWeight: 600 }}>
                                      {Number(val).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                  );
                                }

                                if (typeLower === "date" && val) {
                                  return (
                                    <td key={f.name}>
                                      {new Date(String(val)).toLocaleDateString()}
                                    </td>
                                  );
                                }

                                return (
                                  <td key={f.name}>
                                    {val !== null && val !== undefined ? String(val) : "—"}
                                  </td>
                                );
                              })}
                              <td style={{ fontSize: 12, color: "var(--vf-mut)" }}>
                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div style={{ display: "inline-flex", gap: 6 }}>
                                  <button
                                    className="vf-btn g"
                                    style={{ padding: "4px 8px", fontSize: 12 }}
                                    onClick={() => setDialog({ type: "view", moduleId: activeModule.id, record: r })}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="vf-btn g"
                                    style={{ padding: "4px 8px", fontSize: 12 }}
                                    onClick={() => setDialog({ type: "edit", moduleId: activeModule.id, record: r })}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="vf-btn d"
                                    style={{ padding: "4px 8px", fontSize: 12 }}
                                    onClick={() =>
                                      setDialog({ type: "delete", moduleId: activeModule.id, recordId: r.id })
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SETTINGS VIEW ── */}
            {activeView === "settings" && (
              <div className="vf-settings-container">
                {/* Profile & Business Hero */}
                <div className="vf-set-hero">
                  <div className="vf-set-hero-left">
                    <div className="vf-set-avatar">
                      {initials}
                    </div>
                    <div className="vf-set-hero-meta">
                      <div className="vf-set-hero-name">{workspace?.name || "Business Workspace"}</div>
                      <div className="vf-set-hero-owner">
                        <span>Owned by <b>{user?.fullName || "Account"}</b></span>
                        <span className="vf-set-dot">•</span>
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="vf-set-hero-actions">
                    <span className="vf-status-badge vf-status-paid">Active Workspace</span>
                  </div>
                </div>

                <div className="vf-set-layout">
                  {/* Left Column: Business Profile Form */}
                  <div className="vf-set-col-main">
                    {/* General Business Information Card */}
                    <div className="vf-card vf-set-card">
                      <div className="vf-set-card-header">
                        <div>
                          <h3 className="vf-set-card-title">Business Identity</h3>
                          <p className="vf-set-card-desc">Your public workspace and operating business name</p>
                        </div>
                      </div>

                      <div className="vf-set-card-body">
                        <form onSubmit={handleSaveWsName} className="vf-set-form">
                          <div className="vf-set-field">
                            <label className="vf-set-label" htmlFor="ws-name-input">
                              Business / Workspace Name
                            </label>
                            <div className="vf-set-input-group">
                              <input
                                id="ws-name-input"
                                type="text"
                                className="vf-set-input"
                                value={isEditingWsName ? newWsName : (workspace?.name || "")}
                                onFocus={() => {
                                  if (!isEditingWsName) {
                                    setNewWsName(workspace?.name || "");
                                    setIsEditingWsName(true);
                                  }
                                }}
                                onChange={(e) => {
                                  setIsEditingWsName(true);
                                  setNewWsName(e.target.value);
                                }}
                                placeholder="e.g. Victor Auto Clinic"
                                disabled={isUpdatingWsName}
                              />
                              {isEditingWsName ? (
                                <div className="vf-set-action-btns">
                                  <button
                                    type="submit"
                                    className="vf-btn vf-btn-sm"
                                    disabled={isUpdatingWsName || !newWsName.trim()}
                                  >
                                    {isUpdatingWsName ? "Saving…" : "Save Name"}
                                  </button>
                                  <button
                                    type="button"
                                    className="vf-btn g vf-btn-sm"
                                    onClick={handleCancelEditWsName}
                                    disabled={isUpdatingWsName}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="vf-btn g vf-btn-sm"
                                  onClick={handleStartEditWsName}
                                >
                                  Edit Name
                                </button>
                              )}
                            </div>
                            <span className="vf-set-hint">
                              This name appears on client documents, invoices, receipts, and navigation headers.
                            </span>
                          </div>

                          <div className="vf-set-field">
                            <label className="vf-set-label">System Workspace ID</label>
                            <div className="vf-set-id-box">
                              <code className="vf-set-code">{workspace?.id}</code>
                              <button
                                type="button"
                                className="vf-set-copy-btn"
                                onClick={() => {
                                  if (workspace?.id) {
                                    navigator.clipboard.writeText(workspace.id);
                                    showToast("Workspace ID copied to clipboard.");
                                  }
                                }}
                              >
                                Copy ID
                              </button>
                            </div>
                            <span className="vf-set-hint">Unique identifier used for API integrations and tenant isolation.</span>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Operational Modules Card */}
                    <div className="vf-card vf-set-card">
                      <div className="vf-set-card-header">
                        <div>
                          <h3 className="vf-set-card-title">Configured Modules ({modules.length})</h3>
                          <p className="vf-set-card-desc">Active dynamic tables provisioned for this workspace</p>
                        </div>
                      </div>
                      <div className="vf-set-card-body">
                        <div className="vf-set-mod-grid">
                          {modules.map((m) => {
                            const count =
                              overview?.moduleStats?.find((stat) => stat.moduleId === m.id)?.recordCount ?? 0;
                            return (
                              <div
                                key={m.id}
                                className="vf-set-mod-item"
                                onClick={() => {
                                  setActiveView(m.id);
                                  setRecordsPage(1);
                                  setSearchQuery("");
                                }}
                              >
                                <div className="vf-set-mod-info">
                                  <span className="vf-set-mod-name">{m.name}</span>
                                  <span className="vf-set-mod-count">{count} {count === 1 ? "record" : "records"}</span>
                                </div>
                                <span className="vf-set-mod-arrow">→</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Account & Security */}
                  <div className="vf-set-col-side">
                    {/* Account Info Box */}
                    <div className="vf-card vf-set-card">
                      <div className="vf-set-card-header">
                        <h3 className="vf-set-card-title">Account Owner</h3>
                      </div>
                      <div className="vf-set-card-body">
                        <div className="vf-set-owner-block">
                          <div className="vf-set-owner-av">{initials}</div>
                          <div>
                            <div className="vf-set-owner-name">{user?.fullName || "—"}</div>
                            <div className="vf-set-owner-email">{user?.email || "—"}</div>
                          </div>
                        </div>

                        <div className="vf-set-divider" />

                        <div className="vf-set-security-row">
                          <div className="vf-set-sec-label">Authentication</div>
                          <span className="vf-status-badge vf-status-paid">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Session / Danger Zone Box */}
                    <div className="vf-card vf-set-card vf-set-card-danger">
                      <div className="vf-set-card-header">
                        <h3 className="vf-set-card-title" style={{ color: "var(--vf-err)" }}>Session</h3>
                      </div>
                      <div className="vf-set-card-body">
                        <p style={{ margin: 0, fontSize: 13, color: "var(--vf-mut)", lineHeight: 1.5 }}>
                          Signing out will terminate your current session on this device.
                        </p>
                        <button
                          className="vf-btn d"
                          style={{ width: "100%", marginTop: 14 }}
                          onClick={handleLogout}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── DIALOGS ── */}

      {/* Add / Edit Record Modal */}
      {(dialog?.type === "add" || dialog?.type === "edit") && (
        <RecordFormModal
          key={`${dialog.moduleId}:${dialog.type === "edit" ? dialog.record.id : "new"}`}
          module={workspace?.modules?.find((module) => module.id === dialog.moduleId) || activeModule || null}
          isEdit={dialog.type === "edit"}
          existingRecord={dialog.type === "edit" ? dialog.record : null}
          relCache={relCache}
          resolveRecordLabel={resolveRecordLabel}
          dialogError={dialogError}
          isSubmitting={isDialogSubmitting}
          onSubmit={handleSaveRecord}
          onClose={() => setDialog(null)}
        />
      )}

      {/* View Record Modal */}
      {dialog?.type === "view" && (
        <div className="vf-modal-overlay" onClick={() => setDialog(null)}>
          <div className="vf-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h2>Record Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0" }}>
              <div style={{ fontSize: 12, color: "var(--vf-mut)" }}>
                ID: <span style={{ fontFamily: "monospace" }}>{dialog.record.id}</span>
              </div>
              {(activeModule?.fields || []).map((f) => {
                const val = dialog.record[f.name] ?? dialog.record.data?.[f.name];
                return (
                  <div key={f.name}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-mut)" }}>{f.label || f.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                      {f.typeLower === "relation"
                          ? resolveRecordLabel(f.targetModule || f.relatedEntityId || "", String(val))
                        : val !== null && val !== undefined
                          ? String(val)
                          : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="vf-ft">
              <button className="vf-btn" onClick={() => setDialog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation */}
      {dialog?.type === "delete" && (
        <div className="vf-modal-overlay" onClick={() => setDialog(null)}>
          <div className="vf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Record</h2>
            <p style={{ color: "var(--vf-mut)", fontSize: 14 }}>
              Are you sure you want to delete this record? This action will permanently remove it from the database.
            </p>
            {dialogError && <p className="vf-er">{dialogError}</p>}
            <div className="vf-ft">
              <button className="vf-btn g" onClick={() => setDialog(null)} disabled={isDialogSubmitting}>
                Cancel
              </button>
              <button className="vf-btn d" onClick={handleDeleteRecord} disabled={isDialogSubmitting}>
                {isDialogSubmitting ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FINANCIAL MODALS ── */}

      {financialModal?.type === "createInvoice" && (
        <CreateInvoiceModal
          workspaceId={workspaceId}
          capabilities={financialCapabilities}
          relCache={relCache}
          initialSourceModule={financialModal.sourceModule}
          initialSourceRecord={financialModal.sourceRecord || null}
          onSuccess={(inv: Invoice) => {
            setFinancialModal({ type: "viewInvoice", invoiceId: inv.id });
            showToast(`Invoice ${inv.invoiceNumber} created.`);
          }}
          onClose={() => setFinancialModal(null)}
        />
      )}

      {financialModal?.type === "viewInvoice" && (
        <InvoiceModal
          workspaceId={workspaceId}
          invoiceId={financialModal.invoiceId}
          onRecordPayment={(inv: Invoice) => setFinancialModal({ type: "recordPayment", invoice: inv })}
          onViewReceipt={(rec: Receipt) => setFinancialModal({ type: "viewReceipt", receipt: rec })}
          onClose={() => setFinancialModal(null)}
        />
      )}

      {financialModal?.type === "recordPayment" && (
        <RecordPaymentModal
          workspaceId={workspaceId}
          invoice={financialModal.invoice}
          onSuccess={(result: { payment: Payment; receipt: Receipt | null; invoice: Invoice }) => {
            if (result.receipt) {
              setFinancialModal({ type: "viewReceipt", receipt: result.receipt });
              showToast("Payment confirmed. Receipt issued.");
            } else {
              setFinancialModal(null);
              showToast("Payment recorded successfully.");
            }
          }}
          onClose={() => setFinancialModal(null)}
        />
      )}

      {financialModal?.type === "viewReceipt" && (
        <ReceiptModal
          workspaceId={workspaceId}
          receipt={financialModal.receipt}
          onClose={() => setFinancialModal(null)}
        />
      )}

      {/* Toast Notification */}
      {toastVisible && <div className="vf-toast">{toastMessage}</div>}
    </div>
  );
}

/* ── RECORD FORM MODAL (DYNAMIC FIELD RENDERING) ── */

function RecordFormModal({
  module,
  isEdit,
  existingRecord,
  relCache,
  resolveRecordLabel,
  dialogError,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  module: WorkspaceModuleMeta | null;
  isEdit: boolean;
  existingRecord: WorkspaceRecord | null;
  relCache: Record<string, WorkspaceRecord[]>;
  resolveRecordLabel: (target: string, id: string) => string;
  dialogError: string;
  isSubmitting: boolean;
  onSubmit: (data: Record<string, DynamicFieldValue>) => void;
  onClose: () => void;
}) {
  const fields = module?.fields || [];
  const [formValues, setFormValues] = useState<Record<string, DynamicFieldValue>>(() => {
    const initial: Record<string, DynamicFieldValue> = {};
    for (const field of fields) {
      const recordValue = existingRecord?.[field.name] ?? existingRecord?.data?.[field.name];
      initial[field.name] = isDynamicFieldValue(recordValue)
        ? recordValue
        : field.typeLower === "boolean" || field.type === "Boolean" ? false : "";
    }
    return initial;
  });
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate required fields
    for (const f of fields) {
      if (f.required) {
        const val = formValues[f.name];
        if (val === undefined || val === null || val === "") {
          setValidationError(`Field "${f.label || f.name}" is required.`);
          return;
        }
      }
    }

    onSubmit(formValues);
  };

  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div className="vf-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <h2>{isEdit ? "Edit" : "Create"} {module?.name ? module.name.replace(/s$/, "") : "Record"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "16px 0", maxHeight: "65vh", overflowY: "auto", paddingRight: 4 }}>
            {fields.map((f) => {
              const typeLower = (f.typeLower || f.type || "").toLowerCase();
              const val = formValues[f.name] ?? "";

              return (
                <label key={f.name} className="vf-fl">
                  <span>
                    {f.label || f.name}
                    {f.required ? " *" : ""}
                  </span>

                  {typeLower === "relation" ? (
                    <select
                      value={String(val)}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                    >
                      <option value="">Choose related record…</option>
                      {(relCache[f.targetModule || f.relatedEntityId || ""] || []).map((relRec) => (
                        <option key={relRec.id} value={relRec.id}>
                          {resolveRecordLabel(f.targetModule || f.relatedEntityId || "", relRec.id)}
                        </option>
                      ))}
                    </select>
                  ) : typeLower === "select" ? (
                    <select
                      value={String(val)}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                    >
                      <option value="">Select option…</option>
                      {(f.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : typeLower === "boolean" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.checked })}
                      />
                      <span style={{ fontSize: 13, color: "var(--vf-mut)" }}>Enabled</span>
                    </div>
                  ) : typeLower === "long_text" ? (
                    <textarea
                      rows={3}
                      value={String(val)}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                      placeholder={f.exampleValue || ""}
                    />
                  ) : typeLower === "currency" ? (
                    <div className="vf-pre">
                      <b>$</b>
                      <input
                        type="number"
                        step="0.01"
                        value={String(val)}
                        onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                        required={f.required}
                        placeholder={f.exampleValue || "0.00"}
                      />
                    </div>
                  ) : typeLower === "number" || typeLower === "decimal" ? (
                    <input
                      type="number"
                      step={typeLower === "decimal" ? "0.0001" : "any"}
                      value={String(val)}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                      placeholder={f.exampleValue || ""}
                    />
                  ) : typeLower === "date" ? (
                    <input
                      type="date"
                      value={val ? String(val).split("T")[0] : ""}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                    />
                  ) : typeLower === "datetime" ? (
                    <input
                      type="datetime-local"
                      value={val ? String(val).replace("Z", "") : ""}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                    />
                  ) : typeLower === "email" ? (
                    <input
                      type="email"
                      value={String(val)}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                      placeholder={f.exampleValue || "user@example.com"}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(val)}
                      onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                      required={f.required}
                      placeholder={f.exampleValue || ""}
                    />
                  )}
                </label>
              );
            })}
          </div>

          {(validationError || dialogError) && (
            <p className="vf-er">{validationError || dialogError}</p>
          )}

          <div className="vf-ft">
            <button type="button" className="vf-btn g" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="vf-btn" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── DASHBOARD SKELETON LOADER ── */
export function DashboardSkeleton() {
  return (
    <div className="vf-shell">
      {/* Mobile Header Skeleton */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#09122c] border-b border-slate-800 text-slate-100 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="vf-skel-dark" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <div className="vf-skel-dark" style={{ width: 120, height: 20, borderRadius: 4 }} />
        </div>
      </header>

      <div className="vf-app">
        {/* Sidebar Skeleton */}
        <aside className="vf-aside hidden lg:flex">
          <div className="vf-lg">
            <div className="vf-skel-dark" style={{ width: 140, height: 22, borderRadius: 4 }} />
          </div>

          <div className="vf-sl" style={{ opacity: 0.6 }}>MAIN</div>
          <div className="vf-skel-dark" style={{ height: 36, width: "100%", borderRadius: 8, marginBottom: 8 }} />

          <div className="vf-sl" style={{ opacity: 0.6 }}>MODULES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="vf-skel-dark" style={{ height: 34, width: "100%", borderRadius: 8 }} />
            <div className="vf-skel-dark" style={{ height: 34, width: "100%", borderRadius: 8 }} />
            <div className="vf-skel-dark" style={{ height: 34, width: "100%", borderRadius: 8 }} />
            <div className="vf-skel-dark" style={{ height: 34, width: "100%", borderRadius: 8 }} />
          </div>

          <div style={{ marginTop: "auto" }}>
            <div className="vf-sl" style={{ opacity: 0.6 }}>SYSTEM</div>
            <div className="vf-skel-dark" style={{ height: 34, width: "100%", borderRadius: 8 }} />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="vf-main">
          {/* Header (Hidden on Mobile) */}
          <header className="vf-top hidden lg:flex">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="vf-skel" style={{ height: 20, width: 220, borderRadius: 4 }} />
              <div className="vf-skel" style={{ height: 13, width: 300, borderRadius: 4 }} />
            </div>
            <div className="vf-skel" style={{ width: 36, height: 36, borderRadius: "50%" }} />
          </header>

          {/* Canvas */}
          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Metric Cards Skeleton */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="vf-card" style={{ padding: 20 }}>
                  <div className="vf-skel" style={{ height: 12, width: 100, borderRadius: 4 }} />
                  <div className="vf-skel" style={{ height: 36, width: 60, marginTop: 12, borderRadius: 6 }} />
                  <div className="vf-skel" style={{ height: 12, width: 140, marginTop: 10, borderRadius: 4 }} />
                </div>
              ))}
            </div>

            {/* Large Activity Card Skeleton */}
            <div className="vf-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="vf-skel" style={{ height: 18, width: 180, borderRadius: 4 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="vf-skel" style={{ height: 44, width: "100%", borderRadius: 8 }} />
                <div className="vf-skel" style={{ height: 44, width: "100%", borderRadius: 8 }} />
                <div className="vf-skel" style={{ height: 44, width: "100%", borderRadius: 8 }} />
                <div className="vf-skel" style={{ height: 44, width: "100%", borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
