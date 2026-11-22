"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Quote, Star, MessagesSquare, Megaphone } from "lucide-react";
import { useOffPage, useToggleOffPage } from "@/hooks/api";
import { Badge, Card, ErrorState, PageHeader, cn } from "@/components/ui/primitives";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { OffPageCategory, OffPageTask } from "@/lib/api/types";

const sections: { key: OffPageCategory; title: string; icon: typeof Quote }[] = [
  { key: "citation", title: "Citation platforms", icon: Quote },
  { key: "review", title: "Review sites", icon: Star },
  { key: "community", title: "Community mentions", icon: MessagesSquare },
  { key: "pr", title: "PR opportunities", icon: Megaphone },
];
const freqTone = { High: "leaf", Medium: "ember", Low: "mist" } as const;

export default function OffPage() {
  const { data, isLoading, error, refetch } = useOffPage();
  const toggle = useToggleOffPage();
  const toast = useToast();
  const [tasks, setTasks] = useState<OffPageTask[]>([]);
  useEffect(() => { if (data) setTasks(data); }, [data]);

  const pct = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
  const flip = (t: OffPageTask) => {
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    toggle.mutate({ id: t.id, done: !t.done }, { onError: () => { setTasks((ts) => ts.map((x) => (x.id === t.id ? t : x))); toast("Couldn't save that change.", "error"); } });
  };

  return (
    <>
      <PageHeader title="Off-page planner" description="The places AI engines quote most often. Work through them and paste our drafts as a starting point." />
      <Card className="mb-6">
        {isLoading ? <Skeleton className="h-10 w-full" /> : (
          <div className="flex items-center gap-5">
            <span className="tabular font-display text-4xl font-extrabold text-white">{pct}%</span>
            <div className="flex-1">
              <div className="mb-1.5 text-sm text-mist-400">Off-page completion</div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]"><motion.div className="h-full rounded-full bg-gradient-to-r from-iris-600 to-iris-300" animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} /></div>
            </div>
          </div>
        )}
      </Card>
      {error ? <ErrorState error={error} onRetry={refetch} /> : (
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((s) => isLoading ? <SkeletonCard key={s.key} lines={5} /> : (
            <Card key={s.key}>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-iris-500/10 text-iris-300"><s.icon className="h-4 w-4" /></span>
                <h2 className="font-bold text-white">{s.title}</h2>
              </div>
              <ul className="space-y-2">
                {tasks.filter((t) => t.category === s.key).map((t) => (
                  <li key={t.id} className={cn("flex items-center gap-3 rounded-xl bg-ink-800/60 p-3.5 transition-opacity", t.done && "opacity-60")}>
                    <button role="switch" aria-checked={t.done} aria-label={`Mark ${t.platform} ${t.done ? "not done" : "done"}`} onClick={() => flip(t)} className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", t.done ? "bg-leaf-500" : "bg-ink-600")}>
                      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white", t.done ? "right-0.5" : "left-0.5")} />
                    </button>
                    <span className={cn("flex-1 text-sm font-medium text-mist-100", t.done && "line-through decoration-mist-500")}>{t.platform}</span>
                    <Badge tone={freqTone[t.frequency]}>{t.frequency}</Badge>
                    <button onClick={() => { navigator.clipboard.writeText(t.draft); toast(`${t.platform} draft copied.`); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-iris-300 hover:bg-iris-500/10"><Copy className="h-3.5 w-3.5" />Copy draft</button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
