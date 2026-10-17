"use client";

import React, { useState } from "react";
import {
  createInvoice,
  FinancialCapabilities,
  Invoice,
  LineItem,
} from "@/lib/api/financial";
import { WorkspaceModuleMeta, WorkspaceRecord } from "@/lib/api/workspace";

interface CreateInvoiceModalProps {
  workspaceId: string;
  capabilities: FinancialCapabilities | null;
  relCache: Record<string, WorkspaceRecord[]>;
  initialSourceModule?: WorkspaceModuleMeta;
  initialSourceRecord?: WorkspaceRecord | null;
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
}

function readFieldValue(record: WorkspaceRecord, fieldName: string): string | number | boolean | null {
  const value = record[fieldName] ?? record.data[fieldName];
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : null;
}

function initialInvoiceDetails(
  sourceModule: WorkspaceModuleMeta | undefined,
  sourceRecord: WorkspaceRecord | null | undefined,
  capabilities: FinancialCapabilities | null,
  relatedRecords: Record<string, WorkspaceRecord[]>
) {
  const defaults = {
    lineItems: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    payerName: "",
    payerEmail: "",
    payerModuleSlug: "",
    payerRecordId: "",
  };
  if (!sourceModule || !sourceRecord) return defaults;

  const chargeable = capabilities?.chargeableModules.find(
    (module) => module.slug === sourceModule.slug || module.id === sourceModule.id
  );
  const amountValue = chargeable?.amountField ? readFieldValue(sourceRecord, chargeable.amountField) : null;
  const amount = Number(amountValue) || 0;
  if (chargeable?.amountField && amount > 0) {
    const labelField = chargeable.labelField || "name";
    const label = readFieldValue(sourceRecord, labelField);
    defaults.lineItems = [{
      description: String(label || `${sourceModule.name} Charge`),
      quantity: 1,
      unitPrice: amount,
      amount,
    }];
  }

  const relationField = sourceModule.fields.find((field) =>
    (field.typeLower || field.type).toLowerCase() === "relation"
  );
  if (relationField) {
    const relatedId = readFieldValue(sourceRecord, relationField.name);
    const targetSlug = relationField.targetModule || relationField.relatedEntityId || "";
    if (relatedId !== null && targetSlug) {
      defaults.payerModuleSlug = targetSlug;
      defaults.payerRecordId = String(relatedId);
      const matched = (relatedRecords[targetSlug] || []).find((record) => record.id === String(relatedId));
      if (matched) {
        const payerName = ["full_name", "name", "company_name"]
          .map((fieldName) => readFieldValue(matched, fieldName))
          .find((value) => typeof value === "string" && value.length > 0);
        const payerEmail = readFieldValue(matched, "email");
        defaults.payerName = typeof payerName === "string" ? payerName : matched.id;
        defaults.payerEmail = typeof payerEmail === "string" ? payerEmail : "";
      }
    }
  }

  return defaults;
}

