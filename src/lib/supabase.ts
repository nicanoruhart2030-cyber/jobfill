import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* ── Browser client (React components / client pages) ── */
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnon);
}

/* ── Singleton for client-side use ── */
let browserClient: ReturnType<typeof createBrowserSupabase> | null = null;

export function getSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabase() must only be called on the client. Use getServiceSupabase() for server-side.');
  }
  if (!browserClient) browserClient = createBrowserSupabase();
  return browserClient;
}

/* ── Service-role client (API routes / server actions only) ── */
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
