'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SwipeScene, type SwipeSceneHandle } from '@/components/swipe/SwipeScene';
import { JobPanel } from '@/components/swipe/JobPanel';
import { SwipeActionBar } from '@/components/swipe/SwipeActionBar';
import { ProfileDrawer } from '@/components/swipe/ProfileDrawer';
import { seedSwipeJobs } from '@/lib/seedJobs';
import { useToast } from '@/components/ui/Toast';
import type { SwipeJob } from '@/lib/types';

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
  const { toast } = useToast();
  const [jobs, setJobs] = useState<SwipeJob[]>([]);
  const [stackIndex, setStackIndex] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sceneRef = useRef<SwipeSceneHandle>(null);

  useEffect(() => {
    void fetch('/api/jobs')
      .then((r) => r.json())
      .then((j: { jobs?: SwipeJob[] }) => {
        if (j.jobs?.length) setJobs(j.jobs);
        else setJobs(seedSwipeJobs());
      })
      .catch(() => setJobs(seedSwipeJobs()));
  }, []);

  const remaining = Math.max(0, jobs.length - stackIndex);
  const current = jobs[stackIndex] ?? null;
  const currentRef = useRef(current);
  currentRef.current = current;

  const advanceSkip = useCallback(() => {
    setStackIndex((i) => Math.min(i + 1, jobs.length));
  }, [jobs.length]);

  const onSwipeRight = useCallback(async () => {
    const job = currentRef.current;
    if (!job) return;
    setStackIndex((i) => Math.min(i + 1, jobs.length));
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
    }
  }, [jobs.length, toast]);

  const deckJobs = useMemo(() => jobs, [jobs]);

  return (
    <main
      className="flex flex-col overflow-hidden bg-[var(--bg-base)]"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      <header
        className="flex h-14 shrink-0 items-center justify-between border-b-[0.5px] border-[var(--border)] px-6"
      >
        <Link
          href="/"
          className="text-[16px] font-medium text-[var(--text-1)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          JobFill
        </Link>
        <div className="flex items-center gap-4">
          <p className="text-[13px] text-[var(--text-2)]" style={{ fontFamily: 'var(--font-mono)' }}>
            <span className="text-[var(--text-1)]">{remaining}</span> left
          </p>
          <button
            type="button"
            aria-label="Open profile"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] text-[var(--text-2)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
            onClick={() => setDrawerOpen(true)}
          >
            <ProfileIcon />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 pb-6 pt-4">
        <SwipeScene
          ref={sceneRef}
          jobs={deckJobs}
          stackIndex={stackIndex}
          onSwipeLeft={advanceSkip}
          onSwipeRight={onSwipeRight}
        />
        <JobPanel job={current} />
        <SwipeActionBar
          disabled={!current}
          onSkip={() => sceneRef.current?.flingLeft()}
          onApply={() => sceneRef.current?.flingRight()}
        />
        <div
          className="mx-auto flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-surface)] px-6 py-2.5"
        >
          {queueCount > 0 ? (
            <span className="queue-dot-pulse inline-block h-2 w-2 rounded-[var(--radius-pill)] bg-[var(--accent)]" aria-hidden />
          ) : null}
          <span className="text-[13px] text-[var(--text-2)]" style={{ fontFamily: 'var(--font-body)' }}>
            <span className="text-[var(--text-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {queueCount}
            </span>{' '}
            queued
          </span>
        </div>
      </div>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </main>
  );
}
