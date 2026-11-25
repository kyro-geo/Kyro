import "server-only";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { PlanId } from "@/lib/api/types";
import type { Provider } from "./plans";

const env = (k: string) => process.env[k] ?? "";

/** Service-role client: bypasses RLS, server only. */
export const admin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

export const stripe = () => new Stripe(env("STRIPE_SECRET_KEY"));

export const appUrl = () => env("APP_URL").replace(/\/$/, "") || "http://localhost:3000";

/** Resolve the Supabase user from the request's Bearer token. */
export async function userFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user;
}

/** Ledger row for every payment attempt. Status: pending -> paid | failed. */
export async function recordPayment(row: { id: string; user_id: string; provider: Provider; plan: PlanId; amount: number; currency: string }) {
  const { error } = await admin().from("payments").insert({ ...row, status: "pending" });
  if (error) throw error;
}

/** Only called after a verified webhook/IPN. Idempotent: a payment is applied once. */
export async function markPaid(paymentId: string, extra: { stripe_customer_id?: string; stripe_subscription_id?: string; provider_ref?: string } = {}) {
  const db = admin();
  const { data: pay } = await db.from("payments").update({ status: "paid", provider_ref: extra.provider_ref ?? null })
    .eq("id", paymentId).eq("status", "pending").select().maybeSingle();
  if (!pay) return; // unknown or already applied
  await db.from("subscriptions").upsert({
    user_id: pay.user_id, plan: pay.plan, provider: pay.provider, status: "active",
    current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(), cancel_at_period_end: false,
    ...(extra.stripe_customer_id && { stripe_customer_id: extra.stripe_customer_id }),
    ...(extra.stripe_subscription_id && { stripe_subscription_id: extra.stripe_subscription_id }),
    updated_at: new Date().toISOString(),
  });
}

export async function markFailed(paymentId: string, reason: string) {
  await admin().from("payments").update({ status: "failed", provider_ref: reason }).eq("id", paymentId).eq("status", "pending");
}
