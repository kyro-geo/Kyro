"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, TerminalSquare, PenLine, BookOpen, Layers, Radar, Network, FileBarChart, Bell, CircleUser } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/components/ui/primitives";

export const nav = [
  { href: "/dashboard", label: "Dash", full: "Dashboard", icon: LayoutDashboard },
  { href: "/queries", label: "Query", full: "Query Simulator", icon: TerminalSquare },
  { href: "/optimizer", label: "Content", full: "Content Optimizer", icon: PenLine },
  { href: "/blog", label: "Blog", full: "Blog Generator", icon: BookOpen },
  { href: "/pages", label: "Page", full: "Page Builder", icon: Layers },
  { href: "/competitors", label: "Comp", full: "Competitors", icon: Radar },
  { href: "/offpage", label: "Plan", full: "Off-Page Planner", icon: Network },
  { href: "/reports", label: "Report", full: "Reports", icon: FileBarChart },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-ink-950">
      {/* sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[92px] flex-col items-center border-r border-white/[0.04] bg-ink-950 py-5 md:flex">
        <Logo href="/dashboard" />
        <nav className="mt-8 flex w-full flex-1 flex-col gap-1 px-2.5" aria-label="Main">
          {nav.map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} title={n.full} className={cn("group relative flex flex-col items-center gap-1 rounded-xl py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors", active ? "text-white" : "text-mist-500 hover:text-mist-100")}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-iris-500/[0.12] ring-1 ring-inset ring-iris-400/20" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <n.icon className={cn("relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5", active && "text-iris-300")} strokeWidth={1.75} />
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* top bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.04] bg-ink-950/80 px-4 backdrop-blur-xl md:ml-[92px] md:px-8">
        <div className="md:hidden"><Logo href="/dashboard" /></div>
        <div className="hidden items-center gap-2 text-sm text-mist-400 md:flex">
          <span className="h-2 w-2 rounded-full bg-leaf-400 shadow-[0_0_0_4px_rgba(95,214,154,.15)]" />
          kyro.ai
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg text-mist-400 transition-colors hover:bg-white/[0.04] hover:text-white">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-iris-400" />
          </button>
          <Link href="/account" aria-label="Account" className={cn("grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-white/[0.04]", path.startsWith("/account") ? "text-iris-300" : "text-mist-400 hover:text-white")}>
            <CircleUser className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="px-4 pb-28 pt-8 md:ml-[92px] md:px-8 md:pb-12">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>

      {/* bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl md:hidden" aria-label="Main">
        {nav.map((n) => {
          const active = path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={cn("flex min-w-[72px] flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold", active ? "text-iris-300" : "text-mist-500")}>
              <n.icon className="h-5 w-5" strokeWidth={1.75} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
