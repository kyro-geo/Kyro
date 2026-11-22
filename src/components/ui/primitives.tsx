"use client";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

export const cn = clsx;

type BtnVariant = "primary" | "secondary" | "ghost" | "white";
const variants: Record<BtnVariant, string> = {
  primary:
    "bg-iris-400 text-ink-950 shadow-glow hover:bg-iris-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-12px_rgba(130,134,247,.7)] active:translate-y-0",
  secondary: "bg-ink-800 text-mist-100 border border-white/[0.08] hover:border-white/[0.18] hover:bg-ink-700",
  ghost: "text-mist-300 hover:text-mist-100 hover:bg-white/[0.04]",
  white: "bg-white text-ink-950 hover:bg-mist-100 hover:-translate-y-0.5",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: ReactNode }
>(function Button({ variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-[15px]",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel p-6", className)} {...rest} />;
}

type Tone = "iris" | "leaf" | "rose" | "ember" | "mist";
const tones: Record<Tone, string> = {
  iris: "bg-iris-500/12 text-iris-300 ring-iris-400/25",
  leaf: "bg-leaf-500/12 text-leaf-400 ring-leaf-400/25",
  rose: "bg-rose-500/12 text-rose-400 ring-rose-400/25",
  ember: "bg-ember-500/12 text-ember-400 ring-ember-400/25",
  mist: "bg-white/[0.05] text-mist-300 ring-white/10",
};
export function Badge({ tone = "mist", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

/** Horizontal score bar that animates its fill on mount. */
export function ScoreBar({ label, value, tone = "iris" }: { label: string; value: number; tone?: "iris" | "leaf" | "rose" }) {
  const fill = tone === "leaf" ? "bg-leaf-400" : tone === "rose" ? "bg-rose-400" : "bg-iris-400";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
        <span className="text-mist-300">{label}</span>
        <span className="tabular font-mono text-xs text-mist-100">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={cn("h-full origin-left rounded-full animate-[grow_1.1s_cubic-bezier(.16,1,.3,1)_both]", fill)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white sm:text-[34px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-mist-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-ink-800 text-iris-300">{icon}</div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-mist-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-5 text-sm">
      <p className="font-semibold text-rose-400">Couldn&apos;t load this section</p>
      <p className="mt-1 text-mist-300">{msg}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
