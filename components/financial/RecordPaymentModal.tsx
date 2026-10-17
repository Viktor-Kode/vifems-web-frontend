"use client";

import React, { useState } from "react";
import { recordPayment, Invoice, Payment, Receipt } from "@/lib/api/financial";

interface RecordPaymentModalProps {
  workspaceId: string;
  invoice: Invoice;
  onClose: () => void;
  onSuccess: (result: { payment: Payment; receipt: Receipt | null; invoice: Invoice }) => void;
}

export default function RecordPaymentModal({
  workspaceId,
  invoice,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const currentBalance = Number(invoice.balanceDue) || 0;
  const [amount, setAmount] = useState<number>(currentBalance);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [status, setStatus] = useState<"CONFIRMED" | "PENDING">("CONFIRMED");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (amount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }
    if (amount > currentBalance) {
      setError(`Amount cannot exceed the outstanding balance of ${invoice.currency} ${currentBalance.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = `pay_${invoice.id}_${Date.now()}`;
      const res = await recordPayment(workspaceId, invoice.id, {
        amount,
        currency: invoice.currency,
        paymentMethod,
        status,
        transactionRef: transactionRef.trim() || undefined,
        paymentDate,
        notes: notes.trim() || undefined,
        idempotencyKey,
      });

      onSuccess(res);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div
        className="vf-dialog"
        style={{ maxWidth: 500, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Record Payment</h2>
            <p style={{ fontSize: 13, color: "var(--vf-mut)", margin: "4px 0 0" }}>
              Invoice {invoice.invoiceNumber} • {invoice.payerName}
            </p>
          </div>
          <button className="vf-btn g" style={{ padding: "4px 10px" }} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Invoice Balance Summary Box */}
        <div
          style={{
            background: "var(--vf-bg)",
            border: "1px solid var(--vf-bd)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            textAlign: "center",
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--vf-mut)", textTransform: "uppercase" }}>Total</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{invoice.currency} {Number(invoice.totalAmount).toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--vf-mut)", textTransform: "uppercase" }}>Paid</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
              {invoice.currency} {Number(invoice.amountPaid).toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--vf-mut)", textTransform: "uppercase" }}>Balance Due</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: currentBalance > 0 ? "#dc2626" : "#16a34a" }}>
              {invoice.currency} {currentBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {error && (
          <div className="vf-er" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div className="vf-fl">
              <label>Amount Received ({invoice.currency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={currentBalance}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="vf-fl">
              <label>Payment Method *</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="POS / Card">POS / Card</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Cheque">Cheque</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div className="vf-fl">
              <label>Transaction Reference / Slip #</label>
              <input
                type="text"
                placeholder="e.g. TX-984210"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>
            <div className="vf-fl">
              <label>Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          <div className="vf-fl" style={{ marginBottom: 16 }}>
            <label>Confirmation Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "CONFIRMED" | "PENDING")}
            >
              <option value="CONFIRMED">Confirmed Received (issues official receipt)</option>
              <option value="PENDING">Pending Verification (funds not yet cleared)</option>
            </select>
            <p style={{ fontSize: 11.5, color: "var(--vf-mut)", margin: "4px 0 0" }}>
              {status === "CONFIRMED"
                ? "An official tamper-evident receipt will be immediately generated and invoice balance will be updated."
                : "Pending payments do not deduct from outstanding balance or produce a receipt until confirmed."}
            </p>
          </div>

          <div className="vf-fl" style={{ marginBottom: 20 }}>
            <label>Internal Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Direct wire transfer into main operational account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="vf-btn g" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="vf-btn" disabled={submitting}>
              {submitting ? "Recording…" : status === "CONFIRMED" ? "Confirm & Issue Receipt" : "Record Pending Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
