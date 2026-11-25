// Shapes mirror the FastAPI / Pydantic v2 response models described in the SRS (M1–M10).

export type JobStatus = "queued" | "running" | "completed" | "failed";
export type EngineId = "chatgpt" | "gemini" | "perplexity";
export type PlanId = "free" | "starter" | "pro";
export type PaymentProvider = "stripe" | "payfast";

export interface SubScore { key: string; label: string; value: number }

export interface DashboardOverview {
  domain: string;
  cvi: number;
  cviDelta: number;
  googlePresenceAvailable: boolean;
  subScores: SubScore[];
  trend: { week: string; score: number }[];
  engines: { engine: EngineId; score: number | null }[];
  stats: { label: string; value: string }[];
  priorityActions: { id: string; type: "content" | "technical" | "offpage"; text: string; impact: number }[];
  marketStanding: { name: string; score: number; isYou?: boolean }[];
  weekly: { headline: string; headlineLabel: string; topGain: string; topLoss: string };
}

export interface CrawlJob {
  id: string;
  url: string;
  status: JobStatus;
  progress: number;
  queuePosition: number | null;
  pagesCrawled: number;
  failureReason?: string;
  createdAt: string;
}

export interface SimulatedQuery {
  id: string;
  query: string;
  engine: EngineId;
  mentioned: boolean | null; // null = probe unavailable (never treated as "not mentioned")
  competitorsMentioned: string[];
  impact: number;
  cached: boolean;
  response: string;
}

export interface QuerySimulation { hitRate: number; total: number; queries: SimulatedQuery[] }

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  cvi: number | null;
  isYou?: boolean;
  subScores: SubScore[];
  gaps: string[];
  robots: "crawlable" | "partial" | "blocked";
  status: "ok" | "not_available";
}

export interface ContentGap { id: string; title: string; competitor: string; impact: number; inPlan: boolean }
export interface CompetitorIntel { competitors: Competitor[]; gaps: ContentGap[]; newPagesDetected: number }

export interface PageScore { id: string; url: string; title: string; score: number; potentialGain: number }
export interface Highlight { text: string; kind?: "problem" | "fix" }
export interface OptimizedPage {
  pageId: string;
  original: Highlight[];
  improved: Highlight[];
  faqs: { q: string; a: string }[];
  headings: { before: string; after: string }[];
  schema: string;
}

export interface Credits { used: number; total: number; resetsAt: string }

export interface GapTopic { id: string; topic: string; query: string; impact: number }
export interface Article { id: string; topicId: string; title: string; sections: { heading: string; body: string }[] }

export interface QueryPattern { id: string; pattern: string; examples: string[]; impact: number }
export interface PageTemplate { patternId: string; template: string; variables: string[] }
export interface BatchJob { id: string; status: JobStatus; total: number; done: number; downloadUrl?: string }

export type OffPageCategory = "citation" | "review" | "community" | "pr";
export interface OffPageTask {
  id: string;
  category: OffPageCategory;
  platform: string;
  frequency: "High" | "Medium" | "Low";
  done: boolean;
  draft: string;
}

export interface WeeklyEmail {
  week: string;
  cvi: number;
  delta: number;
  actions: { text: string; impact: number }[];
  alerts: string[];
}
export interface BeforeAfter {
  before: SubScore[];
  after: SubScore[];
  pages: { url: string; before: number; after: number; changes: string }[];
}

export interface Plan { id: PlanId; name: string; price: number; features: string[]; highlighted?: boolean }
export interface Account {
  name: string;
  email: string;
  plan: PlanId;
  billingCycle: string;
  usage: { label: string; used: number; limit: number }[];
}

export interface ApiErrorBody { detail: string; code?: string }
