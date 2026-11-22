"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

/** Supabase Auth session. Without Supabase config every call succeeds as a mock. */
export function useAuth() {
  const sb = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!sb);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  return {
    session,
    loading,
    isMock: !sb,
    signUp: async (email: string, password: string, meta: { full_name: string; website: string }) => {
      if (!sb) return { error: null };
      return sb.auth.signUp({ email, password, options: { data: meta } });
    },
    signIn: async (email: string, password: string) => {
      if (!sb) return { error: null };
      return sb.auth.signInWithPassword({ email, password });
    },
    signInWithGoogle: async () => {
      if (!sb) return { error: null };
      return sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/dashboard` } });
    },
    signOut: async () => {
      await sb?.auth.signOut();
    },
  };
}
