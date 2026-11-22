"use client";
import { Sparkles } from "lucide-react";
import { useCredits } from "@/hooks/api";
import { Skeleton } from "./Skeleton";

/** Shared monthly rewrite-credit pool (Content Optimizer, Blog, Page Builder). */
export function CreditMeter() {
  const { data, isLoading } = useCredits();
  if (isLoading || !data) return <Skeleton className="h-10 w-48 rounded-xl" />;
  const left = data.total - data.used;
  const pct = (left / data.total) * 100;
  return (
    <div className="flex h-10 items-center gap-3 rounded-xl border border-white/[0.08] bg-ink-850 px-3.5" title={`Resets ${data.resetsAt}`}>
      <Sparkles className="h-4 w-4 text-iris-300" />
      <div className="w-24">
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-iris-400" style={{ width: `${pct}%` }} /></div>
      </div>
      <span className="tabular text-xs text-mist-300"><b className="font-semibold text-white">{left}</b> / {data.total} credits</span>
    </div>
  );
}
