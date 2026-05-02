import { auth } from "@clerk/nextjs/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase with Clerk JWT (`supabase` template) for RLS.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const { getToken } = await auth();

  return createSupabaseClient(url, key, {
    global: {
      fetch: async (fetchUrl, options = {}) => {
        const headers = new Headers(options.headers);
        const token = await getToken({ template: "supabase" }).catch(() => null);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return fetch(fetchUrl, { ...options, headers });
      },
    },
  });
}
