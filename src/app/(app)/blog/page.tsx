"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileCode, FileType, Sparkles, BookOpen } from "lucide-react";
import { saveBlob, useGapTopics, useGenerateArticle } from "@/hooks/api";
import { api } from "@/lib/api/endpoints";
import { Button, Card, EmptyState, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { CreditMeter } from "@/components/ui/CreditMeter";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

export default function BlogPage() {
  const topics = useGapTopics();
  const gen = useGenerateArticle();
  const toast = useToast();
  const [active, setActive] = useState<string>();

  const generate = (id: string) => {
    setActive(id);
    gen.mutate(id, { onError: (e) => toast(e instanceof ApiError && e.isPlanLimit ? "Out of credits for this cycle. Upgrade or wait for the reset." : "Generation failed and your credit was refunded. Try again.", "error") });
  };
  const exp = async (format: "html" | "txt" | "docx") => {
    if (!gen.data) return;
    try { saveBlob(await api.exportArticle(gen.data.id, format), `${gen.data.title}.${format}`); } catch { toast("Export failed. Nothing was downloaded.", "error"); }
  };

  return (
    <>
      <PageHeader title="Blog generator" description="Articles for the questions where competitors are named and you aren't. Ranked by how much each would lift your score." actions={<CreditMeter />} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="h-fit">
          <h2 className="mb-4 font-bold text-white">Content gaps</h2>
          {topics.isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
            : topics.error ? <ErrorState error={topics.error} onRetry={topics.refetch} />
            : !topics.data?.length ? <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No content gaps found" body="You're named in every tracked prompt. Add more prompts in the Query Simulator to find new topics." />
            : (
            <ul className="space-y-3">
              {topics.data.map((t) => (
                <li key={t.id} className={cn("rounded-xl border p-4 transition-all duration-300", active === t.id ? "border-iris-400/30 bg-iris-500/[0.07]" : "border-white/[0.05] bg-ink-800/50 hover:border-white/10")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{t.topic}</p>
                    <span className="tabular shrink-0 text-xs font-semibold text-leaf-400">+{t.impact}</span>
                  </div>
                  <p className="mt-1 text-xs text-mist-500">&ldquo;{t.query}&rdquo;</p>
                  <Button size="sm" className="mt-3" loading={gen.isPending && active === t.id} disabled={gen.isPending && active !== t.id} icon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => generate(t.id)}>Generate article</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="min-h-[520px]">
          {gen.isPending ? (
            <div><Skeleton className="mb-6 h-8 w-3/4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="mb-6"><Skeleton className="mb-3 h-5 w-1/3" /><SkeletonText lines={3} /></div>)}</div>
          ) : gen.data ? (
            <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <h2 className="text-2xl font-bold text-white">{gen.data.title}</h2>
              <div className="mt-6 max-w-[68ch] space-y-6">
                {gen.data.sections.map((s) => (
                  <section key={s.heading}>
                    <h3 className="text-lg font-semibold text-white">{s.heading}</h3>
                    <p className="mt-2 leading-7 text-mist-300" contentEditable suppressContentEditableWarning>{s.body}</p>
                  </section>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.05] pt-5">
                <Button variant="secondary" size="sm" icon={<FileCode className="h-3.5 w-3.5" />} onClick={() => exp("html")}>HTML</Button>
                <Button variant="secondary" size="sm" icon={<FileText className="h-3.5 w-3.5" />} onClick={() => exp("txt")}>Plain text</Button>
                <Button variant="secondary" size="sm" icon={<FileType className="h-3.5 w-3.5" />} onClick={() => exp("docx")}>Word</Button>
              </div>
            </motion.article>
          ) : (
            <EmptyState icon={<BookOpen className="h-5 w-5" />} title="Pick a gap to write about" body="Generate an article from any topic on the left. It uses one credit and you can edit it before exporting." />
          )}
        </Card>
      </div>
    </>
  );
}
