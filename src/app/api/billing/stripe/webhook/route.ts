import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { admin, markFailed, markPaid, stripe } from "@/lib/billing/server";

/** Plan changes ONLY here, after the signature is verified (FR-10.5). Bad signature -> 400. */
export async function POST(req: Request) {
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ detail: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.payment_status === "paid" && s.client_reference_id)
        await markPaid(s.client_reference_id, { stripe_customer_id: String(s.customer), stripe_subscription_id: String(s.subscription), provider_ref: s.id });
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      if (event.data.object.client_reference_id) await markFailed(event.data.object.client_reference_id, event.type);
      break;
    case "customer.subscription.deleted":
      await admin().from("subscriptions").update({ plan: "free", status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", event.data.object.id);
      break;
  }
  return NextResponse.json({ received: true });
}
