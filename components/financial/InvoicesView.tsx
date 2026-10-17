"use client";

import React, { useState, useEffect } from "react";
import {
  Invoice,
  Receipt,
  fetchInvoices,
  downloadInvoicePdfBlob,
} from "@/lib/api/financial";

interface InvoicesViewProps {
  workspaceId: string;
  currency: string;
  onOpenCreate: () => void;
  onOpenDetails: (invoiceId: string) => void;
  onOpenPay: (invoice: Invoice) => void;
  onOpenReceipt: (receipt: Receipt) => void;
}

export default function InvoicesView({
  workspaceId,
  currency,
  onOpenCreate,
  onOpenDetails,
  onOpenPay,
}: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState({
    totalInvoices: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadInvoices = async () => {
      try {
        const result = await fetchInvoices(workspaceId, page, 50, statusFilter, search);
        if (cancelled) return;
        setInvoices(result.invoices);
        setMetrics(result.metrics);
      } catch (error) {
        if (!cancelled) console.error("Failed to load invoices:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadInvoices();
    return () => { cancelled = true; };
  }, [workspaceId, page, statusFilter, search]);

  const handleDownloadPdf = async (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    setDownloadingId(inv.id);
    try {
      const blob = await downloadInvoicePdfBlob(workspaceId, inv.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${inv.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const statusOptions = [
    { label: "All Invoices", value: "" },
    { label: "Issued", value: "Issued" },
    { label: "Partially Paid", value: "Partially Paid" },
    { label: "Paid", value: "Paid" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Financial Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div className="vf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: "var(--vf-mut)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Invoiced
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: "var(--vf-fg)" }}>
            {currency} {Number(metrics.totalInvoiced).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: "var(--vf-mut)", marginTop: 2 }}>
            {metrics.totalInvoices} {metrics.totalInvoices === 1 ? "invoice" : "invoices"} issued
          </div>
        </div>

        <div className="vf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: "var(--vf-mut)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Collected
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: "#16a34a" }}>
            {currency} {Number(metrics.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>
            Confirmed received funds
          </div>
        </div>

        <div className="vf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: "var(--vf-mut)", fontWeight: 600, textTransform: "uppercase" }}>
            Outstanding Balance
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: metrics.totalOutstanding > 0 ? "#dc2626" : "#16a34a" }}>
            {currency} {Number(metrics.totalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: "var(--vf-mut)", marginTop: 2 }}>
            Uncollected balance due
          </div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
          <input
            type="text"
            className="vf-srch"
            placeholder="Search invoice # or client name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 280 }}
          />

          <div style={{ display: "flex", gap: 4 }}>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`vf-btn g ${statusFilter === opt.value ? "on" : ""}`}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  background: statusFilter === opt.value ? "var(--vf-pri)" : undefined,
                  color: statusFilter === opt.value ? "#ffffff" : undefined,
                }}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(1);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button className="vf-btn" onClick={onOpenCreate}>
          + Issue Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="vf-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--vf-mut)" }}>
            Loading invoices…
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--vf-mut)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No invoices found.</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>
              {search || statusFilter
                ? "Try clearing your filters or search query."
                : 'Click "+ Issue Invoice" or create an invoice from an order/chargeable record.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="vf-tb">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Issue Date</th>
                  <th>Bill To</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const bal = Number(inv.balanceDue) || 0;
                  const isPaid = inv.status === "Paid" || bal <= 0;

                  return (
                    <tr
                      key={inv.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => onOpenDetails(inv.id)}
                    >
                      <td style={{ fontWeight: 700, color: "var(--vf-pri)" }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--vf-mut)" }}>
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.payerName || "Direct Customer"}</div>
                        {inv.payerEmail && (
                          <div style={{ fontSize: 11.5, color: "var(--vf-mut)" }}>{inv.payerEmail}</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {inv.currency} {Number(inv.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ color: "#16a34a", fontWeight: 600 }}>
                        {inv.currency} {Number(inv.amountPaid).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 700, color: bal > 0 ? "#dc2626" : "#16a34a" }}>
                        {inv.currency} {bal.toFixed(2)}
                      </td>
                      <td>
                        <span className={`vf-status-badge vf-status-${inv.status.toLowerCase().replace(/\s+/g, "-")}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="vf-btn g"
                            style={{ padding: "4px 8px", fontSize: 11.5 }}
                            onClick={() => onOpenDetails(inv.id)}
                          >
                            Details
                          </button>
                          {!isPaid && inv.status !== "Cancelled" && (
                            <button
                              className="vf-btn"
                              style={{ padding: "4px 8px", fontSize: 11.5, background: "#16a34a" }}
                              onClick={() => onOpenPay(inv)}
                            >
                              Pay
                            </button>
                          )}
                          <button
                            className="vf-btn g"
                            style={{ padding: "4px 8px", fontSize: 11.5 }}
                            onClick={(e) => handleDownloadPdf(e, inv)}
                            disabled={downloadingId === inv.id}
                          >
                            {downloadingId === inv.id ? "…" : "PDF"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
