"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  fetchReceipts,
  downloadReceiptPdfBlob,
} from "@/lib/api/financial";

interface PaymentsReceiptsViewProps {
  workspaceId: string;
  currency: string;
  onOpenReceipt: (receipt: Receipt) => void;
}

export default function PaymentsReceiptsView({
  workspaceId,
  onOpenReceipt,
}: PaymentsReceiptsViewProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await fetchReceipts(workspaceId, 1, 50);
        if (!cancelled) setReceipts(result.receipts);
      } catch (error) {
        if (!cancelled) console.error("Failed to load receipts:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [workspaceId]);

  const handleDownloadPdf = async (e: React.MouseEvent, rec: Receipt) => {
    e.stopPropagation();
    setDownloadingId(rec.id);
    try {
      const blob = await downloadReceiptPdfBlob(workspaceId, rec.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${rec.receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to download receipt PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Payments &amp; Receipts Ledger</h2>
          <p style={{ fontSize: 13, color: "var(--vf-mut)", margin: "2px 0 0" }}>
            Receipts issued for payments a workspace user records as confirmed
          </p>
        </div>
      </div>

      <div className="vf-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--vf-mut)" }}>
            Loading receipts…
          </div>
        ) : receipts.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--vf-mut)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No receipts issued yet.</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>
              Receipts are automatically generated when payments against invoices are confirmed.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="vf-tb">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Payment Date</th>
                  <th>Received From</th>
                  <th>Invoice Ref</th>
                  <th>Amount Received</th>
                  <th>Method</th>
                  <th>Ref #</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => {
                  const snap = rec.snapshot || {};
                  return (
                    <tr
                      key={rec.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => onOpenReceipt(rec)}
                    >
                      <td style={{ fontWeight: 700, color: "#0f766e" }}>
                        {rec.receiptNumber}
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--vf-mut)" }}>
                        {new Date(rec.paymentDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {typeof snap.payerName === "string" ? snap.payerName : rec.invoice?.payerName || "Customer"}
                      </td>
                      <td style={{ fontSize: 12.5, fontWeight: 600, color: "var(--vf-pri)" }}>
                        {typeof snap.invoiceNumber === "string" ? snap.invoiceNumber : rec.invoice?.invoiceNumber || "—"}
                      </td>
                      <td style={{ fontWeight: 700, color: "#15803d" }}>
                        {rec.currency} {Number(rec.amountReceived).toFixed(2)}
                      </td>
                      <td style={{ fontSize: 12.5 }}>
                        {rec.paymentMethod}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--vf-mut)" }}>
                        {rec.transactionRef || "—"}
                      </td>
                      <td>
                        <span className="vf-status-badge vf-status-paid" style={{ fontSize: 11 }}>
                          CONFIRMED
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="vf-btn g"
                            style={{ padding: "4px 8px", fontSize: 11.5 }}
                            onClick={() => onOpenReceipt(rec)}
                          >
                            Receipt
                          </button>
                          <button
                            className="vf-btn g"
                            style={{ padding: "4px 8px", fontSize: 11.5 }}
                            onClick={(e) => handleDownloadPdf(e, rec)}
                            disabled={downloadingId === rec.id}
                          >
                            {downloadingId === rec.id ? "…" : "PDF"}
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
