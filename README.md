# VifeMS — Visual / Flexible Enterprise Management System

**AI-powered workspace generator and dynamic business management platform for small businesses.**

VifeMS eliminates rigid, off-the-shelf software templates. You describe your business in plain English; the AI architect designs the modules, fields, and relationships; you review the blueprint and launch — and a fully working management dashboard is ready in minutes.

**Live application →** [https://vifems.rumptycloud.app](https://vifems.rumptycloud.app)
**Backend API →** [https://vifems-backend.rumptycloud.app](https://vifems-backend.rumptycloud.app)
**API Docs (Swagger UI) →** [https://vifems-backend.rumptycloud.app/api-docs](https://vifems-backend.rumptycloud.app/api-docs)

---

## What VifeMS solves

Small businesses — bakeries, repair shops, consultancies, tailors — each have distinct workflows. Generic spreadsheets are fragile; bespoke software is unaffordable. VifeMS sits in between: describe your business once and receive a custom management system with records, forms, search, and financial documents — no code required.

---

## Key features (verified in codebase)

| Feature | Status |
|---|---|
| AI business workspace blueprint generation | Implemented |
| Structured blueprint review and edit before launch | Implemented |
| Dynamic PostgreSQL table provisioning per module | Implemented |
| Schema-driven record CRUD (create, list, view, edit, delete) | Implemented |
| Relation field resolution across modules | Implemented |
| Full-text search and pagination in module tables | Implemented |
| Workspace overview with live record counts | Implemented |
| Email/password registration and login | Implemented |
| Google OAuth 2.0 sign-in | Implemented |
| Password reset via secure email token | Implemented |
| HTTP-only JWT auth cookie (XSS-hardened) | Implemented |
| Invoice creation, status management, PDF download | Implemented |
| Manual payment recording and receipt generation | Implemented |
| Financial audit log | Implemented |
| Rate limiting on AI generation endpoints | Implemented |
| Tenant isolation (workspace-scoped data) | Implemented — integration-tested |
| Real-time payment processor / provider verification | Not implemented |

---

## How VifeMS works

```
1. Describe  ->  User writes a plain-English business description (50-5,000 chars)
2. Generate  ->  VifeAI engine calls an LLM (or deterministic fallback) and returns a
                 structured JSON blueprint (modules, fields, field types, relationships)
3. Review    ->  User inspects the blueprint, renames modules, removes fields, edits types
4. Launch    ->  Backend re-validates the blueprint, creates a Workspace record, and
                 provisions one physical PostgreSQL table per module with typed columns
5. Manage    ->  Schema-driven dashboard renders forms and tables; users create / read /
                 update / delete records through the generated interface
6. Finance   ->  Users create invoices linked to workspace records, record payments,
                 and download PDF invoices and receipts
```

---

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI runtime | React 19 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Animations | GSAP 3, Lenis (smooth scroll) |
| HTTP client | Native fetch via typed lib/api/ clients |
| Hosting | Rumpty Cloud |

---

## Quick start

**Prerequisites:** Node.js >= 18, npm, running VifeMS backend on port 5000.

```bash
# Clone
git clone https://github.com/Viktor-Kode/vifems-web-frontend-.git
cd vifems-web-frontend-

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:5000

# Start development server
npm run dev
```

App runs at **http://localhost:3000**

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Express backend base URL. `http://localhost:5000` for local dev; `https://vifems-backend.rumptycloud.app` in production |

---

## Application routes

| Route | Description |
|---|---|
| `/` | Landing page with product overview |
| `/signup` | Email/password registration |
| `/login` | Email/password login + Google OAuth link |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Consume token and set new password |
| `/onboarding` | Four-stage workspace creation (Describe, Generate, Review, Launch) |
| `/dashboard` | Lists all workspaces owned by the authenticated user |
| `/dashboard/[workspaceId]` | Full workspace dashboard: module list, record CRUD, financial documents |
| `/privacy` | Privacy policy |

---

## Build and quality

```bash
# Lint (ESLint + Next lint rules)
npm run lint

# Type check
npx tsc --noEmit

# Production build — verified clean, 0 errors
npm run build

# Start production server
npm start
```

**Verified:** `npm run build` passes cleanly (Next.js 16.3.8, Turbopack, 10 routes generated, zero TypeScript or lint errors as of 2026-10-24).

---

## Repositories

| Repo | URL |
|---|---|
| Frontend | https://github.com/Viktor-Kode/vifems-web-frontend- |
| Backend | https://github.com/Viktor-Kode/vifems-web-backtend |

---

## Documentation

| Document | Location |
|---|---|
| Technical documentation | docs/TECHNICAL_DOCUMENTATION.md |
| Architecture | docs/ARCHITECTURE.md |
| API reference | docs/API.md |
| Database guide | docs/DATABASE.md |
| Deployment guide | docs/DEPLOYMENT.md |
| User guide | docs/USER_GUIDE.md |
| Contributing | docs/CONTRIBUTING.md |
| Code quality report | docs/CODE_QUALITY_REPORT.md |

---

## Hackathon

Submitted to **Devcenter Hacktober Sprint**. Deployed on **Rumpty Cloud**.

License: ISC
