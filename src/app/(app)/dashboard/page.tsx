"use client";
import Link from "next/link";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Zap, Users, CalendarDays, RefreshCw, ArrowUpRight } from "lucide-react";
import { useCrawlJob, useOverview, useStartCrawl } from "@/hooks/api";
import { Badge, Button, Card, ErrorState, PageHeader, ScoreBar, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { Gauge } from "@/components/ui/Gauge";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";

const actionTone = { content: { tone: "iris", label: "Content gap" }, technical: { tone: "ember", label: "Technical" }, offpage: { tone: "leaf", label: "Off-page" } } as const;
const engineName = { chatgpt: "ChatGPT", gemini: "Gemini", perplexity: "Perplexity" };

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useOverview();
  const crawl = useStartCrawl();
  const [jobId, setJobId] = useState<string>();
  const job = useCrawlJob(jobId);
  const toast = useToast();

  const recrawl = () =>
    crawl.mutate(`https://${data?.domain ?? ""}`, {
      onSuccess: (j) => { setJobId(j.id); toast("Crawl queued. We'll refresh your scores when it finishes."); },
      onError: (e) => toast(e.message, "error"),
    });

  return (
    <>
      <PageHeader
        title="Overview"
        description="How AI engines see your brand this week, and the fixes worth doing first."
        actions={
          <Button variant="secondary" onClick={recrawl} loading={crawl.isPending || job.data?.status === "running"} icon={<RefreshCw className="h-4 w-4" />}>
            {job.data?.status === "running" ? `Crawling ${job.data.progress}%` : "Re-crawl site"}
          </Button>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* CVI */}
          {isLoading || !data ? (
            <div className="panel flex flex-col items-center p-7">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
              <Skeleton className="mt-6 h-5 w-48" />
              <div className="mt-8 w-full space-y-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}</div>
            </div>
          ) : (
            <Reveal>
              <TiltCard max={4} className="h-full">
                <Card className="flex h-full flex-col items-center p-7">
                  <Gauge value={data.cvi} size={200} />
                  <h2 className="mt-5 text-lg font-bold text-white">Combined Visibility Index</h2>
                  <p className="text-sm text-mist-400">{data.googlePresenceAvailable ? "Measured mentions + page readiness" : "Google presence unavailable"}</p>
                  <div className="mt-5 flex gap-2">
                    {data.engines.map((e) => (
                      <div key={e.engine} className="rounded-lg bg-ink-800 px-3 py-1.5 text-center">
                        <div className="tabular text-sm font-bold text-white">{e.score ?? "—"}</div>
                        <div className="text-[10px] text-mist-400">{engineName[e.engine]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 w-full space-y-4">
                    {data.subScores.map((s) => <ScoreBar key={s.key} label={s.label} value={s.value} />)}
                  </div>
                </Card>
              </TiltCard>
            </Reveal>
          )}

          {/* trend */}
          {isLoading || !data ? (
            <SkeletonCard lines={8} />
          ) : (
            <Reveal i={1}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Visibility trend</h2>
                    <p className="text-sm text-mist-400">Last 8 weeks</p>
                  </div>
                  <Badge tone="leaf">+{data.cviDelta}%</Badge>
                </div>
                <div className="mt-6 min-h-[260px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend} margin={{ left: -24, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#8286f7" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8286f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,.04)" vertical={false} />
                      <XAxis dataKey="week" stroke="#6f7591" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6f7591" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
                      <Tooltip cursor={{ stroke: "rgba(165,168,255,.3)" }} contentStyle={{ background: "#1a1f2d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#b8bdd3" }} itemStyle={{ color: "#fff" }} />
                      <Area type="monotone" dataKey="score" stroke="#c3c6ff" strokeWidth={2.5} fill="url(#trend)" animationDuration={1400} activeDot={{ r: 5, fill: "#a5a8ff", stroke: "#0b0d14", strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.05] pt-5">
                  {data.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-xs text-mist-400">{s.label}</div>
                      <div className="tabular mt-1 font-display text-2xl font-bold text-white">{s.value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          )}

          {/* lower row */}
          <div className="grid gap-5 md:grid-cols-3 lg:col-span-2">
            {isLoading || !data ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={5} />)
            ) : (
              <>
                <Reveal i={2}>
                  <Card className="h-full">
                    <CardTitle icon={<Zap className="h-4 w-4" />} tone="text-ember-400 bg-ember-500/10">Priority actions</CardTitle>
                    <ul className="space-y-2.5">
                      {data.priorityActions.map((a) => (
                        <li key={a.id} className="group rounded-xl bg-ink-800/70 p-3.5 transition-colors hover:bg-ink-800">
                          <div className="flex items-center justify-between">
                            <Badge tone={actionTone[a.type].tone}>{actionTone[a.type].label}</Badge>
                            <span className="tabular text-xs text-leaf-400">+{a.impact} pts</span>
                          </div>
                          <p className="mt-2 text-sm leading-snug text-mist-100">{a.text}</p>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Reveal>
                <Reveal i={3}>
                  <Card className="h-full">
                    <CardTitle icon={<Users className="h-4 w-4" />} tone="text-iris-300 bg-iris-500/10">Market standing</CardTitle>
                    <ul className="space-y-1">
                      {[...data.marketStanding].sort((a, b) => b.score - a.score).map((c, i) => (
                        <li key={c.name} className={cn("flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm", c.isYou && "bg-iris-500/[0.08]")}>
                          <span className="tabular w-4 text-xs text-mist-500">{i + 1}</span>
                          <span className={cn("flex-1", c.isYou ? "font-semibold text-white" : "text-mist-300")}>{c.name}</span>
                          <span className="tabular font-mono text-[13px] text-mist-100">{c.score.toFixed(1)}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/competitors" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-iris-300 hover:underline">Compare in detail <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                  </Card>
                </Reveal>
                <Reveal i={4}>
                  <Card className="flex h-full flex-col">
                    <CardTitle icon={<CalendarDays className="h-4 w-4" />} tone="text-mist-300 bg-white/[0.05]">This week</CardTitle>
                    <div className="rounded-xl bg-ink-800/70 p-5 text-center">
                      <div className="font-display text-4xl font-extrabold text-white">{data.weekly.headline}</div>
                      <div className="mt-1 text-xs text-mist-400">{data.weekly.headlineLabel}</div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-center text-sm">
                      <div className="rounded-xl bg-ink-800/70 p-3"><div className="text-[11px] text-mist-400">Top gain</div><div className="mt-0.5 font-semibold text-leaf-400">{data.weekly.topGain}</div></div>
                      <div className="rounded-xl bg-ink-800/70 p-3"><div className="text-[11px] text-mist-400">Top loss</div><div className="mt-0.5 font-semibold text-rose-400">{data.weekly.topLoss}</div></div>
                    </div>
                    <Link href="/reports" className="mt-auto pt-4"><Button className="w-full">View full report</Button></Link>
                  </Card>
                </Reveal>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CardTitle({ icon, tone, children }: { icon: React.ReactNode; tone: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={cn("grid h-9 w-9 place-items-center rounded-lg", tone)}>{icon}</span>
      <h2 className="font-bold text-white">{children}</h2>
    </div>
  );
}
