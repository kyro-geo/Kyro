import { http } from "./client";
import type * as T from "./types";

/** One function per FastAPI route, grouped by SRS module (M1-M10). */
const V = "/api/v1";

export const api = {
  // M1 Web Crawler
  startCrawl: (url: string) =>
    http.post<T.CrawlJob>(`${V}/crawl/jobs`, { url }),
  getCrawlJob: (id: string) =>
    http.get<T.CrawlJob>(`${V}/crawl/jobs/${id}`),

  // M2 Scoring / dashboard
  getOverview: () => http.get<T.DashboardOverview>(`${V}/dashboard/overview`),

  // M3 Query Simulator
  getQueries: () => http.get<T.QuerySimulation>(`${V}/queries`),
  addPrompt: (query: string) => http.post<{ ok: boolean }>(`${V}/queries/prompts`, { query }),

  // M4 Competitor Intelligence
  getCompetitors: () => http.get<T.CompetitorIntel>(`${V}/competitors`),
  addCompetitor: (url: string) => http.post<{ ok: boolean }>(`${V}/competitors`, { url }),
  addGapToPlan: (gapId: string) => http.post<{ ok: boolean }>(`${V}/competitors/gaps/${gapId}/plan`),

  // M5 Content Optimizer
  getPages: () => http.get<T.PageScore[]>(`${V}/optimizer/pages`),
  optimizePage: (pageId: string) => http.post<T.OptimizedPage>(`${V}/optimizer/pages/${pageId}/optimize`),
  exportOptimizer: () => http.get<Blob>(`${V}/optimizer/export`),
  getCredits: () => http.get<T.Credits>(`${V}/billing/credits`),

  // M6 Blog Article Generator
  getGapTopics: () => http.get<T.GapTopic[]>(`${V}/articles/gaps`),
  generateArticle: (topicId: string) => http.post<T.Article>(`${V}/articles`, { topicId }),
  exportArticle: (id: string, format: "html" | "txt" | "docx") =>
    http.get<Blob>(`${V}/articles/${id}/export?format=${format}`),

  // M7 Programmatic Page Builder
  getPatterns: () => http.get<T.QueryPattern[]>(`${V}/programmatic/patterns`),
  generateTemplate: (patternId: string) =>
    http.post<T.PageTemplate>(`${V}/programmatic/patterns/${patternId}/template`),
  startBatch: (patternId: string, rows: Record<string, string>[]) =>
    http.post<T.BatchJob>(`${V}/programmatic/batches`, { patternId, rows }),

  // M8 Off-Page Planner
  getOffPage: () => http.get<T.OffPageTask[]>(`${V}/offpage/tasks`),
  toggleOffPage: (id: string, done: boolean) =>
    http.patch<{ id: string; done: boolean }>(`${V}/offpage/tasks/${id}`, { done }),

  // Reports
  getWeeklyEmail: () => http.get<T.WeeklyEmail>(`${V}/reports/weekly-email`),
  sendTestEmail: () => http.post<{ ok: boolean }>(`${V}/reports/weekly-email/test`),
  getBeforeAfter: () => http.get<T.BeforeAfter>(`${V}/reports/before-after`),
  downloadPdf: () => http.get<Blob>(`${V}/reports/pdf`),

  // M9 Landing (public free audit)
  freeAudit: (url: string) =>
    http.post<T.CrawlJob>(`${V}/public/audit`, { url }),

  // M10 Account & subscription
  getPlans: () => http.get<T.Plan[]>(`${V}/billing/plans`),
  getAccount: () => http.get<T.Account>(`${V}/account`),
  checkout: (plan: T.PlanId) => http.post<{ url: string }>(`${V}/billing/checkout`, { plan }),
};
