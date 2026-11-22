"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, Mail, Download, AlertTriangle } from "lucide-react";
import { saveBlob, useBeforeAfter, useOverview, useSendTestEmail, useWeeklyEmail } from "@/hooks/api";
import { api } from "@/lib/api/endpoints";
import { Button, Card, ErrorState, PageHeader, ScoreBar, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const views = ["Email preview", "PDF report", "Before & after"] as const;

export default function ReportsPage() {
  const [view, setView] = useState<(typeof views)[number]>(views[0]);
  return (
    <>
      <PageHeader title="Reports" description="Your weekly email, the full audit as a PDF, and what changed after you applied fixes." />
      <div className="mb-6 inline-flex gap-1 rounded-xl bg-ink-900 p-1 ring-1 ring-white/[0.05]" role="tablist">
        {views.map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", view === v ? "bg-ink-700 text-white shadow-lift" : "text-mist-400 hover:text-mist-100")}>{v}</button>
        ))}
      </div>
      {view === "Email preview" ? <EmailView /> : view === "PDF report" ? <PdfView /> : <BeforeAfterView />}
    </>
  );
}

function EmailView() {
  const { data, isLoading, error, refetch } = useWeeklyEmail();
  const send = useSendTestEmail();
  const toast = useToast();
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end"><Button variant="secondary" icon={<Mail className="h-4 w-4" />} loading={send.isPending} onClick={() => send.mutate(undefined, { onSuccess: () => toast("Test email sent to your inbox.") })}>Send test email</Button></div>
      <div className="overflow-hidden rounded-2xl bg-[#f6f7fb] text-[#1a1f2d] shadow-lift">
        <div className="bg-[#10131c] px-8 py-6 text-white"><span className="font-display text-xl font-bold">Kyro</span><span className="ml-3 text-sm text-mist-400">Weekly visibility · {data?.week ?? "…"}</span></div>
        <div className="p-8">
          {isLoading || !data ? <SkeletonText lines={8} /> : (
            <>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl font-extrabold">{data.cvi}</span>
                <span className={cn("inline-flex items-center gap-0.5 text-sm font-bold", data.delta >= 0 ? "text-emerald-600" : "text-rose-600")}>{data.delta >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}{Math.abs(data.delta)} this week</span>
              </div>
              <p className="text-sm text-slate-500">Combined Visibility Index</p>
              <h3 className="mt-8 font-bold">Top 3 actions</h3>
              <ol className="mt-3 space-y-2">{data.actions.map((a, i) => <li key={a.text} className="flex justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm"><span>{i + 1}. {a.text}</span><span className="font-semibold text-emerald-600">+{a.impact}</span></li>)}</ol>
              <h3 className="mt-8 font-bold">Alerts</h3>
              <ul className="mt-3 space-y-2">{data.alerts.map((a) => <li key={a} className="flex gap-2 text-sm text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{a}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PdfView() {
  const ov = useOverview();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-4">
        <h2 className="font-bold text-white">Full audit preview</h2>
        <Button loading={busy} icon={<Download className="h-4 w-4" />} onClick={async () => { setBusy(true); try { saveBlob(await api.downloadPdf(), "kyro-audit.pdf"); } catch { toast("PDF export failed.", "error"); } setBusy(false); }}>Download PDF</Button>
      </div>
      <div className="grid gap-8 p-6 md:grid-cols-2 md:p-10">
        {ov.isLoading || !ov.data ? <><SkeletonCard /><SkeletonCard /></> : (
          <>
            <div>
              <div className="text-sm text-mist-400">Combined Visibility Index</div>
              <div className="font-display text-6xl font-extrabold text-white">{ov.data.cvi}</div>
              <div className="mt-6 space-y-4">{ov.data.subScores.map((s) => <ScoreBar key={s.key} label={s.label} value={s.value} />)}</div>
            </div>
            <div>
              <h3 className="font-semibold text-white">Prioritised action plan</h3>
              <ol className="mt-3 space-y-2.5">{ov.data.priorityActions.map((a, i) => <li key={a.id} className="rounded-xl bg-ink-800/60 p-3.5 text-sm text-mist-300"><b className="text-white">{i + 1}.</b> {a.text}</li>)}</ol>
              <h3 className="mt-6 font-semibold text-white">Competitor comparison</h3>
              <ul className="mt-3 space-y-1.5 text-sm">{ov.data.marketStanding.map((c) => <li key={c.name} className="flex justify-between text-mist-300"><span>{c.name}</span><span className="tabular font-mono">{c.score}</span></li>)}</ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function BeforeAfterView() {
  const { data, isLoading, error, refetch } = useBeforeAfter();
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !data) return <div className="grid gap-5 md:grid-cols-2"><SkeletonCard /><SkeletonCard /><Skeleton className="h-40 md:col-span-2" /></div>;
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Card><h2 className="mb-5 font-bold text-mist-300">Before</h2><div className="space-y-4">{data.before.map((s) => <ScoreBar key={s.key} label={s.label} value={s.value} />)}</div></Card>
        <Card className="border-leaf-400/15"><h2 className="mb-5 font-bold text-white">After</h2><div className="space-y-4">{data.after.map((s, i) => <ScoreBar key={s.key} label={s.label} value={s.value} tone={s.value >= data.before[i].value ? "leaf" : "rose"} />)}</div></Card>
      </div>
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead><tr className="border-b border-white/[0.05] text-left text-xs text-mist-500"><th className="px-5 py-3.5 font-medium">Page</th><th className="px-3 py-3.5 text-right font-medium">Before</th><th className="px-3 py-3.5 text-right font-medium">After</th><th className="px-3 py-3.5 text-right font-medium">Change</th><th className="px-5 py-3.5 font-medium">What changed</th></tr></thead>
            <tbody>
              {data.pages.map((p) => {
                const d = p.after - p.before;
                return (
                  <tr key={p.url} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono text-[13px] text-mist-100">{p.url}</td>
                    <td className="tabular px-3 py-4 text-right text-mist-400">{p.before}</td>
                    <td className="tabular px-3 py-4 text-right text-white">{p.after}</td>
                    <td className={cn("tabular px-3 py-4 text-right font-semibold", d >= 0 ? "text-leaf-400" : "text-rose-400")}>{d >= 0 ? "+" : ""}{d}</td>
                    <td className="px-5 py-4 text-mist-300">{p.changes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
