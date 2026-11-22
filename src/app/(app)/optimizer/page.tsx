"use client";
import { useEffect, useState } from "react";
import { Download, Copy } from "lucide-react";
import { saveBlob, useOptimizedPage, usePages } from "@/hooks/api";
import { api } from "@/lib/api/endpoints";
import { Button, Card, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { CreditMeter } from "@/components/ui/CreditMeter";
import { useToast } from "@/components/ui/Toast";
import type { Highlight } from "@/lib/api/types";

const tabs = ["Generated FAQs", "Heading improvements", "Schema markup"] as const;

function Rendered({ parts }: { parts: Highlight[] }) {
  return (
    <div className="whitespace-pre-wrap text-[14px] leading-7 text-mist-300">
      {parts.map((p, i) => (
        <span key={i} className={cn(p.kind === "problem" && "rounded bg-rose-500/15 text-rose-400 decoration-rose-400/50 underline decoration-wavy underline-offset-4", p.kind === "fix" && "rounded bg-leaf-500/15 text-leaf-400")}>{p.text}</span>
      ))}
    </div>
  );
}

export default function OptimizerPage() {
  const pages = usePages();
  const [pageId, setPageId] = useState<string>();
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [exporting, setExporting] = useState(false);
  const opt = useOptimizedPage(pageId);
  const toast = useToast();

  useEffect(() => { if (!pageId && pages.data?.[0]) setPageId(pages.data[0].id); }, [pages.data, pageId]);

  return (
    <>
      <PageHeader
        title="Content optimizer"
        description="Weak passages on the left, the rewrite on the right. Every number in a rewrite is checked against your own pages."
        actions={<><CreditMeter /><Button variant="secondary" loading={exporting} icon={<Download className="h-4 w-4" />} onClick={async () => { setExporting(true); try { saveBlob(await api.exportOptimizer(), "kyro-optimizer-export.zip"); } catch { toast("Export failed. Nothing was downloaded.", "error"); } setExporting(false); }}>Export all</Button></>}
      />
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-3">
          <div className="px-2 pb-2 pt-1 text-xs font-semibold text-mist-500">Pages by potential gain</div>
          {pages.isLoading ? <div className="space-y-2 p-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : pages.error ? <ErrorState error={pages.error} onRetry={pages.refetch} /> : (
            <ul className="space-y-1">
              {pages.data?.map((p) => (
                <li key={p.id}>
                  <button onClick={() => setPageId(p.id)} className={cn("w-full rounded-xl px-3 py-2.5 text-left transition-colors", pageId === p.id ? "bg-iris-500/[0.12] ring-1 ring-inset ring-iris-400/20" : "hover:bg-white/[0.03]")}>
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-mist-100">{p.title}</span>
                      <span className="tabular text-xs text-leaf-400">+{p.potentialGain}</span>
                    </div>
                    <div className="truncate font-mono text-[11px] text-mist-500">{p.url} · {p.score}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="min-w-0 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {(["Original", "Improved"] as const).map((side) => (
              <Card key={side} className={cn(side === "Improved" && "border-leaf-400/15")}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-white">{side}</h2>
                  <span className={cn("flex items-center gap-1.5 text-xs", side === "Original" ? "text-rose-400" : "text-leaf-400")}>
                    <span className={cn("h-2 w-2 rounded-full", side === "Original" ? "bg-rose-400" : "bg-leaf-400")} />{side === "Original" ? "Problem areas" : "Changes"}
                  </span>
                </div>
                {opt.isLoading || !opt.data ? <SkeletonText lines={6} /> : <Rendered parts={side === "Original" ? opt.data.original : opt.data.improved} />}
              </Card>
            ))}
          </div>

          <Card>
            <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-ink-850 p-1" role="tablist">
              {tabs.map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all", tab === t ? "bg-ink-700 text-white shadow-lift" : "text-mist-400 hover:text-mist-100")}>{t}</button>
              ))}
            </div>
            {opt.isLoading || !opt.data ? <SkeletonText lines={5} /> : tab === "Generated FAQs" ? (
              <dl className="space-y-4">{opt.data.faqs.map((f) => <div key={f.q} className="rounded-xl bg-ink-800/60 p-4"><dt className="font-semibold text-white">{f.q}</dt><dd className="mt-1.5 text-sm text-mist-300">{f.a}</dd></div>)}</dl>
            ) : tab === "Heading improvements" ? (
              <ul className="space-y-3">{opt.data.headings.map((h) => <li key={h.before} className="grid gap-2 rounded-xl bg-ink-800/60 p-4 text-sm sm:grid-cols-2"><span className="text-rose-400 line-through decoration-rose-400/40">{h.before}</span><span className="text-leaf-400">{h.after}</span></li>)}</ul>
            ) : (
              <div className="relative">
                <Button size="sm" variant="secondary" className="absolute right-3 top-3" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => { navigator.clipboard.writeText(opt.data!.schema); toast("JSON-LD copied."); }}>Copy</Button>
                <pre className="overflow-x-auto rounded-xl bg-ink-950 p-5 font-mono text-[12.5px] leading-6 text-iris-300">{opt.data.schema}</pre>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
