"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

/** Supabase Auth session + actions (M10 login module). */
export function useAuth() {
  const sb = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  return {
    session,
    user: session?.user ?? null,
    loading,
    signUp: (email: string, password: string, meta: { full_name: string; website: string }) =>
      sb.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: `${location.origin}/dashboard` } }),
    signIn: (email: string, password: string) => sb.auth.signInWithPassword({ email, password }),
    signInWithGoogle: () =>
      sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/dashboard` } }),
    resetPassword: (email: string) =>
      sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth?mode=signin` }),
    signOut: () => sb.auth.signOut(),
  };
}
