# Contributing

## Project organization

The frontend and backend are separate applications and separate Git repositories. Keep HTTP concerns in backend controllers/routes, business and persistence logic in services, and shared cross-cutting behavior in middleware/config. Keep Next.js route composition in `app/`, reusable UI in `components/`, and API transport in `lib/api/`. Preserve the AI blueprint and metadata-driven dynamic workspace flow.

## Style and naming

- Follow the surrounding JavaScript, TypeScript, React, and CSS conventions in the touched module.
- Use descriptive names for business concepts and user/workspace identifiers.
- Keep functions focused; extract a helper when it clarifies reusable behavior, not just to reduce line count.
- Add comments for business rules, security boundaries, transaction guarantees, and non-obvious framework/database behavior. Avoid comments that restate code.
- Add JSDoc for exported JavaScript APIs when parameters, return values, errors, or side effects are not obvious.
- Do not migrate the backend from JavaScript or replace the established framework/database/authentication choices without an approved, concrete need.

## Security and data changes

- Validate untrusted input on the server.
- Scope workspace and business record reads/writes to the authenticated owner and workspace.
- Bind SQL values as parameters. Validate identifiers before dynamic SQL interpolation.
- Keep secrets in ignored local environment files or deployment secret stores; edit only placeholder examples in source control.
- Preserve the distinction between invoices, manually recorded payments, provider-verified payments, and receipts.
- Review Prisma migrations and SQL before applying them. Never use a production database for local development or tests.

## Checks

Backend: `npm test` (requires a disposable PostgreSQL database), `npm run db:generate`, and appropriate focused checks. Frontend: `npm run lint` and `npm run build`. The repository does not currently define frontend unit-test or typecheck scripts. Run only commands appropriate to the change and report skipped checks with the reason. Do not hide or weaken failing assertions.

## Pull requests

Describe the user-visible effect, the implementation boundaries, tests/checks run and their results, database/API implications, and any known limitations. Keep changes focused, preserve unrelated work in the other application, and include docs for changes to APIs, setup, data ownership, or business behavior.
