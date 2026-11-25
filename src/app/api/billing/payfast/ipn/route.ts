import { NextResponse } from "next/server";
import { markFailed, markPaid } from "@/lib/billing/server";
import { verifyIpn } from "@/lib/billing/payfast";

/** PayFast server-to-server notification. Hash checked before anything changes. */
async function handle(params: URLSearchParams) {
  if (!verifyIpn(params)) return NextResponse.json({ detail: "Invalid hash" }, { status: 400 });
  const basket = params.get("basket_id")!;
  if (params.get("err_code") === "000") await markPaid(basket, { provider_ref: params.get("transaction_id") ?? undefined });
  else await markFailed(basket, params.get("err_msg") ?? "failed");
  return NextResponse.json({ ok: true });
}

export const GET = (req: Request) => handle(new URL(req.url).searchParams);
export const POST = async (req: Request) => handle(new URLSearchParams(await req.text()));
