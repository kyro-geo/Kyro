export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** When no backend URL is configured the UI runs on mock data so every screen is demoable. */
export const useMocks = !config.apiUrl;
