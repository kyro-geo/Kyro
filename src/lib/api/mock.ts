import type * as T from "./types";

/** Simulated latency so skeleton loaders are visible in mock mode. */
export const delay = (ms = 700 + Math.random() * 500) => new Promise((r) => setTimeout(r, ms));

const subs = (a: number[]): T.SubScore[] =>
  ["Content quality", "Semantic relevance", "Entity clarity", "FAQ coverage", "Citation & structured data"].map((label, i) => ({
    key: label.toLowerCase().replace(/[^a-z]+/g, "_"),
    label,
    value: a[i],
  }));

export const mock = {
  overview: (): T.DashboardOverview => ({
    domain: "kyro.ai",
    cvi: 47,
    cviDelta: 12.4,
    googlePresenceAvailable: true,
    subScores: subs([82, 41, 29, 64, 15]),
    trend: [31, 33, 32, 35, 41, 44, 43, 47].map((score, i) => ({ week: `W${String(i + 1).padStart(2, "0")}`, score })),
    engines: [
      { engine: "chatgpt", score: 52 },
      { engine: "gemini", score: 44 },
      { engine: "perplexity", score: 39 },
    ],
    stats: [
      { label: "Prompts tracked", value: "128" },
      { label: "Pages indexed", value: "1,204" },
      { label: "AI mentions", value: "84" },
    ],
    priorityActions: [
      { id: "a1", type: "content", text: "Rewrite the “AI SEO trends” page around the questions buyers actually ask.", impact: 6.2 },
      { id: "a2", type: "technical", text: "Add Organization and Product schema to 14 product pages.", impact: 4.8 },
      { id: "a3", type: "offpage", text: "Get listed on G2 and Capterra, both cited often by Perplexity.", impact: 3.1 },
    ],
    marketStanding: [
      { name: "Semantix", score: 58.2 },
      { name: "You", score: 47, isYou: true },
      { name: "DeepRank", score: 41.9 },
      { name: "SearchFlow", score: 39.4 },
    ],
    weekly: { headline: "+9", headlineLabel: "new prompts mention you", topGain: "+6 Entity clarity", topLoss: "−3 FAQ coverage" },
  }),

  queries: (): T.QuerySimulation => {
    const rows: [string, T.EngineId, boolean | null, string[], number, boolean][] = [
      ["best AI search optimization tool for startups", "chatgpt", true, [], 8.1, true],
      ["how to get my brand mentioned by ChatGPT", "perplexity", false, ["Semantix", "DeepRank"], 9.4, false],
      ["GEO vs SEO difference", "gemini", true, ["SearchFlow"], 5.2, true],
      ["affordable generative engine optimization agency", "chatgpt", false, ["Semantix"], 7.7, false],
      ["track brand visibility in AI answers", "perplexity", true, [], 6.3, true],
      ["schema markup for AI overviews", "gemini", null, [], 4.0, false],
      ["tools to audit content for LLM citations", "chatgpt", false, ["DeepRank", "SearchFlow"], 8.8, true],
    ];
    const queries = rows.map(([query, engine, mentioned, competitorsMentioned, impact, cached], i) => ({
      id: `q${i}`,
      query,
      engine,
      mentioned,
      competitorsMentioned,
      impact,
      cached,
      response:
        mentioned === null
          ? "This engine did not respond after 3 retries. The probe will run again in the next daily cycle."
          : mentioned
            ? `Several platforms help with this. Kyro stands out for small teams because it crawls your site, scores how AI engines see it, and rewrites weak pages. Alternatives include ${competitorsMentioned[0] ?? "a few agency-led services"}.`
            : `Popular options include ${competitorsMentioned.join(" and ") || "several established tools"}. These focus on monitoring how often a brand appears in AI-generated answers and suggesting content fixes.`,
    }));
    const known = queries.filter((q) => q.mentioned !== null);
    return { hitRate: Math.round((known.filter((q) => q.mentioned).length / known.length) * 100), total: queries.length, queries };
  },

  competitors: (): T.CompetitorIntel => ({
    newPagesDetected: 3,
    competitors: [
      { id: "you", name: "You", domain: "kyro.ai", cvi: 47, isYou: true, subScores: subs([82, 41, 29, 64, 15]), gaps: ["Pricing comparison page", "Customer case studies", "Glossary of GEO terms"], robots: "crawlable", status: "ok" },
      { id: "c1", name: "Semantix", domain: "semantix.io", cvi: 58, subScores: subs([76, 63, 58, 49, 44]), gaps: ["Thin FAQ section", "No author pages", "Outdated blog"], robots: "crawlable", status: "ok" },
      { id: "c2", name: "DeepRank", domain: "deeprank.ai", cvi: 42, subScores: subs([60, 45, 38, 30, 37]), gaps: ["Missing schema", "No comparisons", "Slow docs"], robots: "partial", status: "ok" },
      { id: "c3", name: "SearchFlow", domain: "searchflow.co", cvi: null, subScores: [], gaps: [], robots: "blocked", status: "not_available" },
    ],
    gaps: [
      { id: "g1", title: "GEO vs SEO explainer with a comparison table", competitor: "Semantix", impact: 7.4, inPlan: false },
      { id: "g2", title: "Pricing page that answers “is it worth it” questions", competitor: "Semantix", impact: 5.9, inPlan: true },
      { id: "g3", title: "Case studies with measurable visibility lift", competitor: "DeepRank", impact: 4.6, inPlan: false },
      { id: "g4", title: "Glossary of generative search terms", competitor: "Semantix", impact: 3.2, inPlan: false },
    ],
  }),

  pages: (): T.PageScore[] => [
    { id: "p1", url: "/blog/ai-seo-trends", title: "AI SEO Trends 2026", score: 31, potentialGain: 6.2 },
    { id: "p2", url: "/pricing", title: "Pricing", score: 44, potentialGain: 4.1 },
    { id: "p3", url: "/features/crawler", title: "Web Crawler", score: 52, potentialGain: 3.3 },
    { id: "p4", url: "/about", title: "About", score: 58, potentialGain: 2.0 },
    { id: "p5", url: "/", title: "Home", score: 63, potentialGain: 1.4 },
  ],

  optimized: (pageId: string): T.OptimizedPage => ({
    pageId,
    original: [
      { text: "AI SEO Trends\n\n", kind: "problem" },
      { text: "AI is changing search a lot. There are many trends to watch.", kind: "problem" },
      { text: " Our tool helps with this. " },
      { text: "Contact us to learn more.", kind: "problem" },
    ],
    improved: [
      { text: "Generative Search Trends for 2026: What Changes for Your Brand\n\n", kind: "fix" },
      { text: "AI assistants such as ChatGPT, Gemini and Perplexity now answer many product research questions directly, citing a small set of sources.", kind: "fix" },
      { text: " Kyro measures how often those engines mention you and rewrites the pages that hold you back. " },
      { text: "Run a free audit to see your Combined Visibility Index in under five minutes.", kind: "fix" },
    ],
    faqs: [
      { q: "What is generative engine optimization?", a: "GEO is the practice of shaping your content so AI assistants understand, trust and cite it in their answers." },
      { q: "How is GEO different from SEO?", a: "SEO targets ranked links. GEO targets the answer itself, so entity clarity, factual density and structured data matter more than keywords." },
    ],
    headings: [
      { before: "AI SEO Trends", after: "Generative Search Trends for 2026: What Changes for Your Brand" },
      { before: "Our Tool", after: "How Kyro Measures AI Visibility" },
    ],
    schema: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [{ "@type": "Question", name: "What is generative engine optimization?", acceptedAnswer: { "@type": "Answer", text: "GEO is the practice of shaping your content so AI assistants cite it." } }],
      },
      null,
      2,
    ),
  }),

  credits: (): T.Credits => ({ used: 14, total: 40, resetsAt: "2026-12-01" }),

  gapTopics: (): T.GapTopic[] => [
    { id: "t1", topic: "How to get your brand cited by ChatGPT", query: "how to get my brand mentioned by ChatGPT", impact: 9.4 },
    { id: "t2", topic: "Tools that audit content for LLM citations", query: "tools to audit content for LLM citations", impact: 8.8 },
    { id: "t3", topic: "Choosing an affordable GEO agency (or not needing one)", query: "affordable generative engine optimization agency", impact: 7.7 },
  ],

  article: (topicId: string): T.Article => ({
    id: `art-${topicId}`,
    topicId,
    title: "How to Get Your Brand Cited by ChatGPT",
    sections: [
      { heading: "Why AI citations matter now", body: "When someone asks an AI assistant for a recommendation, it names a handful of brands. Being one of them is the new first page." },
      { heading: "Make your brand an unambiguous entity", body: "Describe what you are, who you serve and where you operate in plain sentences on your home and about pages, and back it with Organization schema." },
      { heading: "Answer the questions buyers ask", body: "Collect the real prompts your customers use and give each a direct, factual answer on a page an engine can crawl." },
      { heading: "Earn mentions where engines look", body: "Review sites, community threads and industry roundups are cited disproportionately. Prioritise the ones each engine favours." },
    ],
  }),

  patterns: (): T.QueryPattern[] => [
    { id: "pt1", pattern: "best {service} in {city}", examples: ["best GEO agency in Lahore", "best GEO agency in Karachi"], impact: 8.2 },
    { id: "pt2", pattern: "{tool} alternatives", examples: ["Semantix alternatives", "DeepRank alternatives"], impact: 6.5 },
    { id: "pt3", pattern: "{industry} AI visibility", examples: ["SaaS AI visibility", "ecommerce AI visibility"], impact: 4.9 },
  ],

  template: (patternId: string): T.PageTemplate => ({
    patternId,
    variables: ["service", "city"],
    template:
      "# The best {service} in {city}\n\nLooking for {service} in {city}? Kyro helps local businesses appear in AI answers when people ask for {service} near them.\n\n## Why {city} businesses choose us\n\nWe measure how ChatGPT, Gemini and Perplexity describe {service} providers in {city} and fix the gaps.",
  }),

  offpage: (): T.OffPageTask[] => [
    { id: "o1", category: "citation", platform: "Wikipedia", frequency: "High", done: false, draft: "Kyro is a generative engine optimization platform founded in Pakistan in 2026." },
    { id: "o2", category: "citation", platform: "Crunchbase", frequency: "Medium", done: true, draft: "Kyro helps small businesses measure and improve their visibility in AI answers." },
    { id: "o3", category: "review", platform: "G2", frequency: "High", done: false, draft: "Hi! Would you share a short review of the result Kyro got you on G2?" },
    { id: "o4", category: "review", platform: "Capterra", frequency: "Medium", done: false, draft: "Kyro crawls your site, scores AI visibility and rewrites weak pages." },
    { id: "o5", category: "community", platform: "Reddit r/SEO", frequency: "High", done: true, draft: "GEO is mostly about entity clarity and answering real questions. Here is what worked for us." },
    { id: "o6", category: "community", platform: "Quora", frequency: "Low", done: false, draft: "To show up in ChatGPT answers, start by making your brand an unambiguous entity." },
    { id: "o7", category: "pr", platform: "TechCrunch pitch", frequency: "Medium", done: false, draft: "Pakistani startup makes AI search visibility affordable for small businesses." },
    { id: "o8", category: "pr", platform: "Industry roundup", frequency: "High", done: false, draft: "Happy to contribute a quote to your Top GEO tools 2026 roundup." },
  ],

  email: (): T.WeeklyEmail => ({
    week: "Nov 16 – Nov 22, 2026",
    cvi: 47,
    delta: 4,
    actions: [
      { text: "Rewrite /blog/ai-seo-trends", impact: 6.2 },
      { text: "Add FAQ schema to /pricing", impact: 4.1 },
      { text: "Claim your G2 listing", impact: 3.1 },
    ],
    alerts: ["Semantix published 3 new pages about GEO pricing.", "2 new pages detected on your site."],
  }),

  beforeAfter: (): T.BeforeAfter => ({
    before: subs([70, 33, 18, 40, 9]),
    after: subs([82, 41, 29, 64, 15]),
    pages: [
      { url: "/blog/ai-seo-trends", before: 22, after: 31, changes: "Rewrote intro, added 4 FAQs" },
      { url: "/pricing", before: 47, after: 44, changes: "Comparison table removed by CMS" },
      { url: "/features/crawler", before: 41, after: 52, changes: "Added Product schema and entity description" },
    ],
  }),

  plans: (): T.Plan[] => [
    { id: "free", name: "Free", price: 0, features: ["1 site audit", "20 tracked prompts", "Weekly email report"] },
    { id: "starter", name: "Starter", price: 29, features: ["2 competitors", "100 tracked prompts", "40 rewrite credits a month", "Blog generator"], highlighted: true },
    { id: "pro", name: "Pro", price: 79, features: ["5 competitors", "500 tracked prompts", "150 rewrite credits a month", "Programmatic pages", "PDF audit reports"] },
  ],

  account: (): T.Account => ({
    name: "Demo User",
    email: "demo@kyro.test",
    plan: "starter",
    billingCycle: "Renews Dec 1, 2026",
    usage: [
      { label: "Rewrite credits", used: 14, limit: 40 },
      { label: "Tracked prompts", used: 88, limit: 100 },
      { label: "Competitors", used: 2, limit: 2 },
    ],
  }),
};
