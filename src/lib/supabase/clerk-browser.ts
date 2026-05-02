'use client';

import { useAuth } from '@clerk/nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/**
 * Supabase browser client that sends the Clerk session JWT (template name: `supabase`).
 * Configure Clerk JWT template + Supabase third-party auth (see Supabase × Clerk docs).
 */
export function useClerkSupabase(): SupabaseClient | null {
  const { isLoaded, userId, getToken } = useAuth();
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
    if (!url || !key) {
      setClient(null);
      return;
    }

    const c = createClient(url, key, {
      global: {
        fetch: async (fetchUrl, options = {}) => {
          const headers = new Headers(options.headers);
          const token = await getToken({ template: 'supabase' }).catch(() => null);
          if (token) headers.set('Authorization', `Bearer ${token}`);
          return fetch(fetchUrl, { ...options, headers });
        },
      },
    });

    setClient(c);
  }, [isLoaded, userId, getToken]);

  return client;
}
