# Database Guide

The backend uses Prisma 5 with PostgreSQL, configured by `DATABASE_URL`. The schema is `vifems-backend/prisma/schema.prisma`. Dynamic business records are stored in physical tables created at runtime; they are not represented as static Prisma models.

## Models and ownership

| Model | Purpose and key relationships |
|---|---|
| `User` | Account identity; owns workspaces and generation drafts; may have password-reset tokens. Email and Google ID are unique. |
| `PasswordResetToken` | SHA-256 token hash, user, expiry, use timestamp. User deletion cascades. |
| `Workspace` | Tenant root owned by one user; owns module metadata and invoices, payments, receipts, and audit logs. |
| `WorkspaceModule` | Dynamic entity metadata: slug, physical table name, JSON field/view/relationship definitions. Unique per workspace and slug. |
| `WorkspaceGeneration` | User-owned blueprint draft and provisioning state; optional link to created workspace. |
| `Invoice` | Workspace-scoped invoice totals, balances, payer/source references, JSON line items and audit relations. Invoice number unique per workspace. |
| `Payment` | Workspace and invoice payment record, status, reference, optional idempotency key. Idempotency key unique per workspace when non-null. |
| `Receipt` | Immutable snapshot for a payment; one receipt per payment; receipt number unique per workspace. |
| `FinancialAuditLog` | Workspace-scoped financial event with optional invoice/payment/receipt relations. |

The Prisma relationships and on-delete behavior are defined in the schema. Dynamic tables include `id`, `workspace_id`, timestamps, JSONB `data`, and typed columns derived from module field metadata. A foreign key links `workspace_id` to the static `workspaces` table with cascade deletion. Relation columns may receive a database foreign key, but provisioning currently logs and continues when that DDL fails; runtime writes separately validate same-workspace targets.

## Constraints and query patterns

The schema defines primary keys, unique user identities, workspace-scoped invoice/receipt numbering, workspace-scoped module slugs, and workspace-scoped idempotency keys. It indexes common workspace and status lookups. Service queries pass workspace and user identifiers to enforce ownership. Dynamic SQL interpolates generated identifiers only after identifier validation; record values are bound parameters.

Some financial and dynamic-table operations warrant additional verification: concurrent payment writes can read the same invoice balance before transactions update it; invoice/receipt sequence generation reads existing rows before choosing a number; and dynamic table provisioning uses compensating cleanup rather than one transaction. Database unique constraints may prevent duplicate numbers but do not by themselves guarantee a retry-safe business operation.

## Migration workflow

1. Review and edit the Prisma schema for an intentional model change.
2. Generate a migration against a disposable local development database with `npx prisma migrate dev --name descriptive_change`.
3. Review generated SQL and test the migration and rollback plan in a non-production environment.
4. Regenerate the client with `npx prisma generate` when needed.
5. Apply production migrations only through the approved release process and with a verified backup/rollback plan.

This audit did not modify the schema or run migrations. Never point integration tests at production: test teardown deletes created records and dynamic tables.