export default function CreateInvoiceModal({
  workspaceId,
  capabilities,
  relCache,
  initialSourceModule,
  initialSourceRecord,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const initialDetails = initialInvoiceDetails(initialSourceModule, initialSourceRecord, capabilities, relCache);
  const [payerName, setPayerName] = useState(initialDetails.payerName);
  const [payerEmail, setPayerEmail] = useState(initialDetails.payerEmail);
  const [selectedPayerRecordId] = useState(initialDetails.payerRecordId);
  const [selectedPayerModuleSlug] = useState(initialDetails.payerModuleSlug);
  const [currency, setCurrency] = useState(capabilities?.defaultCurrency || "USD");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  const [lineItems, setLineItems] = useState<LineItem[]>(initialDetails.lineItems);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  // Line item handlers
  const handleItemChange = (idx: number, field: keyof LineItem, rawValue: string) => {
    setLineItems((prev) => {
      const next = [...prev];
      const value: string | number = field === "description" ? rawValue : Number(rawValue) || 0;
      const item = { ...next[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const q = Math.max(1, Number(item.quantity) || 1);
        const p = Number(item.unitPrice) || 0;
        item.amount = Math.round(q * p * 100) / 100;
      }
      next[idx] = item;
      return next;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (idx: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const calculatedSubtotal = lineItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal - Number(discount || 0) + Number(tax || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!payerName.trim()) {
        throw new Error("Payer name is required.");
      }
      if (calculatedSubtotal <= 0) {
        throw new Error("Invoice total must be greater than zero.");
      }

      const invoice = await createInvoice(workspaceId, {
        sourceModuleSlug: initialSourceModule?.slug || null,
        sourceRecordId: initialSourceRecord?.id || null,
        payerModuleSlug: selectedPayerModuleSlug || null,
        payerRecordId: selectedPayerRecordId || null,
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim() || null,
        currency,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
        subtotal: calculatedSubtotal,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        lineItems,
      });

      onSuccess(invoice);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vf-modal-overlay" onClick={onClose}>
      <div
        className="vf-dialog"
        style={{ maxWidth: 660, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vf-dialog-header">
          <div>
            <h3 style={{ margin: 0 }}>Issue New Invoice</h3>
            <p style={{ fontSize: 12.5, color: "var(--vf-mut)", margin: "3px 0 0" }}>
              {initialSourceRecord
                ? `Linked to ${initialSourceModule?.name || "Record"} · ${initialSourceRecord.id.slice(0, 10)}…`
                : "Create a schema-connected invoice for your business"}
            </p>
          </div>
          <button
            className="vf-btn g"
            style={{ padding: "4px 10px", fontSize: 16, lineHeight: 1 }}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="vf-dialog-body">
          {error && (
            <div className="vf-er" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form id="create-invoice-form" onSubmit={handleSubmit}>
            {/* Payer & Currency Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div className="vf-fl">
                <label>Bill To (Client / Customer Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp / Jane Doe"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                />
              </div>
              <div className="vf-fl">
                <label>Billing Email</label>
                <input
                  type="email"
                  placeholder="billing@example.com"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div className="vf-fl">
                <label>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="vf-fl">
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--vf-fg)" }}>Line Items</label>
                <button
                  type="button"
                  className="vf-btn g"
                  style={{ padding: "3px 10px", fontSize: 12 }}
                  onClick={addLineItem}
                >
                  + Add Item
                </button>
              </div>

              <div style={{ border: "1px solid var(--vf-bd)", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--vf-bg)", borderBottom: "1px solid var(--vf-bd)" }}>
                      <th style={{ textAlign: "left", padding: "8px 12px" }}>Description</th>
                      <th style={{ textAlign: "center", padding: "8px 10px", width: 70 }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", width: 110 }}>Unit Price</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", width: 110 }}>Total</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--vf-bd)" }}>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            required
                            placeholder="Item or service description"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", fontSize: 12.5 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            style={{ width: "100%", textAlign: "center", padding: "6px 4px", fontSize: 12.5 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                            style={{ width: "100%", textAlign: "right", padding: "6px 8px", fontSize: 12.5 }}
                          />
                        </td>
                        <td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600 }}>
                          {currency} {Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes + Totals */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
              <div className="vf-fl">
                <label>Notes &amp; Payment Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Bank details, terms, milestone notes…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--vf-mut)" }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>{currency} {calculatedSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--vf-mut)" }}>Discount:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    style={{ width: 100, textAlign: "right", padding: "4px 8px", fontSize: 12.5 }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--vf-mut)" }}>Tax:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    style={{ width: 100, textAlign: "right", padding: "4px 8px", fontSize: 12.5 }}
                  />
                </div>
                <div style={{ borderTop: "1px solid var(--vf-bd)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
                  <span>Total:</span>
                  <span style={{ color: "var(--vf-pri)" }}>{currency} {calculatedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="vf-dialog-footer">
          <button type="button" className="vf-btn g" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="create-invoice-form" className="vf-btn" disabled={submitting}>
            {submitting ? "Creating Invoice…" : "Issue Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
