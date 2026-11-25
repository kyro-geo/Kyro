"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";
import type { PaymentProvider, PlanId } from "@/lib/api/types";

/** Query keys in one place so mutations can invalidate precisely. */
export const keys = {
  overview: ["overview"] as const,
  crawl: (id: string) => ["crawl", id] as const,
  queries: ["queries"] as const,
  competitors: ["competitors"] as const,
  pages: ["pages"] as const,
  optimized: (id: string) => ["optimized", id] as const,
  credits: ["credits"] as const,
  gapTopics: ["gapTopics"] as const,
  patterns: ["patterns"] as const,
  offpage: ["offpage"] as const,
  email: ["email"] as const,
  beforeAfter: ["beforeAfter"] as const,
  plans: ["plans"] as const,
  account: ["account"] as const,
};

// M1 / M2
export const useOverview = () => useQuery({ queryKey: keys.overview, queryFn: api.getOverview });
export const useStartCrawl = () => useMutation({ mutationFn: api.startCrawl });
export const useFreeAudit = () => useMutation({ mutationFn: api.freeAudit });
/** Polls a crawl job every 3s until it completes or fails. */
export const useCrawlJob = (id?: string) =>
  useQuery({
    queryKey: keys.crawl(id ?? ""),
    queryFn: () => api.getCrawlJob(id!),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data && ["completed", "failed"].includes(q.state.data.status) ? false : 3000),
  });

// M3
export const useQueries = () => useQuery({ queryKey: keys.queries, queryFn: api.getQueries });
export const useAddPrompt = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.addPrompt, onSuccess: () => qc.invalidateQueries({ queryKey: keys.queries }) });
};

// M4
export const useCompetitors = () => useQuery({ queryKey: keys.competitors, queryFn: api.getCompetitors });
export const useAddCompetitor = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.addCompetitor, onSuccess: () => qc.invalidateQueries({ queryKey: keys.competitors }) });
};
export const useAddGapToPlan = () => useMutation({ mutationFn: api.addGapToPlan });

// M5
export const usePages = () => useQuery({ queryKey: keys.pages, queryFn: api.getPages });
export const useOptimizedPage = (pageId?: string) =>
  useQuery({ queryKey: keys.optimized(pageId ?? ""), queryFn: () => api.optimizePage(pageId!), enabled: !!pageId, staleTime: Infinity });
export const useCredits = () => useQuery({ queryKey: keys.credits, queryFn: api.getCredits });

// M6
export const useGapTopics = () => useQuery({ queryKey: keys.gapTopics, queryFn: api.getGapTopics });
export const useGenerateArticle = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.generateArticle, onSuccess: () => qc.invalidateQueries({ queryKey: keys.credits }) });
};

// M7
export const usePatterns = () => useQuery({ queryKey: keys.patterns, queryFn: api.getPatterns });
export const useGenerateTemplate = () => useMutation({ mutationFn: api.generateTemplate });
export const useStartBatch = () =>
  useMutation({ mutationFn: (v: { patternId: string; rows: Record<string, string>[] }) => api.startBatch(v.patternId, v.rows) });

// M8
export const useOffPage = () => useQuery({ queryKey: keys.offpage, queryFn: api.getOffPage });
export const useToggleOffPage = () => useMutation({ mutationFn: (v: { id: string; done: boolean }) => api.toggleOffPage(v.id, v.done) });

// Reports
export const useWeeklyEmail = () => useQuery({ queryKey: keys.email, queryFn: api.getWeeklyEmail });
export const useSendTestEmail = () => useMutation({ mutationFn: api.sendTestEmail });
export const useBeforeAfter = () => useQuery({ queryKey: keys.beforeAfter, queryFn: api.getBeforeAfter });

// M10
export const usePlans = () => useQuery({ queryKey: keys.plans, queryFn: api.getPlans });
export const useAccount = () => useQuery({ queryKey: keys.account, queryFn: api.getAccount });
export const useCheckout = () =>
  useMutation({ mutationFn: (v: { plan: PlanId; provider: PaymentProvider }) => api.checkout(v.plan, v.provider) });

/** Triggers a browser download for a Blob returned by an export endpoint. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
