"""Kyro FastAPI backend — M10 billing/account endpoints.

Payments themselves (Stripe/PayFast checkout + webhooks) live in the Next.js app under /api/billing
and write to the Supabase `subscriptions` table. This service reads that table to serve plans,
account and credits to the frontend.
"""
import os
from datetime import datetime, timezone
from typing import Literal

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

PlanId = Literal["free", "starter", "pro"]

# Prices must match src/lib/billing/plans.ts (same env overrides). Limits: SRS CON-2 pages per crawl;
# other limits are placeholders until the per-plan limits table (SRS Table 3.3) is finalised.
PLANS: list[dict] = [
    {"id": "free", "name": "Free", "price": 0, "limits": {"pages": 20, "crawls": 5, "credits": 5},
     "features": ["20 pages per crawl", "5 crawl jobs per day", "5 rewrite credits / month"]},
    {"id": "starter", "name": "Starter", "price": int(os.environ.get("PRICE_STARTER_USD_CENTS", 1900)) // 100,
     "limits": {"pages": 50, "crawls": 5, "credits": 50},
     "features": ["50 pages per crawl", "5 crawl jobs per day", "50 rewrite credits / month", "Weekly email report"]},
    {"id": "pro", "name": "Pro", "price": int(os.environ.get("PRICE_PRO_USD_CENTS", 4900)) // 100, "highlighted": True,
     "limits": {"pages": 100, "crawls": 5, "credits": 150},
     "features": ["100 pages per crawl", "5 crawl jobs per day", "150 rewrite credits / month", "PDF reports", "Priority support"]},
]
PLAN_BY_ID = {p["id"]: p for p in PLANS}


class Plan(BaseModel):
    id: PlanId
    name: str
    price: int
    features: list[str]
    highlighted: bool = False


class Usage(BaseModel):
    label: str
    used: int
    limit: int


class Account(BaseModel):
    name: str
    email: str
    plan: PlanId
    billingCycle: str
    usage: list[Usage]


class Credits(BaseModel):
    used: int
    total: int
    resetsAt: str


app = FastAPI(title="Kyro API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["*"], allow_headers=["*"])

_sb_headers = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}


async def current_user(authorization: str = Header(default="")) -> dict:
    """Verify the Supabase JWT by asking Supabase Auth who it belongs to."""
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(401, "Not signed in")
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{SUPABASE_URL}/auth/v1/user", headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        raise HTTPException(401, "Invalid or expired session")
    return r.json()


async def subscription_for(user_id: str) -> dict | None:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{SUPABASE_URL}/rest/v1/subscriptions", headers=_sb_headers,
                        params={"user_id": f"eq.{user_id}", "select": "*"})
    r.raise_for_status()
    rows = r.json()
    return rows[0] if rows else None


def effective_plan(sub: dict | None) -> tuple[str, datetime | None]:
    """Plan the user is entitled to right now (expired or canceled -> free)."""
    if not sub or sub.get("status") != "active":
        return "free", None
    end = datetime.fromisoformat(sub["current_period_end"]) if sub.get("current_period_end") else None
    if end and end < datetime.now(timezone.utc):
        return "free", None
    return sub["plan"], end


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/v1/billing/plans", response_model=list[Plan])
def get_plans():
    return PLANS


@app.get("/api/v1/account", response_model=Account)
async def get_account(user: dict = Depends(current_user)):
    sub = await subscription_for(user["id"])
    plan, end = effective_plan(sub)
    limits = PLAN_BY_ID[plan]["limits"]
    if plan == "free":
        cycle = "Free"
    elif sub and sub.get("cancel_at_period_end"):
        cycle = f"Ends {end:%b %d}" if end else "Ending"
    else:
        cycle = f"Monthly · renews {end:%b %d}" if end else "Monthly"
    meta = user.get("user_metadata") or {}
    email = user.get("email", "")
    # Usage ledger (FR-10.3) is not built yet, so `used` is 0 until metered modules write to it.
    return Account(
        name=meta.get("full_name") or email.split("@")[0] or "You",
        email=email,
        plan=plan,
        billingCycle=cycle,
        usage=[
            Usage(label="Pages per crawl", used=0, limit=limits["pages"]),
            Usage(label="Crawl jobs today", used=0, limit=limits["crawls"]),
            Usage(label="Rewrite credits", used=0, limit=limits["credits"]),
        ],
    )


@app.get("/api/v1/billing/credits", response_model=Credits)
async def get_credits(user: dict = Depends(current_user)):
    plan, end = effective_plan(await subscription_for(user["id"]))
    now = datetime.now(timezone.utc)
    resets = end or (now.replace(year=now.year + 1, month=1, day=1) if now.month == 12 else now.replace(month=now.month + 1, day=1))
    return Credits(used=0, total=PLAN_BY_ID[plan]["limits"]["credits"], resetsAt=f"{resets:%b %d}")
