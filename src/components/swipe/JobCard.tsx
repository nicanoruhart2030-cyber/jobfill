'use client';

import type { JobCardData } from '@/lib/types';
import { jdBullets } from '@/lib/jdBullets';

type JobCardProps = {
  job: JobCardData;
  matchPercent: number;
  offsetIndex: number;
  isDragging: boolean;
  dragX: number;
};

function initials(company: string) {
  return company.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const STACK: Array<{ scale: number; y: number; opacity: number }> = [
  { scale: 1, y: 0, opacity: 1 },
  { scale: 0.96, y: 12, opacity: 0.55 },
  { scale: 0.92, y: 24, opacity: 0.35 },
];

export function JobCard({ job, matchPercent, offsetIndex, dragX }: JobCardProps) {
  const absDrag = Math.abs(dragX);
  const applyOpacity = dragX > 20 ? Math.min(1, (absDrag - 20) / 60) : 0;
  const skipOpacity = dragX < -20 ? Math.min(1, (absDrag - 20) / 60) : 0;

  const s = STACK[Math.min(offsetIndex, 2)];
  const isTop = offsetIndex === 0;
  const bullets = jdBullets(job.description, 4);

  return (
    <div
      className="absolute inset-0 select-none"
      style={{
        transform: `scale(${s.scale}) translateY(${s.y}px)`,
        zIndex: 30 - offsetIndex,
        transformOrigin: 'bottom center',
        opacity: s.opacity,
      }}
    >
      <div
        className="h-full w-full overflow-hidden rounded-xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {isTop && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div
              className="absolute left-5 top-5 flex items-center gap-1.5 px-3 py-1.5 opacity-0"
              style={{
                opacity: applyOpacity,
                background: 'var(--accent-dim)',
                border: '1px solid rgba(0,229,160,0.25)',
                borderRadius: 6,
                transition: 'opacity 0.06s linear',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                Autofill
              </span>
            </div>
            <div
              className="absolute right-5 top-5 flex items-center gap-1.5 px-3 py-1.5"
              style={{
                opacity: skipOpacity,
                background: 'var(--destructive-dim)',
                border: '1px solid rgba(255,77,77,0.25)',
                borderRadius: 6,
                transition: 'opacity 0.06s linear',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                <path d="M2 2L9 9M9 2L2 9" stroke="var(--destructive)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ color: 'var(--destructive)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                Skip
              </span>
            </div>
          </div>
        )}

        <div className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
              }}
            >
              {initials(job.company)}
            </div>
            <div
              className="shrink-0 px-2.5 py-1"
              style={{
                border: '1px solid rgba(0,229,160,0.28)',
                borderRadius: 999,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--accent)',
              }}
            >
              Match score: {matchPercent}%
            </div>
          </div>

          <h3
            className="mb-1 text-xl leading-tight tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
          >
            {job.company}
          </h3>
          <p className="mb-3 text-[15px] font-medium text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
            {job.title}
          </p>

          <p
            className="mb-4 text-[13px] text-[var(--text-secondary)]"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}
          >
            {job.location}
            {(job.salary_range || job.salary_display) && (
              <>
                <span className="mx-2 opacity-40">·</span>
                {job.salary_range ?? job.salary_display}
              </>
            )}
          </p>

          <div className="mb-1 h-px w-full shrink-0" style={{ background: 'var(--border)' }} />

          <ul className="mt-4 flex flex-col gap-2.5">
            {bullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-2 text-[13px] leading-snug text-[var(--text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)] opacity-70" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
