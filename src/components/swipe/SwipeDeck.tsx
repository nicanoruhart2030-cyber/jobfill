'use client';

import { useMemo, useState, useRef, useCallback } from 'react';
import { JobCard } from '@/components/swipe/JobCard';
import { ActionBar } from '@/components/swipe/ActionBar';
import { calculateMatchPercent } from '@/lib/matchScore';
import type { JobCardData } from '@/lib/types';

const THRESHOLD = 80;   // px to trigger fling
const FLING_X   = 500;  // px off-screen distance

type Direction = 'left' | 'right';

type SwipeDeckProps = {
  jobs: JobCardData[];
  profileSkills: string[];
  onSwipeApply: (job: JobCardData) => Promise<void>;
  onSwipeSkip:  (job: JobCardData) => void;
  onSaveLater:  (job: JobCardData) => void;
};

export function SwipeDeck({ jobs, profileSkills, onSwipeApply, onSwipeSkip, onSaveLater }: SwipeDeckProps) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [dragX, setDragX]               = useState(0);
  const [dragY, setDragY]               = useState(0);
  const [isDragging, setIsDragging]     = useState(false);
  const [isFling, setIsFling]           = useState(false);   // fling animation in progress

  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const activeJob  = jobs[activeIndex];

  const matchByIndex = useMemo(
    () => jobs.map((job) =>
      calculateMatchPercent(profileSkills, `${job.title} ${job.description} ${job.tags.join(' ')}`)
    ),
    [jobs, profileSkills],
  );

  const cardWindow = useMemo(
    () => jobs.slice(activeIndex, Math.min(activeIndex + 3, jobs.length)),
    [activeIndex, jobs],
  );

  /* ── fling: animate out then advance ── */
  const fling = useCallback(async (dir: Direction) => {
    if (isFling || !activeJob) return;
    const currentJob = activeJob;

    setIsFling(true);
    setDragX(dir === 'right' ? FLING_X : -FLING_X);

    // fire callback concurrently — don't block animation
    if (dir === 'right') void onSwipeApply(currentJob);
    else onSwipeSkip(currentJob);

    // wait for fling transition (0.3s) then reset
    await new Promise<void>((r) => setTimeout(r, 320));
    setActiveIndex((i) => i + 1);
    setDragX(0);
    setDragY(0);
    setIsFling(false);
    setIsDragging(false);
    dragStartX.current = null;
    dragStartY.current = null;
  }, [isFling, activeJob, onSwipeApply, onSwipeSkip]);

  /* ── pointer handlers ── */
  const onPointerDown = useCallback((clientX: number, clientY: number) => {
    if (isFling) return;
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    setIsDragging(true);
  }, [isFling]);

  const onPointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || dragStartX.current === null || dragStartY.current === null) return;
    setDragX(clientX - dragStartX.current);
    setDragY(clientY - dragStartY.current);
  }, [isDragging]);

  const onPointerUp = useCallback(async () => {
    if (!isDragging) return;
    setIsDragging(false);
    if      (dragX >  THRESHOLD) await fling('right');
    else if (dragX < -THRESHOLD) await fling('left');
    else {
      // snap back
      setDragX(0);
      setDragY(0);
      dragStartX.current = null;
      dragStartY.current = null;
    }
  }, [isDragging, dragX, fling]);

  /* ── empty state ── */
  if (!activeJob) {
    return (
      <div
        className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-3 py-20 text-center"
        style={{
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 14,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="var(--border-hover)" strokeWidth="1.5"/>
          <path d="M13 20l5 5 9-10" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 500, color: 'var(--text-1)' }}>
          Deck complete
        </p>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)' }}>
          No more jobs in today&apos;s queue.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      {/* ── Card stack ── */}
      <div
        className="relative select-none"
        style={{ height: 500 }}
        onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchMove={(e) => { e.preventDefault(); onPointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={onPointerUp}
      >
        {cardWindow
          .slice()
          .reverse()
          .map((job, reverseIdx) => {
            const offsetIndex = cardWindow.length - reverseIdx - 1;
            const realIndex   = activeIndex + offsetIndex;
            const isTop       = offsetIndex === 0;

            /* Top card: follow drag or fling */
            const cardX      = isTop ? dragX : 0;
            const cardY      = isTop ? dragY * 0.3 : 0;
            const rawRotate  = isTop ? dragX * 0.06 : 0;
            const cardRotate = isTop ? Math.max(-20, Math.min(20, rawRotate)) : 0;

            /* Transition: none while dragging (direct follow), fling on release */
            const transition = isTop
              ? isFling
                ? 'transform 0.3s ease-in, opacity 0.3s ease-in'
                : isDragging
                  ? 'none'
                  : 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)' // snap back
              : 'transform 0.2s ease-out';

            const opacity = isTop && isFling ? 0 : 1;

            return (
              <div
                key={`${realIndex}-${job.company}`}
                className="absolute inset-0"
                style={{
                  transform: `translateX(${cardX}px) translateY(${cardY}px) rotate(${cardRotate}deg)`,
                  transition,
                  opacity,
                  cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default',
                }}
                onMouseDown={isTop ? (e) => { e.preventDefault(); onPointerDown(e.clientX, e.clientY); } : undefined}
                onTouchStart={isTop ? (e) => onPointerDown(e.touches[0].clientX, e.touches[0].clientY) : undefined}
              >
                <JobCard
                  job={job}
                  matchPercent={matchByIndex[realIndex] ?? 0}
                  offsetIndex={offsetIndex}
                  isDragging={isTop && isDragging}
                  dragX={isTop ? dragX : 0}
                />
              </div>
            );
          })}
      </div>

      {/* ── Action bar ── */}
      <ActionBar
        onSkip={() => void fling('left')}
        onSave={() => onSaveLater(activeJob)}
        onApply={() => void fling('right')}
        disabled={isFling}
      />
    </div>
  );
}
