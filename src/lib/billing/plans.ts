import type { PlanId } from "@/lib/api/types";

/** Server-side source of truth for what each paid plan costs. Never trust a price from the client. */
export const PAID_PLANS: Record<Exclude<PlanId, "free">, { name: string; usdCents: number; pkr: number }> = {
  starter: { name: "Kyro Starter", usdCents: Number(process.env.PRICE_STARTER_USD_CENTS ?? 1900), pkr: Number(process.env.PRICE_STARTER_PKR ?? 5000) },
  pro: { name: "Kyro Pro", usdCents: Number(process.env.PRICE_PRO_USD_CENTS ?? 4900), pkr: Number(process.env.PRICE_PRO_PKR ?? 13500) },
};

export type Provider = "stripe" | "payfast";
export const isPaidPlan = (p: unknown): p is keyof typeof PAID_PLANS => p === "starter" || p === "pro";
