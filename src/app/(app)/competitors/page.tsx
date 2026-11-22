"use client";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BellRing, Plus, ShieldCheck, ShieldAlert, ShieldX, Check } from "lucide-react";
import { useAddCompetitor, useAddGapToPlan, useCompetitors } from "@/hooks/api";
import { Badge, Button, Card, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { SkeletonCard, SkeletonRows } from "@/components/ui/Skeleton";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

const robots = {
  crawlable: { icon: ShieldCheck, text: "Fully crawlable", cls: "text-leaf-400" },
  partial: { icon: ShieldAlert, text: "Partly blocked", cls: "text-ember-400" },
  blocked: { icon: ShieldX, text: "Blocked by robots.txt", cls: "text-rose-400" },
};
const short = ["Content", "Semantic", "Entity", "FAQ", "Citation"];

export default function CompetitorsPage() {
  const { data, isLoading, error, refetch } = useCompetitors();
  const addComp = useAddCompetitor();
  const addGap = useAddGapToPlan();
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [planned, setPlanned] = useState<Set<string>>(new Set());

  return (
    <>
      <PageHeader
        title="Competitors"
        description="Your Combined Visibility Index next to up to five rivals, and the content gaps that separate you."
        actions={data && data.newPagesDetected > 0 && <Badge tone="ember" className="py-1.5 text-xs"><BellRing className="h-3.5 w-3.5" />{data.newPagesDetected} new competitor pages this week</Badge>}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!url.trim()) return;
          addComp.mutate(url, {
            onSuccess: () => { toast("Competitor added. First crawl starts shortly."); setUrl(""); },
            onError: (e) => toast(e instanceof ApiError && e.isPlanLimit ? "Your plan's competitor limit is reached. Upgrade to add more." : e.message, "error"),
          });
        }}
        className="mb-6 flex max-w-xl gap-2.5"
      >
        <label htmlFor="comp-url" className="sr-only">Competitor website</label>
        <input id="comp-url" value={url} onChange={(e) => setUrl(e.target.value)} className="field" placeholder="competitor.com" />
        <Button type="submit" variant="secondary" loading={addComp.isPending} icon={<Plus className="h-4 w-4" />}>Add</Button>
      </form>

      {error ? <ErrorState error={error} onRetry={refetch} /> : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading || !data ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={7} />) : data.competitors.map((c, i) => {
              const R = robots[c.robots];
              return (
                <Reveal key={c.id} i={i}>
                  <TiltCard max={6} className="h-full">
                    <Card className={cn("h-full", c.isYou && "border-iris-400/30 bg-gradient-to-b from-iris-600/[0.1] to-ink-900")}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white">{c.name}</h3>
                          <p className="text-xs text-mist-500">{c.domain}</p>
                        </div>
                        <div className={cn("grid h-12 w-12 place-items-center rounded-xl font-display text-lg font-extrabold", c.cvi === null ? "bg-white/[0.04] text-mist-500" : "bg-iris-400 text-ink-950")}>{c.cvi ?? "—"}</div>
                      </div>
                      {c.status === "not_available" ? (
                        <p className="mt-8 rounded-xl bg-white/[0.03] p-4 text-sm text-mist-400">Crawl not available. The site blocks crawlers, so no score is shown instead of a misleading zero.</p>
                      ) : (
                        <>
                          <div className="mt-5 h-28">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={c.subScores.map((s, j) => ({ name: short[j], v: s.value }))}>
                                <XAxis dataKey="name" fontSize={9} stroke="#6f7591" tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: "rgba(255,255,255,.03)" }} contentStyle={{ background: "#1a1f2d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, fontSize: 12 }} />
                                <Bar dataKey="v" fill={c.isYou ? "#a5a8ff" : "#4d4fc4"} radius={[4, 4, 0, 0]} animationDuration={1100} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-4 text-xs font-semibold text-mist-500">Top gaps</div>
                          <ul className="mt-2 space-y-1.5 text-[13px] text-mist-300">{c.gaps.map((g) => <li key={g} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mist-500" />{g}</li>)}</ul>
                        </>
                      )}
                      <div className={cn("mt-5 flex items-center gap-1.5 border-t border-white/[0.05] pt-4 text-xs", R.cls)}><R.icon className="h-3.5 w-3.5" />{R.text}</div>
                    </Card>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>

          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-bold text-white">Gaps ranked by score gain</h2>
            {isLoading || !data ? <SkeletonRows rows={4} /> : (
              <ul className="divide-y divide-white/[0.04]">
                {data.gaps.map((g, i) => {
                  const inPlan = g.inPlan || planned.has(g.id);
                  return (
                    <li key={g.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
                      <span className="tabular w-6 text-sm text-mist-500">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm text-mist-100">{g.title}</p>
                        <p className="text-xs text-mist-500">Covered by {g.competitor}</p>
                      </div>
                      <span className="tabular w-20 text-sm font-semibold text-leaf-400">+{g.impact} pts</span>
                      <Button size="sm" variant={inPlan ? "ghost" : "secondary"} disabled={inPlan} loading={addGap.isPending && addGap.variables === g.id} icon={inPlan ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        onClick={() => addGap.mutate(g.id, { onSuccess: () => { setPlanned(new Set(planned).add(g.id)); toast("Added to your plan."); } })}>
                        {inPlan ? "In plan" : "Add to plan"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </>
  );
}
