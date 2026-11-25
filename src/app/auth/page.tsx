"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button, cn } from "@/components/ui/primitives";
import { useAuth } from "@/hooks/useAuth";
import { checkPassword } from "@/lib/password";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordRules } from "@/components/auth/PasswordRules";

function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">(params.get("mode") === "signin" ? "signin" : "signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/dashboard";

  useEffect(() => {
    if (!auth.loading && auth.session) router.replace(next);
  }, [auth.loading, auth.session, next, router]);
  const [f, setF] = useState({ name: "", email: "", website: params.get("url") ?? "", password: "", confirm: "" });
  const pw = checkPassword(f.password, f.email);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (mode === "signup") {
      if (pw.error) return setError(pw.error);
      if (f.password !== f.confirm) return setError("Passwords don't match.");
    }
    setBusy(true);
    const res = mode === "signup" ? await auth.signUp(f.email, f.password, { full_name: f.name, website: f.website }) : await auth.signIn(f.email, f.password);
    setBusy(false);
    if (res.error) return setError(res.error.message);
    if (mode === "signup" && !res.data.session) {
      setMode("signin");
      return setNotice("Check your inbox to confirm your email, then sign in.");
    }
    router.replace(next);
  };

  const forgot = async () => {
    setError("");
    setNotice("");
    if (!f.email) return setError("Enter your email address first.");
    const { error } = await auth.resetPassword(f.email);
    if (error) return setError(error.message);
    setNotice("Password reset link sent. Check your inbox.");
  };

  return (
    <div className="w-full max-w-[460px]">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <p className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-mist-500">ARCHITECTURAL INTELLIGENCE FOR AI SEARCH</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} style={{ transformPerspective: 1000 }} className="panel p-7 sm:p-8">
        <div className="relative mb-7 grid grid-cols-2 border-b border-white/[0.06]" role="tablist">
          {(["signup", "signin"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(""); }} className={cn("relative pb-3 text-sm font-semibold transition-colors", mode === m ? "text-white" : "text-mist-500 hover:text-mist-300")}>
              {m === "signup" ? "Create account" : "Sign in"}
              {mode === m && <motion.span layoutId="tab-line" className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-iris-400" />}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <AnimatePresence initial={false}>
            {mode === "signup" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-4 overflow-hidden">
                <div><label className="label" htmlFor="name">Full name</label><input id="name" required className="field" value={f.name} onChange={set("name")} autoComplete="name" /></div>
              </motion.div>
            )}
          </AnimatePresence>
          <div><label className="label" htmlFor="email">Email address</label><input id="email" type="email" required className="field" value={f.email} onChange={set("email")} autoComplete="email" /></div>
          {mode === "signup" && <div><label className="label" htmlFor="site">Website URL</label><input id="site" required className="field" placeholder="yourbrand.com" value={f.website} onChange={set("website")} /></div>}
          <div className={cn("grid gap-3", mode === "signup" && "sm:grid-cols-2")}>
            <div><label className="label" htmlFor="pw">Password</label><PasswordInput id="pw" required maxLength={72} value={f.password} onChange={set("password")} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></div>
            {mode === "signup" && <div><label className="label" htmlFor="pw2">Confirm</label><PasswordInput id="pw2" required maxLength={72} value={f.confirm} onChange={set("confirm")} autoComplete="new-password" /></div>}
          </div>
          {mode === "signup" && <PasswordRules password={f.password} confirm={f.confirm} pw={pw} />}
          {mode === "signin" && <button type="button" onClick={forgot} className="-mt-1 text-xs font-semibold text-iris-300 hover:underline">Forgot password?</button>}
          {notice && <p className="text-sm text-emerald-400" role="status">{notice}</p>}
          {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={busy}>{mode === "signup" ? "Create my account" : "Sign in"}</Button>
          {mode === "signup" && <p className="text-center text-xs text-mist-500">By creating an account you agree to the Terms and Privacy Policy.</p>}
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] font-semibold text-mist-500"><span className="h-px flex-1 bg-white/[0.06]" />OR<span className="h-px flex-1 bg-white/[0.06]" /></div>
        <Button variant="white" size="lg" className="w-full" onClick={() => auth.signInWithGoogle().then(({ error }) => error && setError(error.message))}>
          <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"/></svg>
          Continue with Google
        </Button>
      </motion.div>

      <p className="mt-6 text-center text-sm text-mist-500">
        {mode === "signup" ? "Already have an account? " : "New to Kyro? "}
        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="font-semibold text-iris-300 hover:text-iris-300 hover:underline">{mode === "signup" ? "Sign in" : "Create an account"}</button>
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0a0e1f] px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-iris-600/20 blur-[140px]" />
      <div className="dotgrid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Suspense><AuthForm /></Suspense>
    </main>
  );
}
