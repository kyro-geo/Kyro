"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Globe, BarChart3, Wand2, LineChart, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroScene } from "@/components/landing/HeroScene";
import { Button, cn } from "@/components/ui/primitives";
import { TiltCard } from "@/components/ui/TiltCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFreeAudit, usePlans } from "@/hooks/api";
import { ApiError } from "@/lib/api/client";

const steps = [
  { icon: Globe, name: "Crawl", body: "We read your site the way an AI crawler does: structure, entities, schema and gaps." },
  { icon: BarChart3, name: "Score", body: "ChatGPT, Gemini and Perplexity are asked real buyer questions. You get one Combined Visibility Index." },
  { icon: Wand2, name: "Rewrite", body: "Weak pages are rewritten with FAQs, clearer headings and ready-to-paste JSON-LD, with a fact guard." },
  { icon: LineChart, name: "Track", body: "Prompts re-run daily and a weekly email tells you what moved and what to fix next." },
];

const isPublicUrl = (v: string) => {
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    return /^https?:$/.test(u.protocol) && u.hostname.includes(".") && !/^(localhost|127\.|10\.|192\.168\.)/.test(u.hostname);
  } catch {
    return false;
  }
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function Landing() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const audit = useFreeAudit();
  const plans = usePlans();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPublicUrl(url)) return setErr("Please enter a valid public website address, like yourbrand.com");
    setErr("");
    audit.mutate(url, {
      onSuccess: (job) => router.push(`/auth?audit=${job.id}&url=${encodeURIComponent(url)}`),
      onError: (e) => setErr(e instanceof ApiError ? e.message : "We couldn't start the audit. Try again in a moment."),
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="dotgrid pointer-events-none absolute inset-x-0 top-0 h-[900px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[700px] w-[700px] rounded-full bg-iris-600/20 blur-[140px]" />

      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-ink-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-10">
            <Logo />
            <div className="hidden items-center gap-7 text-sm text-mist-400 md:flex">
              <a href="#how" className="transition-colors hover:text-white">How it works</a>
              <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
              <Link href="/dashboard" className="transition-colors hover:text-white">Demo</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth?mode=signin" className="hidden px-3 text-sm text-mist-300 hover:text-white sm:block">Sign in</Link>
            <Link href="/auth"><Button size="sm">Sign up free</Button></Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease }}
            className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl lg:text-[68px]"
          >
            Get your brand into <em className="font-extrabold not-italic text-iris-300">AI answers.</em> Free.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.12, ease }} className="mt-6 max-w-[34rem] text-lg leading-relaxed text-mist-300">
            When buyers ask ChatGPT, Gemini or Perplexity for a recommendation, are you named? Kyro measures it, explains why, and rewrites the pages that hold you back.
          </motion.p>

          <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.24, ease }} className="mt-9 max-w-xl" noValidate>
            <label htmlFor="audit-url" className="label">Your website</label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input id="audit-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourbrand.com" className="field h-12 flex-1 text-[15px]" aria-invalid={!!err} aria-describedby="audit-hint" />
              <Button type="submit" size="lg" loading={audit.isPending} icon={!audit.isPending && <ArrowRight className="h-4 w-4" />} className="flex-row-reverse">
                Run free audit
              </Button>
            </div>
            <p id="audit-hint" className={cn("mt-2.5 text-[13px]", err ? "text-rose-400" : "text-mist-500")}>
              {err || "No card needed. Results in about five minutes."}
            </p>
          </motion.form>
        </div>
        <HeroScene />
      </section>

      {/* pipeline */}
      <section id="how" className="relative border-y border-white/[0.04] bg-ink-900/60 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-xl text-3xl font-bold text-white sm:text-4xl">From invisible to cited in four moves</h2>
          <div className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-iris-500/40 to-transparent md:block" />
            {steps.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: i * 0.1, ease }} className="group relative">
                <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-ink-800 text-iris-300 shadow-lift transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-1 group-hover:rotate-[-6deg] group-hover:border-iris-400/40 group-hover:text-iris-300 group-hover:shadow-glow">
                  <s.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-white">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* sample CVI */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">One number for how AI sees you</h2>
          <p className="mt-4 text-mist-300">
            The Combined Visibility Index blends how often each engine actually mentions you with how ready your pages are to be cited. Engines that fail are shown as unavailable, never as zero.
          </p>
          <ul className="mt-7 space-y-3 text-sm text-mist-300">
            {["Measured on live, search-enabled engines", "Five sub-scores that point at the fix", "Side by side with up to five competitors"].map((t) => (
              <li key={t} className="flex items-center gap-3"><Check className="h-4 w-4 text-iris-300" /> {t}</li>
            ))}
          </ul>
        </div>
        <TiltCard max={6}>
          <div className="panel p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-mist-400">Combined Visibility Index</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-extrabold text-white">47</span>
                  <span className="text-sm font-semibold text-leaf-400">+12.4%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["ChatGPT", 52], ["Gemini", 44], ["Perplexity", 39]].map(([n, v]) => (
                  <div key={n} className="rounded-xl bg-ink-800 px-3 py-2.5">
                    <div className="font-display text-lg font-bold text-white">{v}</div>
                    <div className="text-[10px] text-mist-400">{n}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-7 space-y-3.5">
              {[["Content quality", 82], ["Semantic relevance", 41], ["Entity clarity", 29], ["FAQ coverage", 64], ["Citation & structured data", 15]].map(([l, v]) => (
                <div key={l as string}>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-mist-300">{l}</span><span className="font-mono text-mist-100">{v}</span></div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <motion.div className="h-full rounded-full bg-iris-400" initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-t border-white/[0.04] bg-ink-900/60 py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">Agency results without the agency invoice</h2>
          <p className="mt-3 max-w-xl text-mist-400">A traditional GEO agency retainer starts around $1,500 a month. Kyro does the measuring and the rewriting for a fraction of that.</p>

          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {plans.isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="panel space-y-4 p-6">
                    <Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-28" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-10 w-full" />
                  </div>
                ))
              : plans.data?.map((p) => (
                  <TiltCard key={p.id} max={5}>
                    <div className={cn("panel flex h-full flex-col p-6 transition-colors duration-300", p.highlighted && "border-iris-400/40 bg-gradient-to-b from-iris-600/[0.14] to-ink-900")}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{p.name}</h3>
                        {p.highlighted && <span className="rounded-full bg-iris-400 px-2 py-0.5 text-[10px] font-bold text-ink-950">Most picked</span>}
                      </div>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-extrabold text-white">${p.price}</span>
                        <span className="text-sm text-mist-400">/mo</span>
                      </div>
                      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-mist-300">
                        {p.features.map((f) => (
                          <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-iris-300" />{f}</li>
                        ))}
                      </ul>
                      <Link href={`/auth?plan=${p.id}`} className="mt-7">
                        <Button variant={p.highlighted ? "primary" : "secondary"} className="w-full">{p.price === 0 ? "Start free" : `Choose ${p.name}`}</Button>
                      </Link>
                    </div>
                  </TiltCard>
                ))}
            <div className="flex flex-col rounded-2xl border border-dashed border-white/10 p-6">
              <h3 className="font-semibold text-mist-300">Typical GEO agency</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-mist-400 line-through decoration-rose-400/60">$1,500+</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-mist-500">
                {["Monthly retainer, 6-month minimum", "Reports, not rewrites", "Results in weeks, not minutes"].map((f) => (
                  <li key={f} className="flex gap-2.5"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/70" />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-mist-500 sm:flex-row sm:px-6">
        <Logo />
        <p>&copy; 2026 Kyro. Architectural intelligence for AI search.</p>
      </footer>
    </div>
  );
}
