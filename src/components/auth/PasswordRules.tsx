"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { passwordRules, type checkPassword } from "@/lib/password";
import { cn } from "@/components/ui/primitives";

const BAR = ["bg-rose-500", "bg-ember-500", "bg-iris-400", "bg-emerald-400"];
const LABEL = ["Too weak", "Weak", "Good", "Strong"];

type Props = { password: string; confirm: string; pw: ReturnType<typeof checkPassword> };

/** Always-visible password requirements: red when unmet, green when met, animated on change. */
export function PasswordRules({ password, confirm, pw }: Props) {
  const typed = password.length > 0;
  const items = [
    ...passwordRules.map((r) => ({ id: r.id, label: r.label, met: (pw.passed as readonly string[]).includes(r.id) })),
    { id: "match", label: "Passwords match", met: typed && password === confirm },
  ];

  return (
    <div className="space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.span
                className={cn("absolute inset-0 origin-left rounded-full", BAR[Math.max(0, pw.score - 1)])}
                initial={false}
                animate={{ scaleX: typed && i < pw.score ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              />
            </span>
          ))}
        </div>
        <span className={cn("w-16 text-right text-[11px] font-semibold transition-colors duration-300", !typed ? "text-mist-500" : pw.ok ? "text-emerald-400" : "text-rose-400")}>
          {typed ? (pw.ok ? "Strong" : LABEL[Math.min(2, Math.max(0, pw.score - 1))]) : "Required"}
        </span>
      </div>

      <ul className="grid gap-x-3 gap-y-1.5 text-xs sm:grid-cols-2">
        {items.map((it) => {
          const state = !typed ? "idle" : it.met ? "ok" : "bad";
          return (
            <motion.li
              key={it.id}
              className="flex items-center gap-1.5"
              animate={{ color: state === "ok" ? "#34d399" : state === "bad" ? "#fb7185" : "#7c84a3", x: state === "bad" ? [0, -2, 2, 0] : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="relative grid h-4 w-4 shrink-0 place-items-center">
                <motion.span
                  className="absolute inset-0 rounded-full"
                  animate={{ backgroundColor: state === "ok" ? "rgba(52,211,153,0.15)" : state === "bad" ? "rgba(251,113,133,0.15)" : "rgba(255,255,255,0.05)" }}
                  transition={{ duration: 0.3 }}
                />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={state === "ok" ? "ok" : "x"}
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="relative"
                  >
                    {state === "ok" ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                  </motion.span>
                </AnimatePresence>
              </span>
              {it.label}
            </motion.li>
          );
        })}
      </ul>
      {typed && pw.error && pw.passed.length === passwordRules.length && <p className="text-xs text-rose-400">{pw.error}</p>}
    </div>
  );
}
