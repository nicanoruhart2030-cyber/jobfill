'use client';

import type { JobCardData } from '@/lib/types';

type JobCardProps = {
  job: JobCardData;
  matchPercent: number;
  offsetIndex: number;   // 0 = top, 1 = mid, 2 = back
  isDragging: boolean;
  dragX: number;
};

function initials(company: string) {
  return company.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

/* Stack transform per layer — perspective scale from spec */
const STACK: Array<{ scale: number; y: number }> = [
  { scale: 1,    y: 0  },
  { scale: 0.96, y: 10 },
  { scale: 0.92, y: 20 },
];

export function JobCard({ job, matchPercent, offsetIndex, dragX }: JobCardProps) {
  const absDrag = Math.abs(dragX);
  /* Spec: overlay opacity scales linearly from 20px → 80px drag */
  const applyOpacity = dragX > 20  ? Math.min(1, (absDrag - 20) / 60) : 0;
  const skipOpacity  = dragX < -20 ? Math.min(1, (absDrag - 20) / 60) : 0;

  const s = STACK[Math.min(offsetIndex, 2)];
  const isTop = offsetIndex === 0;

  return (
    <div
      className="absolute inset-0 select-none"
      style={{
        transform: `scale(${s.scale}) translateY(${s.y}px)`,
        zIndex: 30 - offsetIndex,
        transformOrigin: 'bottom center',
      }}
    >
      <div
        className="h-full w-full overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 14,
        }}
      >
        {/* ── Apply / Skip overlays ── */}
        {isTop && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: 14 }}>
            {/* Apply — right drag */}
            <div
              className="absolute left-5 top-5 flex items-center gap-1.5 px-3 py-1.5"
              style={{
                opacity: applyOpacity,
                background: 'var(--accent-dim)',
                border: '0.5px solid var(--border-accent)',
                borderRadius: 6,
                transition: 'opacity 0.05s linear',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'Inter', fontWeight: 500, letterSpacing: '0.04em' }}>
                Apply
              </span>
            </div>
            {/* Skip — left drag */}
            <div
              className="absolute right-5 top-5 flex items-center gap-1.5 px-3 py-1.5"
              style={{
                opacity: skipOpacity,
                background: 'var(--danger-dim)',
                border: '0.5px solid var(--border-danger)',
                borderRadius: 6,
                transition: 'opacity 0.05s linear',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 2L9 9M9 2L2 9" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ color: 'var(--danger)', fontSize: 12, fontFamily: 'Inter', fontWeight: 500, letterSpacing: '0.04em' }}>
                Skip
              </span>
            </div>
          </div>
        )}

        {/* ── Card body ── */}
        <div className="flex h-full flex-col p-6">

          {/* Row 1: Logo + match badge */}
          <div className="flex items-start justify-between mb-4">
            {/* Company logo circle — single neutral style, no rainbow */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'var(--accent)',
                border: '0.5px solid var(--border-accent)',
                color: 'var(--bg-base)',
                fontFamily: 'Syne, sans-serif',
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              {initials(job.company)}
            </div>

            {/* Match % — DM Mono, accent border pill */}
            <div
              className="shrink-0 px-2.5 py-1"
              style={{
                background: 'transparent',
                border: '0.5px solid var(--border-accent)',
                borderRadius: 999,
                fontFamily: 'DM Mono, monospace',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--accent)',
                letterSpacing: '0.02em',
              }}
            >
              {matchPercent}%
            </div>
          </div>

          {/* Row 2: Job title + Company · Location */}
          <div className="mb-4">
            <p style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500, color: 'var(--text-1)', lineHeight: 1.3 }}>
              {job.title}
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
              {job.company} · {job.location}
            </p>
          </div>

          {/* Row 3: Stat pills — salary | job type */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {job.salary_range || job.salary_display ? (
              <StatPill mono>{job.salary_range ?? job.salary_display}</StatPill>
            ) : null}
            <StatPill>{job.job_type}</StatPill>
          </div>

          {/* Row 4: Skill tags — single neutral border-only style */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'Inter',
                  fontSize: 11,
                  color: 'var(--text-2)',
                  background: 'transparent',
                  border: '0.5px solid var(--border)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  lineHeight: 1.5,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 16, flexShrink: 0 }} />

          {/* Row 5: Description — 4 lines max */}
          <p
            className="line-clamp-4"
            style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: 'var(--text-2)',
              lineHeight: 1.7,
            }}
          >
            {job.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatPill({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      style={{
        fontFamily: mono ? 'DM Mono' : 'Inter',
        fontSize: 12,
        color: 'var(--text-2)',
        background: 'var(--bg-elevated)',
        border: '0.5px solid var(--border)',
        borderRadius: 6,
        padding: '4px 10px',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
