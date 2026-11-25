import { admin, appUrl } from "@/lib/billing/server";
import { autoSubmitHtml, getAccessToken, postFields } from "@/lib/billing/payfast";

/** Browser lands here; we fetch a PayFast token and auto-POST the hosted checkout form. */
export async function GET(req: Request) {
  const basket = new URL(req.url).searchParams.get("basket") ?? "";
  const { data: pay } = await admin().from("payments").select("*").eq("id", basket).eq("status", "pending").eq("provider", "payfast").maybeSingle();
  if (!pay) return new Response("Payment not found", { status: 404 });
  const { data: u } = await admin().auth.admin.getUserById(pay.user_id);
  const token = await getAccessToken(basket, pay.amount);
  const { action, fields } = postFields({ token, basketId: basket, amount: pay.amount, email: u.user?.email ?? "", desc: `Kyro ${pay.plan} plan (1 month)`, appUrl: appUrl() });
  return new Response(autoSubmitHtml(action, fields), { headers: { "content-type": "text/html; charset=utf-8" } });
}
