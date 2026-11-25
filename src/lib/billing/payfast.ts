import "server-only";
import { createHash, randomBytes } from "crypto";

/**
 * PayFast Pakistan (APPS / gopayfast.com) hosted checkout.
 * Flow: server gets ACCESS_TOKEN -> browser form-POSTs to PostTransaction -> PayFast calls our IPN (CHECKOUT_URL).
 * With no PAYFAST_MERCHANT_ID set we run the documented stub (SRS CON-3).
 */
const base = () => process.env.PAYFAST_BASE_URL?.replace(/\/$/, "") || "https://ipguat.apps.net.pk/Ecommerce/api/Transaction";
const merchantId = () => process.env.PAYFAST_MERCHANT_ID ?? "";
const securedKey = () => process.env.PAYFAST_SECURED_KEY ?? "";

export const payfastEnabled = () => !!merchantId() && !!securedKey();
export const payfastStubAllowed = () => process.env.PAYFAST_STUB === "true" || process.env.NODE_ENV !== "production";

export async function getAccessToken(basketId: string, amount: number) {
  const body = new URLSearchParams({
    MERCHANT_ID: merchantId(), SECURED_KEY: securedKey(), BASKET_ID: basketId,
    TXNAMT: String(amount), CURRENCY_CODE: "PKR",
  });
  const res = await fetch(`${base()}/GetAccessToken`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ACCESS_TOKEN) throw new Error("PayFast token request failed");
  return data.ACCESS_TOKEN as string;
}

export function postFields(o: { token: string; basketId: string; amount: number; email: string; desc: string; appUrl: string }) {
  return {
    action: `${base()}/PostTransaction`,
    fields: {
      MERCHANT_ID: merchantId(), MERCHANT_NAME: process.env.PAYFAST_MERCHANT_NAME ?? "Kyro", TOKEN: o.token,
      PROCCODE: "00", TXNAMT: String(o.amount), CURRENCY_CODE: "PKR", BASKET_ID: o.basketId,
      ORDER_DATE: new Date().toISOString().slice(0, 19).replace("T", " "),
      CUSTOMER_EMAIL_ADDRESS: o.email, CUSTOMER_MOBILE_NO: "", TXNDESC: o.desc, VERSION: "KYRO-1.0",
      SIGNATURE: randomBytes(16).toString("hex"),
      SUCCESS_URL: `${o.appUrl}/account?payment=success`,
      FAILURE_URL: `${o.appUrl}/account?payment=failed`,
      CHECKOUT_URL: `${o.appUrl}/api/billing/payfast/ipn`,
    },
  };
}

/** IPN check: validation_hash = sha256(basket_id|secured_key|merchant_id|err_code). */
export function verifyIpn(p: URLSearchParams) {
  const got = p.get("validation_hash")?.toLowerCase();
  const expected = createHash("sha256")
    .update([p.get("basket_id"), securedKey(), merchantId(), p.get("err_code")].join("|"))
    .digest("hex");
  return !!got && payfastEnabled() && got === expected;
}

export function autoSubmitHtml(action: string, fields: Record<string, string>) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const inputs = Object.entries(fields).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("");
  return `<!doctype html><title>Redirecting to PayFast</title><body style="font-family:sans-serif;background:#0b0b12;color:#ccc;display:grid;place-items:center;height:100vh">
<form id="f" method="POST" action="${esc(action)}">${inputs}<noscript><button>Continue to PayFast</button></noscript></form>
<p>Redirecting to PayFast...</p><script>document.getElementById("f").submit()</script></body>`;
}
