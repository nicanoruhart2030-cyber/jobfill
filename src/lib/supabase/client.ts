"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/** In-memory placeholder so the UI can render when env is missing (e.g. misconfigured Vercel). Auth/API calls will fail until env is set. */
function placeholderClient(): SupabaseClient {
  if (typeof console !== "undefined") {
    console.warn(
      "[JobFill] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. " +
        "Set both in Vercel (or .env.local) so auth and data work.",
    );
  }
  return createBrowserClient(
    "https://placeholder.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder",
  );
}

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!url || !key) {
    browserClient = placeholderClient();
    return browserClient;
  }

  try {
    browserClient = createBrowserClient(url, key);
  } catch {
    browserClient = placeholderClient();
  }
  return browserClient;
}
