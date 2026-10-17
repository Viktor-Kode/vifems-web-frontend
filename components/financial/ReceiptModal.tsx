"use client";

import React, { useState } from "react";
import { Receipt, downloadReceiptPdfBlob } from "@/lib/api/financial";

interface ReceiptModalProps {
  workspaceId: string;
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptModal({
  workspaceId,
  receipt,
  onClose,
}: ReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);
  const snapshot = receipt.snapshot || {};
  const snapshotText = (key: string): string => {
    const value = snapshot[key];
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  };
  const snapshotAmount = Number(snapshot.totalAmount);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await downloadReceiptPdfBlob(workspaceId, receipt.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${receipt.receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to download receipt PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div
        className="vf-dialog vf-print-container"
        style={{ maxWidth: 580, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar - Hidden during print */}
        <div
          className="vf-no-print"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button className="vf-btn" style={{ padding: "5px 12px", fontSize: 12 }} onClick={handleDownloadPdf} disabled={downloading}>
              {downloading ? "Preparing PDF…" : "📥 Download PDF"}
            </button>
            <button className="vf-btn g" style={{ padding: "5px 12px", fontSize: 12 }} onClick={handlePrint}>
              🖨️ Print Receipt
            </button>
          </div>
          <button className="vf-btn g" style={{ padding: "4px 10px" }} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Printable Receipt Paper Sheet */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f766e", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f766e", margin: 0 }}>
                {snapshotText("workspaceName") || "VifeMS Business"}
              </h1>
              <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                Official Payment Receipt
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>RECEIPT</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f766e" }}>{receipt.receiptNumber}</div>
              <div style={{ display: "inline-block", background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                PAYMENT CONFIRMED
              </div>
            </div>
          </div>

          {/* Amount Received Box */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Amount Received</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#15803d", marginTop: 2 }}>
                {receipt.currency} {Number(receipt.amountReceived).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: 12, color: "#166534" }}>
              <div><b>Date:</b> {new Date(receipt.paymentDate).toLocaleDateString()}</div>
              <div style={{ marginTop: 2 }}><b>Method:</b> {receipt.paymentMethod}</div>
              {receipt.transactionRef && (
                <div style={{ marginTop: 2 }}><b>Ref:</b> {receipt.transactionRef}</div>
              )}
            </div>
          </div>

          {/* Payer and Invoice Context */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, fontSize: 12.5 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Received From</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{snapshotText("payerName") || "Customer"}</div>
              {snapshotText("payerEmail") && <div style={{ color: "#64748b" }}>{snapshotText("payerEmail")}</div>}
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Invoice Reference</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{snapshotText("invoiceNumber") || "—"}</div>
              {snapshotText("sourceRecordId") && (
                <div style={{ fontSize: 11, color: "#64748b" }}>Source Record: {snapshotText("sourceRecordId")}</div>
              )}
            </div>
          </div>

          {/* Balance Breakdown Table */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Financial Stage</th>
                  <th style={{ textAlign: "right", padding: "8px 12px" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "8px 12px" }}>Total Invoice Amount</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    {receipt.currency} {(Number.isFinite(snapshotAmount) ? snapshotAmount : 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "8px 12px" }}>Paid Prior to This Transaction</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    {receipt.currency} {Number(receipt.previousPaidAmount || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f0fdf4" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: "#15803d" }}>
                    + Payment Applied (This Receipt)
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#15803d" }}>
                    {receipt.currency} {Number(receipt.amountReceived).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ fontWeight: 700 }}>
                  <td style={{ padding: "8px 12px" }}>Remaining Outstanding Balance</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: Number(receipt.remainingBalance) <= 0 ? "#15803d" : "#dc2626" }}>
                    {receipt.currency} {Number(receipt.remainingBalance).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Stamp Footer */}
          <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
            <p style={{ margin: 0 }}>
              Immutable System Snapshot • Issued At: {new Date(receipt.issuedAt).toUTCString()}
            </p>
            <p style={{ margin: "4px 0 0" }}>
              Document ID: {receipt.id} • VifeMS Secure Financial Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
