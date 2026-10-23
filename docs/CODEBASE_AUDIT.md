# Codebase Audit

Audit snapshot: 2026-10-17. This document records the repository inventory and the scope actually reviewed in this pass. It does not claim line-by-line verification of every first-party source file.

## Repository and entry points

The top-level `vifems` directory is a container, not a Git repository. `vifems-backend/` and `vifems-frontend/` each contain a Git repository. The backend Git status was clean at inspection. The frontend already had modified dashboard CSS/page, login, onboarding, blueprint review and workspace API files, plus untracked dashboard, financial, and API client files. Those changes were preserved.

- Backend entry point: `src/server.js`; Express setup: `src/app.js`.
- Frontend entry: Next.js App Router in `app/layout.tsx` and `app/page.tsx`; route pages include login/signup/password reset, onboarding, dashboard, and privacy.
- Database source: `prisma/schema.prisma`; Prisma client: `src/config/database.js`.
- Backend test suites: `tests/blueprintAiValidation.test.js`, `tests/vifeAiService.test.js`, `tests/workspaceApi.test.js`, `tests/e2eIntegration.test.js`, and `tests/financialDocumentEngine.test.js`.
- API docs source: `src/docs/swagger.js` plus route/controller annotations; served at `/api-docs`.

## Major module inventory

| Area | Purpose |
|---|---|
| Backend `src/routes/` | Auth, workspace, and nested financial endpoint registration and middleware. |
| Backend `src/controllers/` | Auth, workspace and financial request parsing and response formatting. |
| Backend `src/services/authService.js` | Registration, credential checks, JWT helpers, password reset, Google identity lookup. |
| Backend `src/services/vifeAiService.js` | Blueprint prompt/provider handling, deterministic fallback, structure validation, type and identifier normalization. |
| Backend `src/services/workspaceService.js` | Draft lifecycle, dynamic PostgreSQL provisioning, ownership checks, dynamic CRUD, overview. |
| Backend `src/services/financialService.js` and `financialDetection.js` | Invoice, payment, receipt, audit, capability behavior. |
| Backend `src/services/pdfService.js`, `emailService.js` | PDF document rendering and SMTP email delivery. |
| Backend `src/middleware/` | JWT authentication and centralized errors/404. |
| Backend `src/config/` | Prisma client and optional Google Passport strategy. |
| Backend `prisma/` | Prisma schema (and migration directory if populated). |
| Frontend `app/` | Route pages, layout, global/landing/dashboard/onboarding styles. |
| Frontend `components/` | Marketing and onboarding UI plus financial invoice/payment/receipt views. |
| Frontend `lib/api/` | Typed workspace and financial fetch clients. |
| `public/` | Static images, icons, and manifest. |

The installed stack is Express 5 / JavaScript / Prisma 5 / PostgreSQL and Next.js 16 / React 19 / TypeScript. Four Prisma migrations were inventoried and read; no schema migration was added. No separate Tra-Sync backend/module, payment-provider integration, webhook route, deployment manifest, or CI definition was found in the enumerated non-generated file inventory. The landing-page Tra-Sync demo uses a timed client-side state loop and labels its data as sample; it is not connected to a server-side verification result. The environment examples include optional AI, SMTP, OAuth, and database settings; actual local secrets were not read or copied.

## Main flows

- Authentication: public auth routes → controller → auth service/Prisma; JWT is set as an HTTP-only cookie; protected middleware reloads the user and checks password-change time.
- Workspace: authenticated description → AI provider or fallback → normalized and validated blueprint → user-owned draft → revalidated launch → metadata plus dynamic PostgreSQL tables → schema-driven dashboard and tenant-filtered CRUD.
- Finance: authenticated workspace user → invoice → manual payment entry → confirmed status updates totals and creates a receipt snapshot; pending/failed/cancelled statuses do not update totals. There is no external payment verification in inspected backend files.

## Issues found and work done

### High

- Password reset updated the user and marked the token used in separate writes; a failure between writes could leave a changed password with a reusable token. Changed to consume the unexpired unused token and update the password inside one transaction, using a conditional update for single use.
- Authentication middleware converted every exception, including database failures, to `401`. It now returns 401 for JWT validation errors and forwards infrastructure failures to the error handler.
- The error middleware could return arbitrary 500 messages when `NODE_ENV` was unset or staging. It now keeps unexpected 5xx messages generic outside development and normalizes invalid status codes.
- Marketing presents Tra-Sync as verifying transactions, but backend implementation is absent. Landing-page demo copy now identifies provider verification as not implemented, and financial dashboard/receipt copy identifies manual recording. Some visual demo stages still show illustrative verification states and need product-owner review.

### Medium

