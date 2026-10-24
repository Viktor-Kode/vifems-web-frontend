# VifeMS — Technical Documentation

**Version:** 2026-10-24
**Hackathon:** Devcenter Hacktober Sprint
**Deployment:** [https://vifems.rumptycloud.app](https://vifems.rumptycloud.app)

---

## Table of contents

1. [Overview](#1-overview)
2. [System architecture](#2-system-architecture)
3. [Technology stack](#3-technology-stack)
4. [Repository structure](#4-repository-structure)
5. [Installation and local setup](#5-installation-and-local-setup)
6. [Environment variables](#6-environment-variables)
7. [AI blueprint generation](#7-ai-blueprint-generation)
8. [Workspace and dynamic data model](#8-workspace-and-dynamic-data-model)
9. [Database and Prisma](#9-database-and-prisma)
10. [Authentication and security](#10-authentication-and-security)
11. [API reference](#11-api-reference)
12. [Frontend architecture and usage](#12-frontend-architecture-and-usage)
13. [Testing and quality assurance](#13-testing-and-quality-assurance)
14. [Rumpty Cloud deployment](#14-rumpty-cloud-deployment)
15. [Troubleshooting](#15-troubleshooting)
16. [Known limitations and roadmap](#16-known-limitations-and-roadmap)
17. [Contribution guidelines](#17-contribution-guidelines)

---

## 1. Overview

### Project purpose

VifeMS (Visual / Flexible Enterprise Management System) is an AI-powered platform that generates custom business management workspaces from plain-English descriptions. A user describes their business once; the system produces a structured data model, provisions a live database schema, and renders a complete management dashboard — with no code required.

### Problem statement

Small businesses operate across thousands of distinct domains (bakeries, repair shops, consultancies, tailoring studios, clinics). Off-the-shelf software is too rigid; custom software is too expensive. Spreadsheets are fragile and do not enforce data types, relationships, or financial records.

VifeMS occupies the middle: users get a workspace shaped to their actual business, not a generic template they must squeeze their workflow into.

### Target users

- Small business owners who need operational software but not a developer
- Businesses whose workflow does not fit standard ERP categories
- Developers and evaluators who want to test AI-driven schema generation

### Core design principles

1. **Description-driven** — the schema is derived from the business description, not selected from a catalogue
2. **Data-driven, not template-driven** — module metadata drives every form, table, and relationship at runtime
3. **Tenant isolation** — every workspace, record, invoice, and financial entry is scoped to the owning user
4. **Defense in depth** — blueprint validation, identifier sanitization, and relation checks are enforced server-side regardless of frontend input

### Scope and current status

| Capability | Status |
|---|---|
| AI blueprint generation (LLM + fallback) | Implemented and tested |
| Blueprint review and edit | Implemented |
| Dynamic workspace provisioning | Implemented and integration-tested |
| Schema-driven CRUD dashboard | Implemented |
| Financial documents (invoice, payment, receipt, PDF) | Implemented and integration-tested |
| Email delivery (welcome, password reset) | Implemented |
| Google OAuth | Implemented |
| Real-time payment processor verification | Not implemented |
| CI/CD pipeline | Not present in repository |
| Role-based access control within a workspace | Not implemented |

---

## 2. System architecture

### High-level overview

```
Browser (Next.js)
     |
     | HTTPS (cookie auth, JSON, PDF)
     v
Express API (Node.js)
     |
     |-- Auth middleware (JWT cookie)
     |-- VifeAI service (LLM / fallback -> blueprint)
     |-- Workspace service (provision / CRUD)
     |-- Financial service (invoice / payment / receipt)
     |-- Email service (Nodemailer)
     |-- PDF service (PDFKit)
     v
PostgreSQL (Prisma ORM + raw DDL)
     |
     |-- Static Prisma tables (users, workspaces, modules, invoices, ...)
     |-- Dynamic module tables (ws_<id>_<slug> — provisioned at runtime)
```

### Request flow

```mermaid
sequenceDiagram
  actor User
  participant UI as Next.js UI
  participant API as Express API
  participant Auth as Auth middleware
  participant Service as Domain service
  participant DB as PostgreSQL (Prisma + raw)

  User->>UI: Submit action
  UI->>API: HTTP request + authToken cookie
  API->>Auth: Protected route
  Auth->>DB: Verify JWT, reload user, check passwordChangedAt
  Auth-->>API: req.user populated
  API->>Service: Validated parameters
  Service->>DB: Scoped query or raw DDL
  DB-->>Service: Result
  Service-->>API: Domain result
  API-->>UI: JSON or PDF response
  UI-->>User: Updated interface
```

### Workspace provisioning flow

```mermaid
sequenceDiagram
  actor User
  participant UI as Onboarding UI
  participant API as Express API
  participant AI as VifeAI service
  participant WS as Workspace service
  participant DB as PostgreSQL

  User->>UI: Business description (50-5000 chars)
  UI->>API: POST /api/workspaces/generate
  API->>AI: generateWorkspaceBlueprint(description)
  AI->>AI: LLM call (or deterministic fallback)
  AI->>AI: validateBlueprint() — schema + identifier checks
  AI-->>API: Validated blueprint JSON
  API->>DB: INSERT WorkspaceGeneration (status: REVIEW_READY)
  API-->>UI: { generationId, blueprint }
  User->>UI: Review and edit blueprint
  UI->>API: POST /api/workspaces/generations/:id/launch
  API->>WS: provisionWorkspace({ userId, generationId, blueprint })
  WS->>WS: Re-validate blueprint server-side
  WS->>DB: INSERT Workspace
  loop For each module
    WS->>DB: CREATE TABLE ws_<wsId>_<slug> (typed columns)
    WS->>DB: INSERT WorkspaceModule (metadata)
  end
  WS->>DB: UPDATE WorkspaceGeneration (status: COMPLETED)
  API-->>UI: { workspaceId }
  UI->>User: Redirect to /dashboard/:workspaceId
```

### Component responsibilities

| Component | Responsibility |
|---|---|
| `src/app.js` | CORS, body parsing, cookie parsing, Passport init, route mounting, Swagger UI, error handling |
| `src/server.js` | PORT binding, SMTP verification at startup, production keep-alive ping |
| `src/routes/` | Rate limits, auth guard, route-to-controller mapping |
| `src/controllers/` | HTTP parsing, input extraction, response formatting |
| `src/services/vifeAiService.js` | LLM prompt building, provider call, retry logic, blueprint validation and normalization, deterministic fallback parser |
| `src/services/workspaceService.js` | Draft lifecycle, DDL provisioning, module metadata, tenant-scoped CRUD |
| `src/services/authService.js` | Registration, credential checks, JWT helpers, password reset tokens |
| `src/services/financialService.js` | Invoice, payment, receipt, audit log logic |
| `src/services/emailService.js` | Nodemailer transporter, welcome and reset email templates |
| `src/services/pdfService.js` | PDFKit invoice and receipt document rendering |
| `src/middleware/authMiddleware.js` | JWT extraction (cookie or bearer), user reload, passwordChangedAt check |
| `src/middleware/errorMiddleware.js` | Centralized error responses, 404 handler, safe 5xx messages |

---

## 3. Technology stack

### Backend

| Technology | Version | Role |
|---|---|---|
| Node.js | >=18 (ESM) | Runtime |
| Express | 5.x | HTTP framework |
| Prisma | 5.22 | ORM for static schema |
| PostgreSQL | Any modern | Primary database |
| bcryptjs | 3.x | Password hashing (12 rounds) |
| jsonwebtoken | 9.x | JWT signing and verification |
| cookie-parser | 1.4 | HTTP-only cookie handling |
| cors | 2.8 | CORS with origin allowlist |
| express-rate-limit | 8.x | AI endpoint rate limiting |
| passport + passport-google-oauth20 | 0.7 / 2.x | Optional Google OAuth |
| nodemailer | 10.x | SMTP email (Gmail) |
| pdfkit | 0.20 | Invoice and receipt PDF generation |
| swagger-jsdoc + swagger-ui-express | 6.x / 5.x | OpenAPI 3 documentation |
| nodemon | 3.x | Dev auto-restart |

### Frontend

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.3.8 | App Router framework |
| React | 19.x | UI runtime |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility CSS |
| Lucide React | 1.51 | Icon library |
| GSAP | 3.15 | Animation |
| Lenis | 1.3 | Smooth scroll |
| ESLint | 9 + eslint-config-next | Linting |

---

## 4. Repository structure

Two separate Git repositories; both are subdirectories of the local `vifems/` workspace.

### Frontend — `vifems-frontend/`

```
app/
  page.tsx                     Landing page
  layout.tsx                   Root layout (Google Fonts, global providers)
  globals.css                  Base CSS reset and variables
  landing.css                  Landing page styles
  login/page.tsx               Login form
  signup/page.tsx              Registration form
  forgot-password/page.tsx     Forgot password form
  reset-password/page.tsx      Reset password form
  onboarding/
    page.tsx                   Four-stage workspace creation
    onboarding.css
  dashboard/
    WorkspaceDashboard.tsx     Full workspace UI (1,600+ line component)
    dashboard.css
    page.tsx                   Dashboard list page
    [workspaceId]/page.tsx     Dynamic workspace route
  privacy/page.tsx             Privacy policy

components/
  financial/                   Invoice, payment, receipt UI panels

lib/
  api/
    workspace.ts               Typed fetch client for workspace/generation/record endpoints
    financial.ts               Typed fetch client for financial endpoints

types/                         Shared TypeScript interfaces

public/                        Static assets (images, icons, manifest)

docs/                          Technical documentation (this file and supporting docs)
```

### Backend — `vifems-backend/`

```
prisma/
  schema.prisma                All static Prisma models
  migrations/                  Applied migration SQL

src/
  app.js                       Express configuration
  server.js                    Entry point
  config/
    database.js                Prisma client singleton
    passport.js                Google Passport strategy
  controllers/                 Auth, workspace, financial
  routes/                      Auth, workspace, financial
  services/                    vifeAi, workspace, auth, email, financial, financialDetection, pdf
  middleware/                  Auth, error
  docs/
    swagger.js                 OpenAPI spec (swagger-jsdoc)

tests/                         5 test files, 54 tests total
docs/                          Supporting documentation

.env.example                   Safe variable reference
```

---

## 5. Installation and local setup

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL (local instance or remote — Neon, Supabase, Rumpty Cloud, etc.)

### Step 1 — Clone both repositories

```bash
mkdir vifems && cd vifems

git clone https://github.com/Viktor-Kode/vifems-web-backtend.git vifems-backend
git clone https://github.com/Viktor-Kode/vifems-web-frontend-.git vifems-frontend
```

### Step 2 — Set up the backend

```bash
cd vifems-backend

# Install dependencies
npm install

# Create and fill environment file
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, AUTH_SECRET, CLIENT_URL

# Apply database schema
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Backend runs at `http://localhost:5000`.
Swagger UI: `http://localhost:5000/api-docs`.

### Step 3 — Set up the frontend

In a separate terminal:

```bash
cd vifems-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:5000

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Step 4 — Verify the setup

```bash
# Backend health check
curl http://localhost:5000/api/health
# Expected: {"success":true,"message":"VifeMS backend is running"}
```

Open `http://localhost:3000` in a browser, create an account, and complete onboarding.

---

## 6. Environment variables

### Backend `.env`

| Variable | Required | Format | Notes |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://USER:PASS@HOST:5432/DB?sslmode=require` | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random hex string >=32 chars | JWT signing secret |
| `JWT_EXPIRES_IN` | No | Duration string — `7d` | Default: `7d` |
| `CLIENT_URL` | Yes | URL | Frontend origin for CORS |
| `NODE_ENV` | No | `development` or `production` | Controls safe error messages and cookie flags |
| `PORT` | No | Integer | Default: `5000` |
| `SMTP_HOST` | Yes* | Hostname | `smtp.gmail.com` |
| `SMTP_PORT` | No | Integer | `465` |
| `SMTP_SECURE` | No | `true`/`false` | `true` for port 465 |
| `SMTP_USER` | Yes* | Email address | Gmail sending address |
| `SMTP_PASS` | Yes* | App password | Gmail App Password — not your account password |
| `EMAIL_FROM` | No | `"Name <email>"` | Display name and address |
| `PASSWORD_RESET_EXPIRES_MINUTES` | No | Integer | Default: `30` |
| `GOOGLE_CLIENT_ID` | No | OAuth client ID | Required to enable Google login |
| `GOOGLE_CLIENT_SECRET` | No | OAuth secret | Required to enable Google login |
| `GOOGLE_CALLBACK_URL` | No | URL | Default: `http://localhost:5000/api/auth/google/callback` |
| `RUMPTY_API_KEY` | No | API key | Rumpty Cloud LLM. If absent, fallback parser is used. |
| `OPENAI_API_KEY` | No | API key | Alternative LLM provider |
| `AI_BASE_URL` | No | URL | Default: `https://chat.rumptycloud.com/v1` |
| `AI_MODEL` | No | Model name | Default: `llama3.2:3b` |
| `BACKEND_URL` | No | URL | Production keep-alive self-ping target |

> \* SMTP variables are required for email delivery. If they are absent, email sending silently fails but the server starts normally.

### Frontend `.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Express backend base URL |

---

## 7. AI blueprint generation

### How it works

1. The user submits a business description (50–5,000 characters) to `POST /api/workspaces/generate`.
2. The backend calls `generateWorkspaceBlueprint(description)` in `vifeAiService.js`.
3. If an API key is present (`RUMPTY_API_KEY`, `OPENAI_API_KEY`, or `AI_API_KEY`), the service calls the configured OpenAI-compatible endpoint with a structured prompt that enforces the blueprint JSON schema.
4. The LLM response is parsed and validated by `validateBlueprint()`. If it fails, the service retries once with the validation errors appended to the prompt.
5. If no API key is configured, or if both LLM attempts fail, `buildDynamicBlueprintFromPrompt()` produces a deterministic blueprint from semantic keyword matching.
6. The validated, normalized blueprint is persisted as a `WorkspaceGeneration` record (status: `REVIEW_READY`) and returned to the frontend.

### Prompt engineering

The LLM prompt (`buildAiPrompt()`) enforces:
- System-managed primary keys — AI must never generate an `id` field or any field that would duplicate the platform-managed `id`
- Explicit foreign key fields (`type: "relation"`) for relationships
- Allowed field types only — validated against a server-side allowlist
- A `select` field must always include an `options` array with 3–8 values
- Output must be raw JSON — no markdown code blocks

### Blueprint schema

```json
{
  "workspaceName": "string",
  "description": "string",
  "modules": [
    {
      "name": "string",
      "slug": "snake_case_identifier",
      "description": "string",
      "fields": [
        {
          "name": "snake_case_column_name",
          "label": "Human display label",
          "type": "text|long_text|number|decimal|boolean|date|datetime|email|phone|select|currency|relation",
          "required": true,
          "options": ["Option A", "Option B"],
          "targetModule": "related_module_slug",
          "targetField": "id"
        }
      ],
      "views": ["table", "form"]
    }
  ],
  "relationships": [
    {
      "name": "string",
      "sourceModule": "slug",
      "sourceField": "relation_field_name",
      "targetModule": "slug",
      "targetField": "id",
      "cardinality": "many-to-one",
      "required": true,
      "label": "belongs to"
    }
  ]
}
```

### Server-side validation

`validateBlueprint()` enforces:

- Workspace name: 2–100 characters
- Modules: 1–15
- Fields per module: 1–30
- No user-defined `id` or self-primary-key fields
- All field types from the allowed set
- `select` fields must have at least one valid option
- `relation` fields must reference a module that exists in the blueprint
- No duplicate module slugs or field names
- All identifier strings pass the safe-identifier regex (`^[a-z][a-z0-9_]{1,60}$`)
- Reserved SQL keywords and system names are prefixed to avoid collisions

### Fallback parser

When no LLM is configured, `buildDynamicBlueprintFromPrompt()` applies keyword matching to infer the business domain (bakery, clinic, repair shop, real estate, etc.) and generates a domain-appropriate set of modules, fields, and relationships. The output passes the same `validateBlueprint()` check before returning.

---

## 8. Workspace and dynamic data model

### Logical vs. physical separation

VifeMS separates two kinds of schema:

| Layer | Storage | Modified by |
|---|---|---|
| **Metadata** (Prisma) | `workspace_modules` table — JSON field definitions, views, relationships | Blueprint launch |
| **Physical records** (raw DDL) | `ws_<wsId>_<slug>` PostgreSQL tables — one per module | `CREATE TABLE` at launch time |

A new business description does **not** modify the Prisma static schema. It creates a new `Workspace` + `WorkspaceModule` rows and new physical tables.

### Dynamic table structure

Every provisioned module table contains:

```sql
CREATE TABLE "ws_<cleanWsId>_<moduleSlug>" (
  "id"           VARCHAR(64)   PRIMARY KEY,           -- rec_<nanoid> assigned by service
  "workspace_id" VARCHAR(64)   NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "data"         JSONB         NOT NULL DEFAULT '{}',
  "<field_name>" <SQL_TYPE>,   -- one column per field from blueprint
  ...
);
```

### Record creation

`createRecord()` in `workspaceService.js`:
1. Loads `WorkspaceModule` metadata to get the physical table name and field definitions
2. Validates each submitted value against the field definition (type, required)
3. For `relation` fields, verifies the referenced record exists in the same workspace
4. Generates a `rec_<nanoid>` primary key
5. Runs a parameterized `INSERT` — values are never interpolated; only table/column names (pre-validated identifiers) are interpolated

### Record listing and search

`listRecords()` applies:
- `WHERE workspace_id = $1` — tenant isolation enforced on every query
- Optional full-text `ILIKE` search across text-type columns
- `ORDER BY created_at DESC`
- Pagination via `LIMIT` and `OFFSET` (max page size: 100)

### Relation resolution

When the frontend renders a relation field, it calls `GET /api/workspaces/:id/modules/:moduleId/records` on the target module and uses the first text field as a display label.

### Schema change behavior

Changing an existing workspace's module schema after provisioning is **not supported**. Existing physical table columns are not altered. The metadata can be updated, but structural changes (adding/removing columns) require reprovisioning, which means creating a new workspace.

---

## 9. Database and Prisma

### Prisma static models

| Model | Table | Key relationships |
|---|---|---|
| `User` | `users` | owns Workspaces, WorkspaceGenerations, PasswordResetTokens |
| `PasswordResetToken` | `password_reset_tokens` | belongs to User (cascade delete) |
| `Workspace` | `workspaces` | belongs to User; owns Modules, Generations, Invoices, Payments, Receipts, AuditLogs |
| `WorkspaceModule` | `workspace_modules` | belongs to Workspace; slug unique per workspace |
| `WorkspaceGeneration` | `workspace_generations` | belongs to User; optionally linked to Workspace |
| `Invoice` | `invoices` | belongs to Workspace; invoice number unique per workspace |
| `Payment` | `payments` | belongs to Workspace and Invoice; idempotency key unique per workspace |
| `Receipt` | `receipts` | one-to-one with Payment; receipt number unique per workspace |
| `FinancialAuditLog` | `financial_audit_logs` | belongs to Workspace; optional links to Invoice, Payment, Receipt |

### Migration workflow

```bash
# Development — create and apply a new migration
npx prisma migrate dev --name descriptive_name

# Validate schema without applying
npx prisma validate

# Regenerate Prisma client after schema changes
npx prisma generate

# Open visual browser
npx prisma studio
```

**Production:** Apply migrations through a controlled release process with a verified backup. Never run `prisma migrate dev` in production. Never run integration tests against the production database — tests create and delete users, workspaces, and dynamic tables.

### Data integrity notes

- Dynamic table `workspace_id` columns reference the static `workspaces` table with `ON DELETE CASCADE` — deleting a workspace removes all its dynamic records
- Foreign key constraints between dynamic module tables (relation fields) are added with a best-effort DDL statement at provisioning; the service logs and continues if the DDL fails, so not every declared relation is guaranteed to have a database-level constraint. Runtime validation checks same-workspace record existence for relation fields
- Invoice and receipt numbers are generated by querying existing rows; concurrent writes to the same workspace could theoretically race. The unique database constraint prevents duplicates from persisting but may cause retryable errors under high load

---

## 10. Authentication and security

### Registration and login

- `POST /api/auth/register` — validates fullName, email (unique), password (minimum 8 characters). Hashes password with bcrypt (12 rounds). Sets `authToken` HTTP-only cookie. Sends welcome email (failure does not abort registration).
- `POST /api/auth/login` — verifies email and bcrypt hash. Generic error message regardless of whether the email exists (prevents enumeration). Sets `authToken` cookie on success.
- `POST /api/auth/logout` — clears the cookie.
- `GET /api/auth/me` — returns safe user profile (no password hash).

### JWT cookie

| Property | Value |
|---|---|
| Cookie name | `authToken` |
| `httpOnly` | true — JavaScript cannot access it |
| `secure` | true in production (HTTPS only) |
| `sameSite` | `none` in production, `lax` in development |
| `maxAge` | 7 days (configurable via `JWT_EXPIRES_IN`) |

### Authentication middleware

`requireAuth` in `authMiddleware.js`:
1. Extracts JWT from cookie or `Authorization: Bearer` header
2. Verifies signature with `AUTH_SECRET`
3. Reloads the user from the database (catches deleted accounts)
4. Checks `user.passwordChangedAt` against JWT `iat` — rejects tokens issued before a password change
5. Returns 401 for JWT errors; forwards database/infrastructure errors to the centralized error handler

### Password reset

```
1. POST /api/auth/forgot-password
   -> Generate 48-byte random token
   -> SHA-256 hash stored in PasswordResetToken (expires in 30 minutes)
   -> Raw token embedded in reset link, emailed to user
   -> Always returns generic success (no account enumeration)
   -> Rate limited: 5 requests per IP per 15 minutes

2. POST /api/auth/reset-password
   -> Hash submitted token
   -> Atomic conditional update: match tokenHash + unused + not expired
   -> Update passwordHash, set passwordChangedAt, mark token used (single write)
   -> Invalidates all existing JWTs (passwordChangedAt check)
```

### Google OAuth

Optional. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. If not configured, the server logs a warning and Google login routes return a clear error.

Existing email/password accounts are not automatically merged with a Google account on the same email — the user is redirected to `/login?error=email_exists_no_google`.

### Authorization — workspace and financial operations

- All workspace and financial service functions accept `userId` from `req.user`
- `getWorkspaceById()` rejects requests where `workspace.userId !== userId` (403)
- Dynamic CRUD, financial operations, and overview all pass the workspace ID and perform the ownership check
- Relation field values are validated to confirm the referenced record exists in the **same** workspace

### Input validation

- Blueprint identifiers are filtered through `sanitizeIdentifier()` (regex allowlist)
- `assertSafeIdentifier()` re-checks every table and column name before DDL execution
- Reserved SQL keywords are prefixed
- Dynamic record values are always passed as parameterized query parameters — not interpolated into SQL strings

### Rate limiting

- AI generation endpoints (`/generate`, `/regenerate`): 30 requests per IP per 15 minutes
- Forgot-password endpoint: 5 requests per IP per 15 minutes

---

## 11. API reference

Full interactive reference: **[https://vifems-backend.rumptycloud.app/api-docs](https://vifems-backend.rumptycloud.app/api-docs)**

Local development: **http://localhost:5000/api-docs**

All JSON responses use `{ success, message?, data? }` unless otherwise noted. Errors return `{ success: false, message }`.

See [API.md](API.md) for the complete endpoint table.

### Common status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error (bad input, invalid blueprint, limit exceeded) |
| 401 | Authentication required or token invalid |
| 403 | Authenticated but not authorized (wrong workspace owner) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error (message is generic in production) |

---

## 12. Frontend architecture and usage

### Main routes

| Route | What it does |
|---|---|
| `/` | Landing page — product overview, animated demo |
| `/signup` | Email/password registration form |
| `/login` | Login form + Google OAuth link |
| `/forgot-password` | Triggers password reset email |
| `/reset-password` | Reads `?token=` from URL, sets new password |
| `/onboarding` | Multi-stage workspace creation |
| `/dashboard` | Lists all workspaces for the authenticated user |
| `/dashboard/[workspaceId]` | Full workspace management dashboard |
| `/privacy` | Privacy policy |

### Onboarding flow (`/onboarding`)

Stage 1 — **Describe:** The user types a business description. Client-side validation enforces the 50–5,000 character range before submission.

Stage 2 — **Generate:** `POST /api/workspaces/generate` is called. A loading state is shown while the blueprint is generated. The blueprint arrives as a structured JSON response.

Stage 3 — **Review:** The blueprint is rendered as an interactive editor. Users can:
- Rename the workspace
- Remove modules
- Remove or rename fields
- Edit field types from a type dropdown
- Cascade removal handles relationship cleanup

Edits are tracked locally. The reviewed blueprint is submitted with the launch request.

Stage 4 — **Launch:** `POST /api/workspaces/generations/:id/launch` is called with the edited blueprint. On success, a countdown redirect timer sends the user to `/dashboard/:workspaceId`.

### Workspace dashboard (`/dashboard/[workspaceId]`)

- Loads workspace metadata and module schemas from `GET /api/workspaces/:workspaceId`
- Loads record counts and recent activity from `GET /api/workspaces/:workspaceId/overview`
- Renders a sidebar with each module listed
- Each module view renders a table of records with search and pagination
- **Create record modal** — renders a form field for each blueprint field with type-appropriate inputs (date picker, boolean toggle, select dropdown, relation selector)
- **View / Edit modal** — displays all field values; edit mode allows in-place updates
- **Delete** — protected against foreign key violations (shown as an error message)
- Relation fields — resolved by fetching the target module's records and displaying the first text field as a label

### Financial documents

The financial panel is accessible from the workspace dashboard when the workspace's modules contain financial-relevant data (detected by `GET /capabilities`):
- Invoice list with status filter
- Create invoice with payer info and line items
- Invoice detail with payment recording
- Receipt download (PDF)
- Invoice PDF download

### Loading, error, and empty states

- Every API call has a loading spinner and a catch-all error display
- 401 responses trigger a redirect to `/login`
- 403 or 404 on workspace load displays an access-denied screen
- Empty module tables show an invitation to create the first record

### First-time user guide

1. Go to [https://vifems.rumptycloud.app](https://vifems.rumptycloud.app)
2. Click **Get started** and create an account
3. Click **Create workspace** and describe your business in at least 50 characters
4. Review the generated blueprint; click **Regenerate** if the result does not match your needs
5. Click **Launch workspace** to provision your data model
6. Use the dashboard to create and manage records for each module
7. Use the **Financial** tab to create invoices and record payments

---

## 13. Testing and quality assurance

### Backend test suites

All 54 tests pass against a live database (verified 2026-10-24, exit code 0).

```bash
# Run all suites
npm.cmd test

# Individual suites (from vifems-backend/)
node --test tests/vifeAiService.test.js
node --test tests/blueprintAiValidation.test.js
node --test tests/workspaceApi.test.js
node --test tests/e2eIntegration.test.js
node --test tests/financialDocumentEngine.test.js
```

| Suite | Tests | What is tested |
|---|---|---|
| `vifeAiService.test.js` | 7 | Description length limits, identifier sanitization, field type normalization, blueprint schema validation |
| `blueprintAiValidation.test.js` | 14 | AI output correctness (no PK fields), relationship integrity, field type rejection, duplicate detection, CRUD against provisioned tables, tenant isolation, multi-description diversity |
| `workspaceApi.test.js` | 7 | Unauthenticated rejection, draft creation/ownership, provisioning, idempotency, tenant ownership on workspace, record CRUD |
| `e2eIntegration.test.js` | 6 | Full onboarding, record persistence, cross-module relations, tenant isolation, failure recovery, multi-schema (consulting + retail) |
| `financialDocumentEngine.test.js` | 15 | Invoice lifecycle, payment recording, receipt immutability, partial payments, concurrent duplicate prevention, cross-workspace access rejection, PDF buffer validity, decimal precision |

**Known test log noise:** `prisma:error` messages for `23503` (foreign key violation) appear in tests that intentionally delete parent records before child records. Tests pass — the errors are caught and handled.

### Frontend quality checks

```bash
# From vifems-frontend/

# Lint (ESLint + Next.js rules) — verified 0 errors, 0 warnings
npm run lint

# TypeScript type check — verified clean
npx tsc --noEmit

# Production build — verified clean, 10 routes, 0 errors
npm run build
```

### Backend syntax check

```bash
# From vifems-backend/
node --check src/server.js src/app.js src/routes/*.js src/controllers/*.js src/services/*.js src/middleware/*.js
```

### Prisma validation

```bash
npx prisma validate
```

**Verified:** Passes (schema is structurally valid).

### Checks not executed

| Check | Reason |
|---|---|
| Prisma migration against local DB | Local PostgreSQL not available in this environment; tests use the remote DB |
| Frontend E2E tests (Playwright/Cypress) | No E2E test suite exists in the repository |
| Load / concurrency testing | Out of scope for this audit |
| Security penetration testing | Out of scope — manual review only |

---

## 14. Rumpty Cloud deployment

### Architecture

| Service | Platform | URL |
|---|---|---|
| Frontend | Rumpty Cloud (Next.js) | https://vifems.rumptycloud.app |
| Backend | Rumpty Cloud (Node.js) | https://vifems-backend.rumptycloud.app |
| Database | Rumpty Cloud PostgreSQL | Internal connection via `DATABASE_URL` |

### Frontend deployment

**Build command:** `npm run build`
**Start command:** `npm start`
**Environment variable to set in Rumpty Cloud dashboard:**
```
NEXT_PUBLIC_API_URL=https://vifems-backend.rumptycloud.app
```

### Backend deployment

**Build command:** `npm install && npx prisma generate`
**Start command:** `node src/server.js`
**Environment variables to set in Rumpty Cloud dashboard (minimum):**

```
DATABASE_URL=postgresql://...
AUTH_SECRET=<random 48-char hex>
CLIENT_URL=https://vifems.rumptycloud.app
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<gmail address>
SMTP_PASS=<gmail app password>
EMAIL_FROM=VifeMS <noreply@yourdomain.com>
RUMPTY_API_KEY=<or OPENAI_API_KEY>
AI_BASE_URL=https://chat.rumptycloud.com/v1
AI_MODEL=llama3.2:3b
BACKEND_URL=https://vifems-backend.rumptycloud.app
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if Google OAuth is required in production. Update `GOOGLE_CALLBACK_URL` to `https://vifems-backend.rumptycloud.app/api/auth/google/callback`.

### Database migration on deployment

Run migrations before starting the new server version:

```bash
npx prisma migrate deploy
```

`migrate deploy` applies pending migrations without creating new ones. Never use `migrate dev` in production.

### Health check

`GET /api/health` returns `{"success":true,"message":"VifeMS backend is running"}`. Use this as the Rumpty Cloud health probe.

The server self-pings `BACKEND_URL/api/health` every 14 minutes when `NODE_ENV=production` to prevent the service from sleeping on free-tier hosting.

### CORS configuration

The backend allows CORS from `CLIENT_URL`. In production, confirm `CLIENT_URL` is set to the exact frontend origin (`https://vifems.rumptycloud.app`) with no trailing slash.

### Deployment verification

1. `GET https://vifems-backend.rumptycloud.app/api/health` — expect 200 with success JSON
2. `GET https://vifems-backend.rumptycloud.app/api-docs` — Swagger UI loads
3. Open `https://vifems.rumptycloud.app`, register, create a workspace end-to-end
4. Check server logs for SMTP verification status at startup

---

## 15. Troubleshooting

### Missing environment variable
**Symptom:** Server crashes immediately, or features silently fail.
**Fix:** Check all required variables in `.env` / Rumpty Cloud env panel. Generate `AUTH_SECRET` with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

### Database connection failure (`P1001` / `ECONNREFUSED`)
**Symptom:** `PrismaClientInitializationError` or connection refused on startup.
**Fix:** Verify `DATABASE_URL` format, that PostgreSQL is running, and that `sslmode=require` matches your database provider's TLS setting.

### Prisma client not generated (`Cannot find module '@prisma/client'`)
**Symptom:** Import error on startup.
**Fix:** Run `npx prisma generate` from `vifems-backend/`.

### Migration not applied (`P3009` / table not found)
**Symptom:** Queries fail with "relation does not exist".
**Fix:** Run `npx prisma migrate dev --name init` (development) or `npx prisma migrate deploy` (production).

### AI blueprint generation fails / returns fallback
**Symptom:** Blueprint is generic regardless of description.
**Fix:** Check that `RUMPTY_API_KEY` or `OPENAI_API_KEY` is set, and that `AI_BASE_URL` is reachable. The fallback parser is always active and produces a valid (though less tailored) blueprint.

### Invalid blueprint error (400)
**Symptom:** Provisioning rejects with "Invalid blueprint".
**Fix:** Review validation errors in the response. Common causes: module has zero fields, relation targets a non-existent module, field type not in allowed set, identifier starts with a digit or contains invalid characters.

### Authentication failures (401 on all requests)
**Symptom:** All protected endpoints return 401.
**Fix:** Confirm `AUTH_SECRET` matches between the signing instance (current server) and the stored tokens. If `AUTH_SECRET` changed, all existing sessions are invalidated — users must log in again.

### CORS errors in browser
**Symptom:** `Access to fetch blocked by CORS policy`.
**Fix:** Confirm `CLIENT_URL` in the backend matches the exact frontend origin (protocol, hostname, port). In local dev, both `http://localhost:3000` and `http://127.0.0.1:3000` are automatically allowed.

### SMTP failure — emails not delivered
**Symptom:** Password reset emails do not arrive; server logs `SMTP connection failed`.
**Fix:** Verify `SMTP_USER` and `SMTP_PASS`. `SMTP_PASS` must be a Gmail App Password, not the account password. Enable 2-factor authentication on the Gmail account first, then generate an App Password at myaccount.google.com/apppasswords.

### Frontend build fails (`Type error`)
**Symptom:** `npm run build` exits with TypeScript errors.
**Fix:** Run `npx tsc --noEmit` for detailed errors. The build was verified clean on 2026-10-24; if errors appear, check for uncommitted changes or dependency version differences.

### PDF download fails (binary corruption)
**Symptom:** Downloaded PDF is empty or corrupt.
**Fix:** Verify the request includes credentials (cookie). Confirm the invoice or receipt exists in the workspace. PDFKit rendering errors are logged server-side.

---

## 16. Known limitations and roadmap

### Current limitations

| Limitation | Detail |
|---|---|
| No payment processor integration | Payments are manually recorded. No webhook, provider verification, or settlement check exists. |
| Schema changes after provisioning | Existing module columns cannot be altered. Reprovisioning requires a new workspace. |
| Relation FK constraints are best-effort | If the `ALTER TABLE ... ADD CONSTRAINT` DDL fails at provisioning, the relation column exists but has no database FK. Runtime validation compensates. |
| No concurrent payment safety guarantee | Invoice balance reads and payment inserts are not wrapped in a single database-level transaction. Unique constraints prevent duplicate numbers but not all races. |
| No role-based access within a workspace | All workspace access is binary: owner or denied. Team member roles are not implemented. |
| No CI/CD pipeline | No GitHub Actions, Dockerfile, or deployment manifest is present in the repository. |
| No frontend E2E tests | Playwright or Cypress is not configured. |
| 25 workspaces per user | Hard limit enforced by the provisioning service. |
| 15 modules per workspace | Hard limit enforced by the provisioning service. |
| 30 fields per module | Hard limit enforced by the provisioning service. |

### Planned enhancements (not yet implemented)

- Real payment processor integration with signed webhook verification
- Workspace module schema editing (add/remove columns on existing provisioned tables)
- Team collaboration and workspace member roles
- CI/CD pipeline and automated deployment
- Frontend E2E test suite

### Features requiring further verification

- Full UI accessibility and keyboard navigation
- Mobile responsiveness at all breakpoints (CSS reviewed; device testing incomplete)
- Production concurrency behavior under sustained load

---

## 17. Contribution guidelines

These are proposed guidelines. No formal contribution policy document existed before this audit.

### Branching

- Work on feature branches: `feature/<short-description>`
- Documentation: `docs/<description>`
- Bug fixes: `fix/<description>`
- Target `main` via pull request

### Pull requests

- Reference the issue or task being addressed
- Include a summary of what changed and why
- Do not combine unrelated changes in a single PR

### Code quality before submitting

```bash
# Backend
node --check src/**/*.js
npx prisma validate
npm test    # all 54 tests must pass

# Frontend
npm run lint    # must report 0 errors, 0 warnings
npx tsc --noEmit
npm run build   # must complete without errors
```

### Documentation

- Update the relevant documentation file when adding or changing a feature
- If adding new environment variables, update `.env.example` and the environment variable table in this document
- If adding new API endpoints, add Swagger JSDoc annotations and update `docs/API.md`

### Security

- **Never commit `.env` or `.env.local`**
- Never log credentials, tokens, password hashes, or connection strings
- Never expose raw database errors or stack traces outside `NODE_ENV=development`
- New endpoints that access workspace data must pass the authenticated user ID through the service layer — never trust client-submitted user IDs

### Issue reporting

Open an issue in the relevant GitHub repository (frontend or backend) with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (local dev / Rumpty Cloud production)
