# VifeMS Frontend

AI-Native Business Workspace Generator & Dynamic Management Dashboard.

Next.js 16 (App Router) · React 19 · Tailwind CSS · Lucide React

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start development server
npm run dev
```

App runs at **http://localhost:3000**

---

## Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend Express base URL | `http://localhost:5000` |

---

## Key Flows & Architecture

### 1. Onboarding (`/onboarding`)
- **Describe:** Business description input (50–5000 chars) with client validation and loading states.
- **Generate:** Calls `POST /api/workspaces/generate` via `lib/api/workspace.ts`.
- **Review:** Dynamic blueprint editing (rename/remove modules, modify fields, cascades removal across relationships).
- **Launch:** Submits reviewed blueprint to `POST /api/workspaces/generations/:id/launch`.
- **Redirect:** Redirects to `/dashboard/:workspaceId` with live countdown and fallback button.

### 2. Workspace Dashboard (`/dashboard/[workspaceId]` & `/dashboard`)
- **Authentication:** Validates session via `GET /api/auth/me`. Redirects to `/login` if unauthenticated.
- **Tenant Authorization:** Fetches workspace details from `GET /api/workspaces/:workspaceId`. Displays 403 or 404 on invalid/unauthorized workspace.
- **Overview:** Aggregates real record counts and recent activity via `GET /api/workspaces/:workspaceId/overview`.
- **Dynamic CRUD:** Renders schema-driven entity views supporting:
  - Types: `text`, `long_text`, `number`, `decimal`, `currency`, `boolean`, `date`, `datetime`, `email`, `phone`, `select`, `relation`.
  - Relation resolution: Resolves foreign key IDs into readable names/labels.
  - Search: Parameterized backend search via `?search=`.
  - Modals: Create, View, Edit, and Delete with foreign key cascade protection.

---

## Build & Test

```bash
# Lint check
npm run lint

# Production build
npm run build
```
