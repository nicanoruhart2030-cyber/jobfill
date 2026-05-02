'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

/** Creates Supabase profile row on first sign-in (admin API). */
export function EnsureProfile() {
  const { isLoaded, isSignedIn } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || ran.current) return;
    ran.current = true;
    void fetch('/api/profile/ensure', { method: 'POST' }).catch(() => {
      ran.current = false;
    });
  }, [isLoaded, isSignedIn]);

  return null;
}
