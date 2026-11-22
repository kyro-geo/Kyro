"use client";
import { useRouter } from "next/navigation";
import { Check, LogOut, AlertTriangle } from "lucide-react";
import { useAccount, useCheckout, usePlans } from "@/hooks/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button, Card, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { TiltCard } from "@/components/ui/TiltCard";
import { useToast } from "@/components/ui/Toast";

export default function AccountPage() {
  const acc = useAccount();
  const plans = usePlans();
  const checkout = useCheckout();
  const auth = useAuth();
  const router = useRouter();
  const toast = useToast();
  const nearLimit = acc.data?.usage.some((u) => u.used / u.limit >= 0.9);

  return (
    <>
      <PageHeader title="Account" description="Your plan, usage this cycle and billing." actions={<Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={async () => { await auth.signOut(); router.push("/"); }}>Sign out</Button>} />
      {acc.error ? <ErrorState error={acc.error} onRetry={acc.refetch} /> : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
          {acc.isLoading || !acc.data ? <SkeletonCard lines={6} /> : (
            <Card>
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-iris-400 font-display text-lg font-bold text-ink-950">{acc.data.name[0]}</div>
                <div><div className="font-semibold text-white">{acc.data.name}</div><div className="text-sm text-mist-400">{acc.data.email}</div></div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-ink-800/60 p-4">
                <div><div className="text-xs text-mist-400">Current plan</div><div className="font-semibold capitalize text-white">{acc.data.plan}</div></div>
                <Badge tone="iris">{acc.data.billingCycle}</Badge>
              </div>
              <div className="mt-6 space-y-4">
                {acc.data.usage.map((u) => {
                  const pct = (u.used / u.limit) * 100;
                  return (
                    <div key={u.label}>
                      <div className="mb-1.5 flex justify-between text-sm"><span className="text-mist-300">{u.label}</span><span className="tabular text-mist-100">{u.used} / {u.limit}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className={cn("h-full rounded-full", pct >= 90 ? "bg-ember-400" : "bg-iris-400")} style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              {nearLimit && <p className="mt-5 flex gap-2 rounded-xl bg-ember-500/10 p-3.5 text-sm text-ember-400"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />You&apos;re close to a limit. Upgrade to keep tracking without interruptions.</p>}
            </Card>
          )}

          <div className="grid gap-5 sm:grid-cols-3">
            {plans.isLoading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />) : plans.data?.map((p) => {
              const current = p.id === acc.data?.plan;
              return (
                <TiltCard key={p.id} max={5}>
                  <Card className={cn("flex h-full flex-col", current && "border-iris-400/40")}>
                    <div className="flex items-center justify-between"><h3 className="font-semibold text-white">{p.name}</h3>{current && <Badge tone="iris">Current</Badge>}</div>
                    <div className="mt-3"><span className="font-display text-3xl font-extrabold text-white">${p.price}</span><span className="text-sm text-mist-400">/mo</span></div>
                    <ul className="mt-5 flex-1 space-y-2 text-[13px] text-mist-300">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-iris-300" />{f}</li>)}</ul>
                    <Button className="mt-6 w-full" variant={current ? "secondary" : "primary"} disabled={current} loading={checkout.isPending && checkout.variables === p.id}
                      onClick={() => checkout.mutate(p.id, { onSuccess: (r) => { toast(`Switching to ${p.name}…`); if (r.url.startsWith("http")) location.href = r.url; } })}>
                      {current ? "Your plan" : (acc.data && plans.data.findIndex((x) => x.id === acc.data!.plan) > plans.data.indexOf(p)) ? "Downgrade" : "Upgrade"}
                    </Button>
                  </Card>
                </TiltCard>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
