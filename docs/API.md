# API Reference

Base URL for local development: `http://localhost:5000`. The API uses JSON unless an endpoint returns a PDF. Authentication is an HTTP-only `authToken` cookie set by login; protected endpoints also accept bearer tokens through middleware. Browser clients must send credentials. Swagger UI is at `/api-docs` and JSON at `/api-docs/swagger.json`; financial routes have generated path descriptions, while detailed invoice/payment request schemas remain partial.

Unless stated otherwise, JSON responses use `{ success, message?, data? }`; actual response envelopes vary for compatibility. Errors generally use `{ success: false, message }`. Authentication failures are 401; ownership failures are 403 or resource-specific 404. Validation errors are 400. Unexpected server errors return a generic message outside development.

## Health and authentication

| Method and path | Auth | Input and behavior |
|---|---|---|
| `GET /api/health` | No | Liveness response `{ success: true, message }`. |
| `GET /api-docs` | No | Swagger UI. |
| `GET /api-docs/swagger.json` | No | Generated OpenAPI JSON. |
| `POST /api/auth/register` | No | `fullName`, `email`, `password`; creates a password account and sets auth cookie on success. See controller validation for field limits. |
| `POST /api/auth/login` | No | `email`, `password`; generic credential failure and auth cookie on success. |
| `POST /api/auth/logout` | No | Clears auth cookie. |
| `GET /api/auth/me` | Yes | Current safe user profile. |
| `POST /api/auth/forgot-password` | No | `email`; rate limited to 5 requests per IP per 15 minutes and uses a generic response. |
| `POST /api/auth/reset-password` | No | `token`, `password` (minimum 8 characters); consumes token and invalidates older sessions. |
| `GET /api/auth/google` | No | Starts OAuth if configured; otherwise reports/redirects for unavailable OAuth. |
| `GET /api/auth/google/callback` | No | OAuth callback, issues auth cookie and redirects to the configured frontend. |

## Workspace endpoints

All `/api/workspaces` routes require authentication. AI generation and regeneration are limited to 30 requests per IP per 15 minutes.

| Method and path | Input and behavior |
|---|---|
| `POST /api/workspaces/generate` | JSON `description` (50–5000 trimmed characters); creates and returns a validated blueprint draft. |
| `GET /api/workspaces/generations/:generationId` | Returns a draft only to its owner. |
| `POST /api/workspaces/generations/:generationId/regenerate` | Regenerates the owner's draft from its saved description. |
| `POST /api/workspaces/generations/:generationId/launch` | Optional reviewed `blueprint` body; revalidates and provisions an owned draft. Returns `workspaceId`. |
| `POST /api/workspaces/provision` | Compatibility endpoint accepting `blueprint` and optional `generationId`. |
| `GET /api/workspaces` | Lists the authenticated user's workspaces. |
| `GET /api/workspaces/:workspaceId` | Returns metadata and module definitions after ownership check. |
| `PATCH /api/workspaces/:workspaceId` | JSON `name`; updates workspace name after ownership check. |
| `GET /api/workspaces/:workspaceId/overview` | Returns workspace counts and recent dynamic records. |
| `GET /api/workspaces/:workspaceId/modules/:moduleId/records` | Lists records; supports `page`, `limit`, and `search`. Page size is capped at 100. |
| `POST /api/workspaces/:workspaceId/modules/:moduleId/records` | Creates a record from a JSON object of defined field values. |
| `GET /api/workspaces/:workspaceId/modules/:moduleId/records/:recordId` | Reads one record within the authorized workspace/module. |
| `PATCH /api/workspaces/:workspaceId/modules/:moduleId/records/:recordId` | Updates defined fields on a record. |
| `DELETE /api/workspaces/:workspaceId/modules/:moduleId/records/:recordId` | Deletes a record within the authorized workspace/module. |

Blueprints are validated server-side, including supported fields, relationships, and identifier safety. Dynamic CRUD validates values and relation targets within the same workspace. Exact response envelopes are defined by controllers; see Swagger annotations where available.

## Financial endpoints

All finance endpoints require authentication and are nested under `/api/workspaces/:workspaceId/financial`. Workspace ownership is checked by service operations.

| Method and path | Input and behavior |
|---|---|
| `GET /capabilities` | Detects finance-related modules and capabilities from workspace definitions. |
| `GET /invoices` | Lists invoices with pagination and optional filters supported by the controller/service. |
| `POST /invoices` | Creates an invoice from validated payer, line-item, currency, total, and optional workspace source-record information. |
| `GET /invoices/:invoiceId` | Retrieves one invoice in the workspace. |
| `PATCH /invoices/:invoiceId/status` | Updates invoice status and optional notes subject to service validation. |
| `GET /invoices/:invoiceId/pdf` | Returns an invoice PDF (`application/pdf`). An invoice is not proof of payment. |
| `POST /invoices/:invoiceId/payments` | Records a payment with amount, currency, method, optional status/reference/idempotency key/date/notes. Service defaults status to `CONFIRMED`; this is manual recording and not processor verification. |
| `GET /payments` | Lists workspace payments with pagination. |
| `GET /receipts` | Lists issued receipts with pagination. |
| `GET /receipts/:receiptId` | Retrieves a receipt belonging to the workspace. |
| `GET /receipts/:receiptId/pdf` | Returns a PDF for an issued receipt (`application/pdf`). |

Only payments marked confirmed by the request are reflected in invoice balances and produce a receipt. The service defaults a manually submitted payment to `CONFIRMED`; that status does not represent provider verification. No payment provider, verification, or webhook endpoint is implemented. OpenAPI documents registered paths, authentication, parameters, high-level bodies, and responses; consult controller/service validation for exact accepted financial fields.
