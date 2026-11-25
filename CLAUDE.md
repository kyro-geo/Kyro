# Kyro — FYP (BSSE) project notes

Generative engine optimization platform. Spec: `KYRO-SRS_SDS-BSSE-Fyp-II_v1_14.docx` (modules M1–M10). The design in commit bd825b1 is the final look — integrate data into it, don't restyle.

## Stack
- **Frontend**: Next.js 14 App Router + Tailwind + React Query (repo root). Every data call goes through `src/lib/api/{client,endpoints,types}.ts` → FastAPI at `NEXT_PUBLIC_API_URL`.
- **Auth**: Supabase Auth only (`src/lib/supabase.ts`, `src/hooks/useAuth.ts`). The JWT is sent as `Authorization: Bearer`.
- **Backend**: FastAPI in `backend/main.py`. It checks the JWT by calling Supabase `/auth/v1/user` and reads tables over Supabase REST with the service role key.
- **Payments**: Next.js route handlers in `src/app/api/billing/*`, not FastAPI.

## Run locally
- `.env.local` (frontend) and `backend/.env` (API): see the matching `.env.example` files.
- `.claude/launch.json` has `kyro` (port 3000) and `kyro-api` (port 8000, uvicorn from `backend/.venv`).
- First-time API setup: `cd backend; python -m venv .venv; .venv\Scripts\pip install -r requirements.txt`.

## Status (as of 2026-11-26)
**Done**
- Frontend UI for all modules; mock data removed (commit e48b2d2).
- Supabase login: email/password, Google OAuth, reset (e48b2d2).
- **M10 payments** (commit 05dd56e), tested locally end to end:
  - `POST /api/billing/checkout {plan, provider}`: Stripe Checkout (USD subscription) or PayFast (PKR). `plan:"free"` cancels at period end.
  - `/api/billing/stripe/webhook`: the plan changes only after a verified signature; a bad signature gets 400 (FR-10.5). Idempotent.
  - PayFast Pakistan (gopayfast/APPS) `start` + `ipn` (hash = sha256(basket_id|secured_key|merchant_id|err_code)). Field names are written from memory and **not verified** against PayFast docs. With no merchant keys, the **documented stub** `/api/billing/payfast/stub` is used (SRS CON-3; dev only, or `PAYFAST_STUB=true`).
  - `supabase/billing.sql`: `subscriptions` + `payments` ledger, RLS, and explicit GRANTs. This Supabase project needs those GRANTs, because tables created in SQL don't get them automatically. Already run on the project.
  - Prices are in `src/lib/billing/plans.ts` (Starter $19 / PKR 5000, Pro $49 / PKR 13500). These are placeholders, because the SRS gives no prices.
  - Stripe is in test mode. Keys are set locally and on Vercel; the Stripe dashboard webhook points at the Vercel URL.
- **FastAPI backend** (`backend/`): `GET /health`, `GET /api/v1/billing/plans` (public), `GET /api/v1/account`, `GET /api/v1/billing/credits`. Plan comes from the `subscriptions` table (expired or canceled → free). Tested locally; the landing page pricing renders from it.

**Not done / open**
- FastAPI is not deployed yet. Deploy it as a 2nd Vercel project (Root Directory `backend`, env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`), then set `NEXT_PUBLIC_API_URL` on the frontend project.
- No real card payment through the deployed site has been tested yet.
- Usage ledger (FR-10.3 / FR-10.7 atomic credit reservation) is not built: `used` is always 0. Per-plan limits other than pages per crawl are placeholders.
- PayFast has no recurring billing (each payment covers 30 days) and no renewal job.
- All other FastAPI routes in `src/lib/api/endpoints.ts` (M1–M9: crawl, dashboard, queries, competitors, optimizer, articles, programmatic, offpage, reports) don't exist yet.

## Conventions
- Never add Claude attribution (Co-Authored-By) to commits or PRs.
- Errors from FastAPI: `{"detail": "...", "code": "optional"}`; 402 = plan limit, 429 = daily limit.
- Never trust prices or plan changes from the client. Only webhooks or IPN with a verified signature change plans.
