# Deployment Guide

## Live deployment

| Service | URL |
|---|---|
| Frontend | https://vifems.rumptycloud.app |
| Backend API | https://vifems-backend.rumptycloud.app |
| Swagger UI | https://vifems-backend.rumptycloud.app/api-docs |

Both services are hosted on **Rumpty Cloud**.

---

## Prerequisites

- Rumpty Cloud account with access to the VifeMS project
- PostgreSQL database provisioned on Rumpty Cloud (or external)
- Gmail account with App Password for SMTP
- (Optional) Rumpty Cloud or OpenAI API key for LLM blueprint generation
- (Optional) Google Cloud OAuth credentials for Google login

---

## Frontend deployment

**Repository:** https://github.com/Viktor-Kode/vifems-web-frontend-

**Rumpty Cloud service settings:**

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm start` |
| Node.js version | 18 or newer |

**Environment variables (Rumpty Cloud dashboard):**

```
NEXT_PUBLIC_API_URL=https://vifems-backend.rumptycloud.app
```

**Verify:** Open https://vifems.rumptycloud.app — the landing page should load.

---

## Backend deployment

**Repository:** https://github.com/Viktor-Kode/vifems-web-backtend

**Rumpty Cloud service settings:**

| Setting | Value |
|---|---|
| Build command | `npm install && npx prisma generate` |
| Start command | `node src/server.js` |
| Health check path | `/api/health` |
| Node.js version | 18 or newer |

**Environment variables (Rumpty Cloud dashboard):**

```
DATABASE_URL=postgresql://USER:PASS@HOST:5432/vifems_db?sslmode=require
AUTH_SECRET=<48-char random hex>
CLIENT_URL=https://vifems.rumptycloud.app
NODE_ENV=production
PORT=5000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<gmail address>
SMTP_PASS=<gmail app password>
EMAIL_FROM=VifeMS <noreply@example.com>
PASSWORD_RESET_EXPIRES_MINUTES=30

RUMPTY_API_KEY=<rumpty cloud llm key>
AI_BASE_URL=https://chat.rumptycloud.com/v1
AI_MODEL=llama3.2:3b

BACKEND_URL=https://vifems-backend.rumptycloud.app
```

Optional (add if Google OAuth is needed):
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://vifems-backend.rumptycloud.app/api/auth/google/callback
```

---

## Database migration strategy

**First deployment:**

```bash
npx prisma migrate deploy
npx prisma generate
```

**Subsequent deployments with schema changes:**

1. Test the migration against a staging database first
2. Create a database backup before applying to production
3. Run `npx prisma migrate deploy` as part of the build step
4. Verify the migration applied by checking `npx prisma migrate status`

> Never run `npx prisma migrate dev` in production. It may attempt to create a shadow database and will prompt for interactive input.

---

## Production CORS

The backend CORS configuration allows only the origin specified in `CLIENT_URL`. Confirm the value is set exactly to the frontend origin with no trailing slash:

```
CLIENT_URL=https://vifems.rumptycloud.app
```

---

## Google OAuth in production

If Google login is enabled:

1. Add `https://vifems-backend.rumptycloud.app/api/auth/google/callback` as an **Authorized redirect URI** in Google Cloud Console
2. Set `GOOGLE_CALLBACK_URL` in the backend environment to the same URL
3. Ensure `CLIENT_URL` points to the frontend so the final redirect lands correctly

---

## Deployment verification checklist

- [ ] `GET https://vifems-backend.rumptycloud.app/api/health` returns `{"success":true,...}`
- [ ] `GET https://vifems-backend.rumptycloud.app/api-docs` loads Swagger UI
- [ ] `https://vifems.rumptycloud.app` loads the landing page
- [ ] Registration creates an account and sends a welcome email
- [ ] Onboarding generates a blueprint and provisions a workspace
- [ ] Dashboard lists modules and allows record creation
- [ ] Forgot-password sends a reset email
- [ ] Invoice PDF download works

---

## Logs and troubleshooting

- Check Rumpty Cloud service logs for startup errors
- `SMTP connection failed` at startup — verify `SMTP_PASS` is a Gmail App Password
- `PrismaClientInitializationError` — verify `DATABASE_URL` and run `npx prisma generate`
- CORS errors in browser — verify `CLIENT_URL` matches the frontend origin exactly
- Blueprint generation returns generic result — verify `RUMPTY_API_KEY` or `OPENAI_API_KEY`

---

## Keep-alive

When `NODE_ENV=production` and `BACKEND_URL` is set, the server self-pings `BACKEND_URL/api/health` every 14 minutes to prevent the service from sleeping on free-tier hosting.

---

## Rollback

If a deployment introduces a regression:

1. Revert the Git branch to the previous commit
2. Trigger a new build on Rumpty Cloud
3. If the rollback involves a schema change, restore from the pre-migration database backup — schema rollback is not automatic
