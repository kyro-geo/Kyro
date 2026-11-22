"use client";
import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Minus, Database, Radio, ChevronDown, Plus } from "lucide-react";
import { useAddPrompt, useQueries } from "@/hooks/api";
import { Badge, Button, Card, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonRows } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

const engineName = { chatgpt: "ChatGPT", gemini: "Gemini", perplexity: "Perplexity" };

function highlight(text: string, word = "Kyro") {
  return text.split(new RegExp(`(${word})`, "g")).map((p, i) => (p === word ? <mark key={i} className="rounded bg-iris-400/25 px-1 text-iris-300">{p}</mark> : p));
}

export default function QueriesPage() {
  const { data, isLoading, error, refetch } = useQueries();
  const add = useAddPrompt();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    add.mutate(prompt.trim(), {
      onSuccess: () => { toast("Prompt added. It runs in the next daily cycle."); setPrompt(""); },
      onError: (e) => toast(e instanceof ApiError && e.isPlanLimit ? "You've reached your plan's prompt limit. Upgrade to add more." : e.message, "error"),
    });
  };

  return (
    <>
      <PageHeader title="Query simulator" description="Real buyer questions asked to search-enabled AI engines. See where you're named and who is named instead." />

      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex items-center gap-6">
          {isLoading || !data ? (
            <><Skeleton className="h-16 w-24" /><Skeleton className="h-3 flex-1" /></>
          ) : (
            <>
              <div>
                <div className="text-sm text-mist-400">Query hit rate</div>
                <div className="tabular font-display text-5xl font-extrabold text-white">{data.hitRate}%</div>
              </div>
              <div className="flex-1">
                <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-iris-600 to-iris-300" initial={{ width: 0 }} animate={{ width: `${data.hitRate}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
                </div>
                <p className="mt-2 text-xs text-mist-400">Mentioned in {data.queries.filter((q) => q.mentioned).length} of {data.queries.filter((q) => q.mentioned !== null).length} answered prompts</p>
              </div>
            </>
          )}
        </Card>
        <Card>
          <form onSubmit={submit} className="flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor="new-prompt" className="sr-only">Add a prompt to track</label>
            <input id="new-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="field flex-1" placeholder="Add a question your buyers ask, e.g. best CRM for agencies" />
            <Button type="submit" loading={add.isPending} icon={<Plus className="h-4 w-4" />}>Track prompt</Button>
          </form>
        </Card>
      </div>

      <Card className="p-0">
        {error ? (
          <div className="p-6"><ErrorState error={error} onRetry={refetch} /></div>
        ) : isLoading || !data ? (
          <div className="p-4"><SkeletonRows rows={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.05] text-left text-xs text-mist-500">
                  <th className="px-5 py-3.5 font-medium">Query</th>
                  <th className="px-3 py-3.5 font-medium">Engine</th>
                  <th className="px-3 py-3.5 font-medium">You</th>
                  <th className="px-3 py-3.5 font-medium">Named instead</th>
                  <th className="px-3 py-3.5 text-right font-medium">Impact</th>
                  <th className="px-5 py-3.5 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {data.queries.map((q) => (
                  <Fragment key={q.id}>
                    <tr onClick={() => setOpen(open === q.id ? null : q.id)} className="cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]" aria-expanded={open === q.id}>
                      <td className="px-5 py-4 text-mist-100"><span className="flex items-center gap-2"><ChevronDown className={cn("h-4 w-4 text-mist-500 transition-transform", open === q.id && "rotate-180")} />{q.query}</span></td>
                      <td className="px-3 py-4 text-mist-300">{engineName[q.engine]}</td>
                      <td className="px-3 py-4">
                        {q.mentioned === null ? <span title="Probe unavailable" className="grid h-6 w-6 place-items-center rounded-full bg-white/[0.05] text-mist-400"><Minus className="h-3.5 w-3.5" /></span>
                          : q.mentioned ? <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf-500/15 text-leaf-400"><Check className="h-3.5 w-3.5" /></span>
                          : <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/15 text-rose-400"><X className="h-3.5 w-3.5" /></span>}
                      </td>
                      <td className="px-3 py-4"><div className="flex flex-wrap gap-1">{q.competitorsMentioned.length ? q.competitorsMentioned.map((c) => <Badge key={c}>{c}</Badge>) : <span className="text-mist-500">—</span>}</div></td>
                      <td className="tabular px-3 py-4 text-right font-mono text-mist-100">{q.impact.toFixed(1)}</td>
                      <td className="px-5 py-4">{q.cached ? <Badge tone="mist"><Database className="h-3 w-3" />Cached</Badge> : <Badge tone="iris"><Radio className="h-3 w-3" />Live</Badge>}</td>
                    </tr>
                    <AnimatePresence>
                      {open === q.id && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                              <div className="mx-5 mb-4 rounded-xl border border-white/[0.05] bg-ink-850 p-4 text-[13px] leading-relaxed text-mist-300">
                                <div className="mb-2 text-xs font-semibold text-mist-500">{engineName[q.engine]} answered</div>
                                {highlight(q.response)}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
