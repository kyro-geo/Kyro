"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/** Sends signed-out users to /auth, remembering where they were going. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!loading && !session) router.replace(`/auth?mode=signin&next=${encodeURIComponent(path)}`);
  }, [loading, session, path, router]);

  if (loading || !session) {
    return <div className="grid min-h-screen place-items-center bg-ink-950"><span className="h-6 w-6 animate-spin rounded-full border-2 border-iris-400 border-t-transparent" /></div>;
  }
  return <>{children}</>;
}
