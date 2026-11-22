import { http } from "./client";
import { useMocks } from "../config";
import { delay, mock } from "./mock";
import type * as T from "./types";

/**
 * One function per FastAPI route, grouped by SRS module (M1–M10).
 * In mock mode each call resolves locally, so switching to the real backend
 * is only a matter of setting NEXT_PUBLIC_API_URL. No component changes.
 */
const m = async <R>(fn: () => R): Promise<R> => {
  await delay();
  return fn();
};
const V = "/api/v1";

export const api = {
  // M1 Web Crawler
  startCrawl: (url: string) =>
    useMocks
      ? m<T.CrawlJob>(() => ({ id: "job_1", url, status: "queued", progress: 0, queuePosition: 2, pagesCrawled: 0, createdAt: new Date().toISOString() }))
      : http.post<T.CrawlJob>(`${V}/crawl/jobs`, { url }),
  getCrawlJob: (id: string) =>
    useMocks
      ? m<T.CrawlJob>(() => ({ id, url: "https://kyro.ai", status: "completed", progress: 100, queuePosition: null, pagesCrawled: 37, createdAt: new Date().toISOString() }))
      : http.get<T.CrawlJob>(`${V}/crawl/jobs/${id}`),

  // M2 Scoring / dashboard
  getOverview: () => (useMocks ? m(mock.overview) : http.get<T.DashboardOverview>(`${V}/dashboard/overview`)),

  // M3 Query Simulator
  getQueries: () => (useMocks ? m(mock.queries) : http.get<T.QuerySimulation>(`${V}/queries`)),
  addPrompt: (query: string) => (useMocks ? m(() => ({ ok: true })) : http.post<{ ok: boolean }>(`${V}/queries/prompts`, { query })),

  // M4 Competitor Intelligence
  getCompetitors: () => (useMocks ? m(mock.competitors) : http.get<T.CompetitorIntel>(`${V}/competitors`)),
  addCompetitor: (url: string) => (useMocks ? m(() => ({ ok: true })) : http.post<{ ok: boolean }>(`${V}/competitors`, { url })),
  addGapToPlan: (gapId: string) => (useMocks ? m(() => ({ ok: true })) : http.post<{ ok: boolean }>(`${V}/competitors/gaps/${gapId}/plan`)),

  // M5 Content Optimizer
  getPages: () => (useMocks ? m(mock.pages) : http.get<T.PageScore[]>(`${V}/optimizer/pages`)),
  optimizePage: (pageId: string) => (useMocks ? m(() => mock.optimized(pageId)) : http.post<T.OptimizedPage>(`${V}/optimizer/pages/${pageId}/optimize`)),
  exportOptimizer: () => (useMocks ? m(() => new Blob(["Kyro optimizer export (mock)"])) : http.get<Blob>(`${V}/optimizer/export`)),
  getCredits: () => (useMocks ? m(mock.credits) : http.get<T.Credits>(`${V}/billing/credits`)),

  // M6 Blog Article Generator
  getGapTopics: () => (useMocks ? m(mock.gapTopics) : http.get<T.GapTopic[]>(`${V}/articles/gaps`)),
  generateArticle: (topicId: string) => (useMocks ? m(() => mock.article(topicId)) : http.post<T.Article>(`${V}/articles`, { topicId })),
  exportArticle: (id: string, format: "html" | "txt" | "docx") =>
    useMocks ? m(() => new Blob([`Kyro article ${id} (mock ${format})`])) : http.get<Blob>(`${V}/articles/${id}/export?format=${format}`),

  // M7 Programmatic Page Builder
  getPatterns: () => (useMocks ? m(mock.patterns) : http.get<T.QueryPattern[]>(`${V}/programmatic/patterns`)),
  generateTemplate: (patternId: string) =>
    useMocks ? m(() => mock.template(patternId)) : http.post<T.PageTemplate>(`${V}/programmatic/patterns/${patternId}/template`),
  startBatch: (patternId: string, rows: Record<string, string>[]) =>
    useMocks
      ? m<T.BatchJob>(() => ({ id: "b1", status: "completed", total: rows.length, done: rows.length, downloadUrl: "#" }))
      : http.post<T.BatchJob>(`${V}/programmatic/batches`, { patternId, rows }),

  // M8 Off-Page Planner
  getOffPage: () => (useMocks ? m(mock.offpage) : http.get<T.OffPageTask[]>(`${V}/offpage/tasks`)),
  toggleOffPage: (id: string, done: boolean) =>
    useMocks ? m(() => ({ id, done })) : http.patch<{ id: string; done: boolean }>(`${V}/offpage/tasks/${id}`, { done }),

  // Reports
  getWeeklyEmail: () => (useMocks ? m(mock.email) : http.get<T.WeeklyEmail>(`${V}/reports/weekly-email`)),
  sendTestEmail: () => (useMocks ? m(() => ({ ok: true })) : http.post<{ ok: boolean }>(`${V}/reports/weekly-email/test`)),
  getBeforeAfter: () => (useMocks ? m(mock.beforeAfter) : http.get<T.BeforeAfter>(`${V}/reports/before-after`)),
  downloadPdf: () => (useMocks ? m(() => new Blob(["Kyro PDF report (mock)"])) : http.get<Blob>(`${V}/reports/pdf`)),

  // M9 Landing (public free audit)
  freeAudit: (url: string) =>
    useMocks ? m<T.CrawlJob>(() => ({ id: "free_1", url, status: "queued", progress: 0, queuePosition: 1, pagesCrawled: 0, createdAt: new Date().toISOString() })) : http.post<T.CrawlJob>(`${V}/public/audit`, { url }),

  // M10 Account & subscription
  getPlans: () => (useMocks ? m(mock.plans) : http.get<T.Plan[]>(`${V}/billing/plans`)),
  getAccount: () => (useMocks ? m(mock.account) : http.get<T.Account>(`${V}/account`)),
  checkout: (plan: T.PlanId) => (useMocks ? m(() => ({ url: `/account?plan=${plan}` })) : http.post<{ url: string }>(`${V}/billing/checkout`, { plan })),
};
