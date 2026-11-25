export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