- Generated Swagger annotations were sparse. Route-level financial OpenAPI descriptions were added; detailed invoice/payment request schemas remain partial and must be checked against service validation.
- Dynamic table provisioning uses compensating cleanup rather than a single transaction and continues after foreign-key DDL errors; `ACTIVE` workspace status and reported relation guarantees should be revisited.
- Payment idempotency checks happen before the transaction; invoice balance is read before the transaction. Concurrent requests may race, and idempotency-key reuse with a different invoice/body is not explicitly rejected. A fully safe correction needs concurrency semantics and likely dedicated tests; it was not changed in this pass.
- Some generated dynamic table identifiers and business fields rely on normalization. Safe SQL values are parameterized, but generated schema lifecycle and relation behavior need integration coverage.

### Lower priority / maintenance

- The backend README overstates Swagger completeness and includes claims that require provider-specific confirmation. The root README now gives neutral setup guidance, and the API guide discloses the gap.
- The configured frontend lint command originally reported 106 errors and 24 warnings in the current working tree. Remediation reduced it to 0 errors and 0 warnings; the dashboard/API changes were among pre-existing uncommitted work and were preserved while resolving findings.
- Existing source includes legacy root-level debug/manual scripts (`debugOAuth.js`, `check.cjs`, `testEmail.js`, `testRegister.bat`). Their use and safety were not established; they were not deleted.
- Frontend dashboard/auth/onboarding files had user changes at audit start and were edited only to remediate findings while preserving feature work. A full manual UI and component review remains outstanding.

## Scope and limits

Inventory covered all non-generated file paths returned for backend and frontend source, config, tests, schema, docs, examples, and package scripts. Static searches examined raw SQL, catches, logging, environment references, transactions, and placeholder markers. Key service, route, middleware, schema, and test setup sections were read. The large AI/workspace/finance services and the sizeable frontend (including CSS and landing content) were not all line-by-line audited; do not treat this report as a comprehensive security certification.

The two Git repositories were readable after supplying a per-command safe-directory override; no global Git setting was changed. No live database, provider dashboard, hosting configuration, secrets, or production infrastructure was accessed. The Rumpty Cloud production database assumption in the request could not be verified from source without exposing/using credentials.

## Areas deliberately not changed

- No Prisma schema or migration changes, production data actions, or infrastructure changes.
- No API contract, dependency, framework, backend language, or dynamic workspace architecture changes.
- No destructive changes to pre-existing frontend working-tree changes; targeted edits were made to lint/type issues while retaining the visible dashboard, login, onboarding, and API additions.
- No removal of scripts or dependencies without proof they are unused.

## Follow-up priorities

1. Resolve the Tra-Sync product/marketing mismatch: implement real provider verification with signed webhook handling and idempotency, or adjust claims after product-owner approval.
2. Add integration tests for reset-token single-use races, authorization/tenant isolation, provision rollback, concurrent payment updates, and idempotency collisions.
3. Make payment state transitions safe under concurrency and make idempotency keys bind to a request/invoice.
4. Make provisioning state accurate and fail clearly when declared relation constraints cannot be established.
5. Complete OpenAPI definitions, review frontend dirty changes, and complete line-by-line module review before describing the repository as fully audited.

## Remediation update (2026-10-17)

- Frontend lint before remediation: **106 errors / 24 warnings**. After remediation, `npm run lint` reports **0 errors / 0 warnings**. `npx tsc --noEmit --incremental false` passes. Changes targeted typed API boundaries, async effect lifecycle, derived state, unused code, and navigation; no lint rules were disabled.
- Backend `node --check` across source files passed. Backend tests and migrations were not run because no disposable database target was established. Prisma schema/migration application remains unverified.
- `npx prisma validate` passed for schema validation; this does not apply or integration-test migrations.
- Frontend production build passed. Next.js emitted a workspace-root warning because it ignored a parent `C:\Users\User\package-lock.json`; all routes compiled and generated successfully.
- Added OpenAPI descriptions for all registered financial routes, with authentication, path/query parameters, high-level request-body descriptions and PDF response types. Detailed invoice/payment payload schemas remain partial where controller/service validation is authoritative.
- Source inventory/static searches covered the first-party tree, but the full AI/workspace/financial services and all UI components were not read line by line. Detailed inspection included auth reset/middleware/error handling, financial controller/service flows, route registration, schema/migrations, frontend lint targets, and API clients. Remaining review includes exhaustive concurrency/tenant-authorization analysis, full UI/accessibility behavior, and production infrastructure/database configuration.
- No destructive database action, schema edit, dependency change, or payment-provider integration was performed. Landing-page Tra-Sync claims still need product-owner review; no provider verification flow exists.
