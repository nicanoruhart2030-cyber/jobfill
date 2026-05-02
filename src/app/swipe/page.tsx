'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SwipeDeck } from '@/components/swipe/SwipeDeck';
import { AutofillOverlay } from '@/components/swipe/AutofillOverlay';
import { ProfileDrawer } from '@/components/swipe/ProfileDrawer';
import { seedSwipeJobs } from '@/lib/seedJobs';
import { useToast } from '@/components/ui/Toast';
import { useClerkSupabase } from '@/lib/supabase/clerk-browser';
import type { JobCardData, SwipeJob } from '@/lib/types';

const DAILY_GOAL = 25;

function reviewedKey() {
  return `jobfill-reviewed-${new Date().toDateString()}`;
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 18.5c1.25-3 4-4.5 7-4.5s5.75 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SwipePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const supabase = useClerkSupabase();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<SwipeJob[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    try {
      const n = parseInt(localStorage.getItem(reviewedKey()) ?? '0', 10);
      setReviewedToday(Number.isFinite(n) ? n : 0);
    } catch {
      setReviewedToday(0);
    }
  }, []);

  const bumpReviewed = useCallback(() => {
    try {
      const key = reviewedKey();
      const n = parseInt(localStorage.getItem(key) ?? '0', 10) + 1;
      localStorage.setItem(key, String(n));
      setReviewedToday(n);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void fetch('/api/jobs')
      .then((r) => r.json())
      .then((j: { jobs?: SwipeJob[] }) => {
        if (j.jobs?.length) setJobs(j.jobs);
        else setJobs(seedSwipeJobs());
      })
      .catch(() => setJobs(seedSwipeJobs()));
  }, []);

  useEffect(() => {
    if (!userLoaded || !supabase || !user) return;
    let cancelled = false;
    void (async () => {
      let { data } = await supabase
        .from('profiles')
        .select('skills')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      if (!data) {
        await fetch('/api/profile/ensure', { method: 'POST' });
        ({ data } = await supabase
          .from('profiles')
          .select('skills')
          .eq('clerk_user_id', user.id)
          .maybeSingle());
      }
      if (cancelled) return;
      if (data?.skills && Array.isArray(data.skills)) setProfileSkills(data.skills as string[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [userLoaded, supabase, user]);

  const deckJobs = useMemo(() => jobs as JobCardData[], [jobs]);

  const onSwipeApply = useCallback(
    async (job: JobCardData) => {
      setApplying(true);
      bumpReviewed();
      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: {
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
              salary_display: job.salary_display,
              job_type: job.job_type,
              description: job.description,
              tags: job.tags,
              apply_url: job.apply_url,
            },
          }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          if (res.status === 401) {
            toast('Sign in to queue applications.', 'error');
            return;
          }
          throw new Error(json.error ?? 'Queue failed');
        }
        setQueueCount((n) => n + 1);
        toast(`Queued ${job.title} at ${job.company}`, 'success');
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Could not queue job', 'error');
      } finally {
        setApplying(false);
      }
    },
    [bumpReviewed, toast],
  );

  const onSwipeSkip = useCallback(() => {
    bumpReviewed();
  }, [bumpReviewed]);

  const onSaveLater = useCallback(
    (job: JobCardData) => {
      try {
        const raw = localStorage.getItem('jobfill-saved-jobs');
        const arr: string[] = raw ? JSON.parse(raw) : [];
        if (!arr.includes(job.id)) arr.push(job.id);
        localStorage.setItem('jobfill-saved-jobs', JSON.stringify(arr));
      } catch {
        /* ignore */
      }
      toast('Saved for later', 'success');
      bumpReviewed();
    },
    [bumpReviewed, toast],
  );

  const progressPct = Math.min(100, (reviewedToday / DAILY_GOAL) * 100);

  return (
    <main className="flex min-h-0 flex-col overflow-hidden bg-[var(--bg)]" style={{ height: '100dvh', maxHeight: '100dvh' }}>
      <div className="h-1 w-full shrink-0 bg-[var(--surface-2)]">
        <div className="h-full bg-[var(--accent)] transition-[width] duration-300 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 sm:px-6">
        <Link href="/" className="text-[15px] font-extrabold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
          JobFill
        </Link>
        <div className="flex items-center gap-4">
          <p className="text-[12px] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>
            <span className="text-[var(--text-primary)]">{reviewedToday}</span>
            <span className="text-[var(--text-3)]"> / {DAILY_GOAL} </span>
            today
          </p>
          <button
            type="button"
            aria-label="Open profile"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-[border-color,opacity] hover:border-[var(--border-hover)] hover:opacity-90"
            onClick={() => setDrawerOpen(true)}
          >
            <ProfileIcon />
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[440px] flex-1 flex-col justify-center py-4">
        <SwipeDeck
          jobs={deckJobs}
          profileSkills={profileSkills}
          onSwipeApply={onSwipeApply}
          onSwipeSkip={onSwipeSkip}
          onSaveLater={onSaveLater}
        />
        <div className="mx-auto mt-4 flex items-center justify-center gap-2">
          {queueCount > 0 ? <span className="load-dot" aria-hidden /> : null}
          <span className="text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
            <span className="text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {queueCount}
            </span>{' '}
            queued
          </span>
        </div>
      </div>

      <AutofillOverlay open={applying} />
      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </main>
  );
}
