"use client";

import React, { useState, useEffect } from "react";
import {
  Invoice,
  Receipt,
  fetchInvoice,
  downloadInvoicePdfBlob,
  updateInvoiceStatus,
} from "@/lib/api/financial";

interface InvoiceModalProps {
  workspaceId: string;
  invoiceId: string;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onStatusUpdated?: () => void;
}

export default function InvoiceModal({
  workspaceId,
  invoiceId,
  onClose,
  onRecordPayment,
  onViewReceipt,
  onStatusUpdated,
}: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadInvoice = async () => {
      try {
        const loadedInvoice = await fetchInvoice(workspaceId, invoiceId);
        if (!cancelled) setInvoice(loadedInvoice);
      } catch (error) {
        if (!cancelled) setError(error instanceof Error ? error.message : "Failed to load invoice details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadInvoice();
    return () => { cancelled = true; };
  }, [workspaceId, invoiceId]);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      const blob = await downloadInvoicePdfBlob(workspaceId, invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to download invoice PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelInvoice = async () => {
    if (!invoice || !confirm("Are you sure you want to cancel this invoice? This will be recorded in the audit trail.")) return;
    setCancelling(true);
    try {
      await updateInvoiceStatus(workspaceId, invoice.id, "Cancelled", "Cancelled by workspace administrator");
      const refreshedInvoice = await fetchInvoice(workspaceId, invoice.id);
      setInvoice(refreshedInvoice);
      if (onStatusUpdated) onStatusUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Cannot cancel invoice.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="vf-modal-overlay">
        <div className="vf-dialog" style={{ padding: 48, textAlign: "center" }}>
          Loading invoice details…
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="vf-modal-overlay">
        <div className="vf-dialog" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ color: "var(--vf-err)", fontWeight: 700, marginBottom: 8 }}>Error</div>
          <p>{error || "Invoice not found."}</p>
          <button className="vf-btn g" onClick={onClose} style={{ marginTop: 16 }}>Close</button>
        </div>
      </div>
    );
  }

  const balance = Number(invoice.balanceDue) || 0;
  const isPaid = invoice.status === "Paid" || balance <= 0;

  return (
    <div className="vf-modal-overlay">
      <div
        className="vf-dialog vf-print-container"
        style={{ maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls - Hidden when printed */}
        <div className="vf-dialog-header vf-no-print">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Download PDF */}
            <button
              className="vf-btn g"
              style={{ padding: "6px 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {downloading ? "Preparing…" : "Download PDF"}
            </button>

            {/* Print */}
            <button
              className="vf-btn g"
              style={{ padding: "6px 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={handlePrint}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>

            {/* Record Payment */}
            {!isPaid && invoice.status !== "Cancelled" && (
              <button
                className="vf-btn"
                style={{ padding: "6px 14px", fontSize: 13, background: "#16a34a", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => onRecordPayment(invoice)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Record Payment
              </button>
            )}

            {/* Cancel Invoice */}
            {invoice.status !== "Cancelled" && (!invoice.payments || invoice.payments.length === 0) && (
              <button
                className="vf-btn g"
                style={{ padding: "6px 14px", fontSize: 13, color: "#dc2626", borderColor: "#fca5a5", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={handleCancelInvoice}
                disabled={cancelling}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {cancelling ? "Cancelling…" : "Cancel Invoice"}
              </button>
            )}
          </div>

          <button
            className="vf-btn g"
            style={{ padding: "5px 11px", fontSize: 15, lineHeight: 1, flexShrink: 0 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Printable Invoice Paper Sheet */}
        <div
          style={{
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid var(--vf-bd)",
            borderRadius: 8,
            padding: 32,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e3a8a", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                INVOICE
              </h1>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                {invoice.invoiceNumber}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                className={`vf-status-badge vf-status-${invoice.status.toLowerCase().replace(/\s+/g, "-")}`}
                style={{ fontSize: 12, padding: "4px 12px" }}
              >
                {invoice.status}
              </span>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}
              </div>
              {invoice.dueDate && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Bill To & Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Bill To:</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{invoice.payerName || "Direct Customer"}</div>
              {invoice.payerEmail && <div style={{ color: "#64748b" }}>{invoice.payerEmail}</div>}
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Details</div>
              <div><b>Currency:</b> {invoice.currency}</div>
              {invoice.sourceRecordId && (
                <div style={{ fontSize: 12, color: "#64748b" }}>Ref Record: {invoice.sourceRecordId}</div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px" }}>Description</th>
                  <th style={{ textAlign: "center", padding: "10px 10px", width: 70 }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", width: 120 }}>Unit Price</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", width: 120 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.lineItems || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "10px 14px" }}>{item.description}</td>
                    <td style={{ padding: "10px 10px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      {invoice.currency} {Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600 }}>
                      {invoice.currency} {Number(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div style={{ maxWidth: 300, fontSize: 12.5, color: "#64748b" }}>
              {invoice.notes && (
                <div>
                  <b style={{ color: "#0f172a" }}>Notes &amp; Instructions:</b>
                  <p style={{ margin: "4px 0 0" }}>{invoice.notes}</p>
                </div>
              )}
            </div>

            <div style={{ width: 260, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>{invoice.currency} {Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                  <span>Discount:</span>
                  <span>-{invoice.currency} {Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.tax) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Tax:</span>
                  <span>{invoice.currency} {Number(invoice.tax).toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
                <span>Total Amount:</span>
                <span style={{ color: "#1e3a8a" }}>{invoice.currency} {Number(invoice.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                <span>Amount Paid:</span>
                <span style={{ fontWeight: 600 }}>{invoice.currency} {Number(invoice.amountPaid).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: balance > 0 ? "#dc2626" : "#16a34a" }}>
                <span>Balance Due:</span>
                <span>{invoice.currency} {balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Receipt History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Payment History</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {invoice.payments.map((p) => {
                  const matchingReceipt = invoice.receipts?.find((r) => r.paymentId === p.id);
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "#f8fafc",
                        borderRadius: 6,
                        fontSize: 12.5,
                      }}
                    >
                      <div>
                        <b>{invoice.currency} {Number(p.amount).toFixed(2)}</b> via {p.paymentMethod} •{" "}
                        <span style={{ color: "#64748b" }}>{new Date(p.paymentDate).toLocaleDateString()}</span>
                        {p.transactionRef && <span style={{ color: "#64748b" }}> (Ref: {p.transactionRef})</span>}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: p.status === "CONFIRMED" ? "#dcfce7" : "#fef9c3",
                            color: p.status === "CONFIRMED" ? "#15803d" : "#a16207",
                          }}
                        >
                          {p.status}
                        </span>

                        {matchingReceipt && (
                          <button
                            type="button"
                            className="vf-btn g"
                            style={{ padding: "3px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 5 }}
                            onClick={() => onViewReceipt(matchingReceipt as Receipt)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                            </svg>
                            View Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
