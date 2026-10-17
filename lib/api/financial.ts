// ============================================================
// VifeMS — Financial Engine Frontend API Client
// lib/api/financial.ts
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface FinancialCapabilities {
  enabled: boolean;
  reason: string;
  chargeableModules: Array<{
    id: string;
    slug: string;
    name: string;
    amountField?: string;
    labelField?: string;
    payerRelation?: {
      fieldName: string;
      targetModule: string;
    };
  }>;
  payerModules: Array<{
    id: string;
    slug: string;
    name: string;
    nameField: string;
    emailField: string | null;
    phoneField: string | null;
  }>;
  existingInvoiceModule: { id: string; slug: string; name: string } | null;
  existingPaymentModule: { id: string; slug: string; name: string } | null;
  defaultCurrency: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  sourceModuleSlug: string | null;
  sourceRecordId: string | null;
  payerModuleSlug: string | null;
  payerRecordId: string | null;
  payerName: string | null;
  payerEmail: string | null;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  totalAmount: number | string;
  amountPaid: number | string;
  balanceDue: number | string;
  status: "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
  notes: string | null;
  lineItems: LineItem[];
  payments?: Payment[];
  receipts?: Receipt[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  workspaceId: string;
  invoiceId: string;
  amount: number | string;
  currency: string;
  paymentMethod: string;
  status: "CONFIRMED" | "PENDING" | "FAILED" | "CANCELLED";
  transactionRef: string | null;
  idempotencyKey?: string | null;
  paymentDate: string;
  notes: string | null;
  invoice?: Partial<Invoice>;
  receipt?: Partial<Receipt>;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  workspaceId: string;
  receiptNumber: string;
  invoiceId: string;
  paymentId: string;
  amountReceived: number | string;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  transactionRef: string | null;
  previousPaidAmount: number | string;
  remainingBalance: number | string;
  snapshot: Record<string, unknown>;
  issuedAt: string;
  invoice?: Partial<Invoice>;
  payment?: Partial<Payment>;
  createdAt: string;
}

export class FinancialApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(message);
    this.name = "FinancialApiError";
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Helper to execute authenticated requests with cookies.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/pdf")) {
    if (!res.ok) {
      throw new Error(`PDF download failed (${res.status})`);
    }
    return res.blob();
  }

  const data = asObject(await res.json().catch(() => ({})));
  if (!res.ok) {
    const message = typeof data.message === "string"
      ? data.message
      : `Request failed with status ${res.status}`;
    throw new FinancialApiError(message, res.status, data);
  }
  return data;
}

function asJsonObject(response: Record<string, unknown> | Blob): Record<string, unknown> {
  if (response instanceof Blob) {
    throw new Error("Expected a JSON response from the financial API.");
  }
  return response;
}

/**
 * Fetches workspace financial capabilities.
 */
export async function getFinancialCapabilities(workspaceId: string): Promise<FinancialCapabilities> {
  const data = asJsonObject(await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/capabilities`));
  return data.capabilities as FinancialCapabilities;
}

/**
 * Lists invoices for a workspace.
 */
export async function fetchInvoices(
  workspaceId: string,
  page = 1,
  limit = 50,
  status = "",
  search = ""
): Promise<{
  invoices: Invoice[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  metrics: { totalInvoices: number; totalInvoiced: number; totalPaid: number; totalOutstanding: number };
}> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const data = asJsonObject(await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/invoices?${params.toString()}`));
  return {
    invoices: data.invoices as Invoice[],
    pagination: data.pagination as { page: number; limit: number; total: number; totalPages: number },
    metrics: data.metrics as { totalInvoices: number; totalInvoiced: number; totalPaid: number; totalOutstanding: number },
  };
}

/**
 * Fetches single invoice details.
 */
export async function fetchInvoice(workspaceId: string, invoiceId: string): Promise<Invoice> {
  const data = asJsonObject(await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/invoices/${invoiceId}`));
  return data.invoice as Invoice;
}

/**
 * Creates an invoice.
 */
export async function createInvoice(workspaceId: string, payload: Partial<Invoice>): Promise<Invoice> {
  const data = asJsonObject(await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/invoices`, {
    method: "POST",
    body: JSON.stringify(payload),
  }));
  return data.invoice as Invoice;
}

/**
 * Updates an invoice status.
 */
export async function updateInvoiceStatus(
  workspaceId: string,
  invoiceId: string,
  status: string,
  notes?: string
): Promise<Invoice> {
  const data = asJsonObject(await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/invoices/${invoiceId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  }));
  return data.invoice as Invoice;
}

/**
 * Records a payment against an invoice.
 */
export async function recordPayment(
  workspaceId: string,
  invoiceId: string,
  payload: {
    amount: number;
    currency?: string;
    paymentMethod: string;
    status?: "CONFIRMED" | "PENDING" | "FAILED" | "CANCELLED";
    transactionRef?: string;
    idempotencyKey?: string;
    paymentDate?: string;
    notes?: string;
  }
): Promise<{ payment: Payment; receipt: Receipt | null; invoice: Invoice }> {
  const data = asJsonObject(await fetchWithAuth(
    `${API_URL}/api/workspaces/${workspaceId}/financial/invoices/${invoiceId}/payments`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  ));
  return {
    payment: data.payment as Payment,
    receipt: data.receipt as Receipt | null,
    invoice: data.invoice as Invoice,
  };
}

/**
 * Lists payments for a workspace.
 */
export async function fetchPayments(
  workspaceId: string,
  page = 1,
  limit = 50
): Promise<{
  payments: Payment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const data = asJsonObject(await fetchWithAuth(
    `${API_URL}/api/workspaces/${workspaceId}/financial/payments?page=${page}&limit=${limit}`
  ));
  return {
    payments: data.payments as Payment[],
    pagination: data.pagination as { page: number; limit: number; total: number; totalPages: number },
  };
}

/**
 * Lists receipts for a workspace.
 */
export async function fetchReceipts(
  workspaceId: string,
  page = 1,
  limit = 50
): Promise<{
  receipts: Receipt[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const data = asJsonObject(await fetchWithAuth(
    `${API_URL}/api/workspaces/${workspaceId}/financial/receipts?page=${page}&limit=${limit}`
  ));
  return {
    receipts: data.receipts as Receipt[],
    pagination: data.pagination as { page: number; limit: number; total: number; totalPages: number },
  };
}

/**
 * Fetches single receipt details.
 */
export async function fetchReceipt(workspaceId: string, receiptId: string): Promise<Receipt> {
  const data = asJsonObject(await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/receipts/${receiptId}`));
  return data.receipt as Receipt;
}

/**
 * Downloads invoice PDF as a Blob.
 */
export async function downloadInvoicePdfBlob(workspaceId: string, invoiceId: string): Promise<Blob> {
  const response = await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/invoices/${invoiceId}/pdf`);
  if (!(response instanceof Blob)) throw new Error("Invoice PDF response was invalid.");
  return response;
}

/**
 * Downloads receipt PDF as a Blob.
 */
export async function downloadReceiptPdfBlob(workspaceId: string, receiptId: string): Promise<Blob> {
  const response = await fetchWithAuth(`${API_URL}/api/workspaces/${workspaceId}/financial/receipts/${receiptId}/pdf`);
  if (!(response instanceof Blob)) throw new Error("Receipt PDF response was invalid.");
  return response;
}
