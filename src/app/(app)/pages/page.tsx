"use client";
import { useMemo, useState } from "react";
import { Upload, Wand2, Download, Rocket, Layers, Plus, Trash2 } from "lucide-react";
import { useGenerateTemplate, usePatterns, useStartBatch } from "@/hooks/api";
import { Button, Card, EmptyState, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { CreditMeter } from "@/components/ui/CreditMeter";
import { useToast } from "@/components/ui/Toast";

const fill = (tpl: string, row: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k) => row[k] || `{${k}}`);

export default function PageBuilder() {
  const patterns = usePatterns();
  const tpl = useGenerateTemplate();
  const batch = useStartBatch();
  const toast = useToast();
  const [active, setActive] = useState<string>();
  const [rows, setRows] = useState<Record<string, string>[]>([{ service: "GEO agency", city: "Lahore" }, { service: "GEO agency", city: "Karachi" }]);

  const vars = tpl.data?.variables ?? [];
  const preview = useMemo(() => (tpl.data ? fill(tpl.data.template, rows[0] ?? {}) : ""), [tpl.data, rows]);

  const onCsv = async (file: File) => {
    const [head, ...lines] = (await file.text()).trim().split(/\r?\n/);
    const cols = head.split(",").map((c) => c.trim());
    setRows(lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v.trim()]))));
    toast(`Loaded ${lines.length} rows from ${file.name}`);
  };

  return (
    <>
      <PageHeader title="Page builder" description="Turn recurring query patterns into a template, fill it with your data, and generate pages in one batch." actions={<CreditMeter />} />
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="h-fit">
          <h2 className="mb-4 font-bold text-white">Query patterns</h2>
          {patterns.isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
            : patterns.error ? <ErrorState error={patterns.error} onRetry={patterns.refetch} /> : (
            <ul className="space-y-3">
              {patterns.data?.map((p) => (
                <li key={p.id} className={cn("rounded-xl border p-4 transition-colors", active === p.id ? "border-iris-400/30 bg-iris-500/[0.07]" : "border-white/[0.05] bg-ink-800/50")}>
                  <div className="flex justify-between gap-2"><code className="font-mono text-[13px] text-iris-300">{p.pattern}</code><span className="tabular text-xs text-leaf-400">+{p.impact}</span></div>
                  <p className="mt-1.5 text-xs text-mist-500">{p.examples.join(" · ")}</p>
                  <Button size="sm" variant="secondary" className="mt-3" loading={tpl.isPending && active === p.id} icon={<Wand2 className="h-3.5 w-3.5" />} onClick={() => { setActive(p.id); tpl.mutate(p.id); }}>Generate template</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="min-w-0">
          <h2 className="mb-4 font-bold text-white">Template & data</h2>
          {tpl.isPending ? <SkeletonText lines={8} /> : !tpl.data ? (
            <EmptyState icon={<Layers className="h-5 w-5" />} title="No template yet" body="Choose a pattern to generate a page template with variable placeholders." />
          ) : (
            <>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-ink-950 p-4 font-mono text-[12.5px] leading-6 text-mist-300">
                {tpl.data.template.split(/(\{\w+\})/).map((s, i) => (/^\{\w+\}$/.test(s) ? <mark key={i} className="rounded bg-iris-400/20 px-0.5 text-iris-300">{s}</mark> : s))}
              </pre>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Variables · {rows.length} rows</span>
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-iris-300 hover:underline">
                  <Upload className="h-3.5 w-3.5" /> Upload CSV
                  <input type="file" accept=".csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onCsv(e.target.files[0])} />
                </label>
              </div>
              <div className="mt-3 space-y-2">
                {rows.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    {vars.map((v) => <input key={v} aria-label={v} className="field py-2" placeholder={v} value={r[v] ?? ""} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, [v]: e.target.value } : x)))} />)}
                    <button aria-label="Remove row" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="grid w-10 shrink-0 place-items-center rounded-xl text-mist-500 hover:bg-white/[0.04] hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button size="sm" variant="ghost" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setRows([...rows, {}])}>Add row</Button>
              </div>
            </>
          )}
        </Card>

        <Card className="flex min-w-0 flex-col">
          <h2 className="mb-4 font-bold text-white">Preview of page 1</h2>
          <div className="flex-1 whitespace-pre-wrap rounded-xl border border-white/[0.05] bg-ink-850 p-5 text-sm leading-7 text-mist-300">
            {tpl.isPending ? <SkeletonText lines={6} /> : preview || <span className="text-mist-500">The first generated page appears here.</span>}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/[0.05] pt-5">
            <Button disabled={!tpl.data || !rows.length} loading={batch.isPending} icon={<Rocket className="h-4 w-4" />} onClick={() => batch.mutate({ patternId: active!, rows }, { onSuccess: (b) => toast(`${b.done} pages generated.`) })}>Generate {rows.length} pages</Button>
            <span className="text-xs text-mist-400">Uses {rows.length} credits</span>
            {batch.data?.status === "completed" && <a href={batch.data.downloadUrl} className="ml-auto"><Button variant="secondary" icon={<Download className="h-4 w-4" />}>Download ZIP</Button></a>}
          </div>
        </Card>
      </div>
    </>
  );
}
