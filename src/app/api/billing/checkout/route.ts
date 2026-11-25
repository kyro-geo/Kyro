import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { PAID_PLANS, isPaidPlan, type Provider } from "@/lib/billing/plans";
import { admin, appUrl, recordPayment, stripe, userFromRequest } from "@/lib/billing/server";
import { payfastEnabled, payfastStubAllowed } from "@/lib/billing/payfast";

/** POST { plan, provider } -> { url }. "free" cancels at period end instead of charging. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ detail: "Not signed in" }, { status: 401 });
  const { plan, provider = "stripe" } = (await req.json().catch(() => ({}))) as { plan?: string; provider?: Provider };

  if (plan === "free") {
    const { data: sub } = await admin().from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
    if (sub?.stripe_subscription_id) await stripe().subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
    if (sub) await admin().from("subscriptions").update({ cancel_at_period_end: true }).eq("user_id", user.id);
    return NextResponse.json({ url: "", detail: "Your plan switches to Free at the end of the current period." });
  }
  if (!isPaidPlan(plan)) return NextResponse.json({ detail: "Unknown plan" }, { status: 400 });
  const price = PAID_PLANS[plan];
  const paymentId = randomUUID();

  if (provider === "stripe") {
    await recordPayment({ id: paymentId, user_id: user.id, provider, plan, amount: price.usdCents, currency: "usd" });
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: paymentId,
      metadata: { paymentId, userId: user.id, plan },
      subscription_data: { metadata: { userId: user.id, plan } },
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: price.usdCents, recurring: { interval: "month" }, product_data: { name: price.name } } }],
      success_url: `${appUrl()}/account?payment=success`,
      cancel_url: `${appUrl()}/account?payment=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  }

  if (provider === "payfast") {
    if (!payfastEnabled() && !payfastStubAllowed()) return NextResponse.json({ detail: "PayFast is not available yet" }, { status: 503 });
    await recordPayment({ id: paymentId, user_id: user.id, provider, plan, amount: price.pkr, currency: "pkr" });
    const path = payfastEnabled() ? "start" : "stub";
    return NextResponse.json({ url: `${appUrl()}/api/billing/payfast/${path}?basket=${paymentId}` });
  }
  return NextResponse.json({ detail: "Unknown provider" }, { status: 400 });
}
