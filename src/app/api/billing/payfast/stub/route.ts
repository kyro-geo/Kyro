import { NextResponse } from "next/server";
import { appUrl, markFailed, markPaid } from "@/lib/billing/server";
import { payfastEnabled, payfastStubAllowed } from "@/lib/billing/payfast";

/**
 * Documented PayFast stub (SRS CON-3 / D-10): used only while no sandbox merchant keys exist.
 * GET shows a fake hosted page; POST simulates the IPN result. Disabled when real keys are set or in production.
 */
const blocked = () => payfastEnabled() || !payfastStubAllowed();

export async function GET(req: Request) {
  if (blocked()) return new Response("Not found", { status: 404 });
  const basket = (new URL(req.url).searchParams.get("basket") ?? "").replace(/[^\w-]/g, "");
  const btn = (r: string, label: string, bg: string) =>
    `<form method="POST" style="display:inline"><input type="hidden" name="basket" value="${basket}"><input type="hidden" name="result" value="${r}"><button style="padding:10px 18px;border:0;border-radius:8px;background:${bg};color:#fff;margin:4px;cursor:pointer">${label}</button></form>`;
  return new Response(`<!doctype html><title>PayFast (stub)</title><body style="font-family:sans-serif;background:#0b0b12;color:#ddd;display:grid;place-items:center;height:100vh"><div style="text-align:center">
<h2>PayFast sandbox stub</h2><p style="color:#999">No PayFast merchant keys configured. Simulate the payment result:</p>
${btn("success", "Simulate success", "#16a34a")}${btn("fail", "Simulate failure", "#dc2626")}</div></body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function POST(req: Request) {
  if (blocked()) return new Response("Not found", { status: 404 });
  const form = await req.formData();
  const basket = String(form.get("basket"));
  const ok = form.get("result") === "success";
  if (ok) await markPaid(basket, { provider_ref: "stub" }); else await markFailed(basket, "stub failure");
  return NextResponse.redirect(`${appUrl()}/account?payment=${ok ? "success" : "failed"}`, 303);
}
