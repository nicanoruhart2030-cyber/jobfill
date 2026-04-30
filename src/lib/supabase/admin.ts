import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getSupabaseAdmin(): SupabaseClient {
  const c = createAdminClient();
  if (!c) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return c;
}
