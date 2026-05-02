'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerkSupabase } from '@/lib/supabase/clerk-browser';
import { Skeleton } from '@/components/ui/Skeleton';
import { CloseIcon, InboxIcon, LogoMark } from '@/components/ui/Icons';
import type { ApplicationRow, ApplicationStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

type DashboardApplication = {
  id: string;
  status: ApplicationStatus;
  notes: string | null;
  cover_letter_used: string | null;
  screenshot_url: string | null;
  applied_at: string | null;
  created_at: string;
  job: {
    title: string;
    company: string;
    location: string;
    salary_range: string | null;
    job_type: string;
    description: string;
    tags: string[];
  } | null;
};

function salaryRangeFromJob(j: NonNullable<ApplicationRow['jobs']>): string | null {
  if (j.salary_min != null && j.salary_max != null) return `$${j.salary_min}–${j.salary_max}`;
  if (j.salary_min != null) return `$${j.salary_min}+`;
  if (j.salary_max != null) return `Up to $${j.salary_max}`;
  return null;
}

type BoardColumnKey =
  | 'queued'
  | 'applying'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

type Column = {
  key: BoardColumnKey;
  label: string;
  dot: string;
};

const COLUMNS: Column[] = [
  { key: 'queued',    label: 'Queued',    dot: 'var(--text-3)' },
  { key: 'applying',  label: 'Applying',  dot: 'var(--accent)' },
  { key: 'applied',   label: 'Applied',   dot: 'var(--accent)' },
  { key: 'interview', label: 'Interview', dot: 'var(--accent)' },
  { key: 'offer',     label: 'Offer',     dot: 'var(--accent)' },
  { key: 'rejected',  label: 'Rejected',  dot: 'var(--danger)' },
];

const STATUS_TO_COLUMN: Record<ApplicationStatus, BoardColumnKey> = {
  queued: 'queued',
  applying: 'applying',
  needs_manual_review: 'applying',
  needs_review: 'applying',
  applied: 'applied',
  interview: 'interview',
  offer: 'offer',
  accepted: 'offer',
  rejected: 'rejected',
  failed: 'rejected',
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  queued: 'Queued',
  applying: 'Applying',
  applied: 'Applied',
  failed: 'Failed',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offer',
  needs_manual_review: 'Needs review',
  needs_review: 'Needs review',
  accepted: 'Accepted',
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

function initials(company: string) {
  return company.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function statusBadgeStyle(status: ApplicationStatus): {
  background: string;
  borderColor: string;
  color: string;
} {
  switch (status) {
    case 'applied':
    case 'offer':
    case 'accepted':
      return {
        background: 'var(--accent-dim)',
        borderColor: 'var(--border-accent)',
        color: 'var(--accent)',
      };
    case 'interview':
      return {
        background: 'var(--accent-dim)',
        borderColor: 'var(--border-accent)',
        color: 'var(--accent)',
      };
    case 'rejected':
    case 'failed':
      return {
        background: 'var(--danger-dim)',
        borderColor: 'var(--border-danger)',
        color: 'var(--danger)',
      };
    case 'needs_manual_review':
    case 'needs_review':
      return {
        background: 'var(--accent-dim)',
        borderColor: 'var(--border)',
        color: 'var(--accent)',
      };
    default:
      return {
        background: 'transparent',
        borderColor: 'var(--border)',
        color: 'var(--text-3)',
      };
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [rows, setRows]       = useState<DashboardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState<DashboardApplication | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace('/sign-in');
      return;
    }
    void fetch('/api/applications')
      .then(async (r) => {
        if (!r.ok) return { applications: [] as ApplicationRow[] };
        return r.json() as Promise<{ applications?: ApplicationRow[] }>;
      })
      .then((j) => {
        const apps = j.applications ?? [];
        const mapped: DashboardApplication[] = apps.map((row) => {
          const job = row.jobs;
          return {
            id: row.id,
            status: row.status,
            notes: row.error_message,
            cover_letter_used: row.cover_letter,
            screenshot_url: row.screenshot_url,
            applied_at: row.applied_at,
            created_at: row.created_at,
            job: job
              ? {
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  salary_range: salaryRangeFromJob(job),
                  job_type: job.job_type,
                  description: job.description ?? '',
                  tags: job.tags ?? [],
                }
              : null,
          };
        });
        setRows(mapped);
        setLoading(false);
      });
  }, [router, user, isLoaded]);

  const grouped = useMemo(() => {
    const empty: Record<BoardColumnKey, DashboardApplication[]> = {
      queued: [],
      applying: [],
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    };
    for (const row of rows) {
      const key = STATUS_TO_COLUMN[row.status];
      empty[key].push(row);
    }
    return empty;
  }, [rows]);

  const stats = useMemo(() => ({
    applied: rows.filter((r) => r.status === 'applied').length,
    interviewing: rows.filter((r) => r.status === 'interview').length,
    offers: rows.filter((r) => r.status === 'offer').length,
  }), [rows]);

  return (
    <main
      className="page-enter"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '32px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          <div>
            <Link
              href="/swipe"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'Inter',
                fontSize: 12,
                color: 'var(--text-3)',
                marginBottom: 14,
              }}
            >
              <LogoMark size={18} />
              <span>← Back to swiping</span>
            </Link>
            <h1 className="text-h1" style={{ color: 'var(--text-1)' }}>
              Applications
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-2)',
              flexWrap: 'wrap',
            }}
          >
            <Stat value={stats.applied}      label="applied" />
            <Sep />
            <Stat value={stats.interviewing} label="interviewing" />
            <Sep />
            <Stat value={stats.offers}       label={stats.offers === 1 ? 'offer' : 'offers'} />
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <KanbanSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 8,
            }}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.key}
                col={col}
                cards={grouped[col.key] ?? []}
                onSelect={setActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {active && <DetailDrawer app={active} onClose={() => setActive(null)} />}
    </main>
  );
}

/* ─── Subcomponents ─────────────────────────────── */

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontFamily: 'DM Mono', fontSize: 18, color: 'var(--text-1)' }}>
        {value}
      </span>
      <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)' }}>
        {label}
      </span>
    </span>
  );
}

function Sep() {
  return <span style={{ color: 'var(--text-3)' }}>·</span>;
}

function EmptyState() {
  return (
    <div
      style={{
        marginTop: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          color: 'var(--text-3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <InboxIcon size={28} />
      </span>
      <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 16, color: 'var(--text-1)' }}>
        No applications yet.
      </p>
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)' }}>
        Go swipe on some jobs.
      </p>
      <Link
        href="/swipe"
        style={{
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--accent)',
          marginTop: 4,
        }}
      >
        Go to swipe →
      </Link>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          style={{
            flex: '0 0 230px',
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 14,
            padding: '14px 12px',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <Skeleton width={80} height={10} />
          <Skeleton height={56} radius={10} />
          <Skeleton height={56} radius={10} />
        </div>
      ))}
    </div>
  );
}

function KanbanColumn({
  col,
  cards,
  onSelect,
}: {
  col: Column;
  cards: DashboardApplication[];
  onSelect: (app: DashboardApplication) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <div
      style={{
        flex: '0 0 230px',
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 14,
        padding: '14px 12px',
        minHeight: 220,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: col.dot,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 13,
            color: 'var(--text-2)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {col.label}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'DM Mono',
            fontSize: 11,
            color: 'var(--text-3)',
            border: '0.5px solid var(--border)',
            borderRadius: 999,
            padding: '1px 7px',
          }}
        >
          {cards.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cards.map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => onSelect(card)}
            style={{
              textAlign: 'left',
              background: 'var(--bg-elevated)',
              border: '0.5px solid var(--border)',
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'border-color 0.15s',
              width: '100%',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              setHoverId(card.id);
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              setHoverId(null);
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '0.5px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'DM Mono',
                  fontSize: 11,
                  color: 'var(--text-2)',
                  flexShrink: 0,
                }}
              >
                {initials(card.job?.company ?? '·')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-1)',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.job?.title ?? 'Unknown role'}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: 'var(--text-2)',
                    marginTop: 2,
                  }}
                >
                  {card.job?.company ?? 'Unknown company'}
                </p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: 'var(--text-3)',
              }}
            >
              {fmtDate(card.applied_at) ?? fmtDate(card.created_at)}
            </div>
            <span
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                fontFamily: 'Inter',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 999,
                padding: '2px 8px',
                border: '0.5px solid',
                ...statusBadgeStyle(card.status),
              }}
            >
              {STATUS_LABEL[card.status]}
            </span>
            <span
              style={{
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--accent)',
                opacity: hoverId === card.id ? 1 : 0,
                transition: 'opacity 0.15s ease',
                marginTop: 2,
              }}
            >
              View details
            </span>
          </button>
        ))}
        {cards.length === 0 && (
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: 'var(--text-3)',
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            —
          </p>
        )}
      </div>
    </div>
  );
}

function DetailDrawer({ app, onClose }: { app: DashboardApplication; onClose: () => void }) {
  const [shotUrl, setShotUrl] = useState<string | null>(null);
  const supabase = useClerkSupabase();

  useEffect(() => {
    if (!app.screenshot_url) {
      setShotUrl(null);
      return;
    }
    if (!supabase) return;
    setShotUrl(null);
    let cancelled = false;
    void supabase.storage
      .from('application-proofs')
      .createSignedUrl(app.screenshot_url, 3600)
      .then(
        (res: {
          data: { signedUrl: string } | null;
          error: { message: string } | null;
        }) => {
        if (cancelled) return;
        const { data, error } = res;
        if (error || !data?.signedUrl) {
          setShotUrl('');
          return;
        }
        setShotUrl(data.signedUrl);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [app.id, app.screenshot_url, supabase]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="page-enter"
        style={{
          width: 'min(480px, 100%)',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '0.5px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '0.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: 11,
              color: 'var(--text-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {STATUS_LABEL[app.status]}
          </span>
          <button
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: '0.5px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 className="text-h2" style={{ color: 'var(--text-1)' }}>
              {app.job?.title ?? 'Unknown role'}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              {app.job?.company} · {app.job?.location}
            </p>
          </div>

          {app.job && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {app.job.salary_range && (
                <Badge mono>{app.job.salary_range}</Badge>
              )}
              <Badge>{app.job.job_type}</Badge>
              {app.job.tags?.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          )}

          {app.job?.description && (
            <div>
              <DrawerLabel>Description</DrawerLabel>
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: 'var(--text-2)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {app.job.description}
              </p>
            </div>
          )}

          {app.cover_letter_used && (
            <div>
              <DrawerLabel>Cover letter used</DrawerLabel>
              <pre
                style={{
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: 'var(--text-2)',
                  background: 'var(--bg-elevated)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 8,
                  padding: 14,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {app.cover_letter_used}
              </pre>
            </div>
          )}

          {app.screenshot_url && shotUrl && shotUrl.length > 0 && (
            <div>
              <DrawerLabel>Submitted screenshot</DrawerLabel>
              <a
                href={shotUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: 'var(--accent)',
                }}
              >
                Open in new tab →
              </a>
            </div>
          )}

          {app.screenshot_url && shotUrl === '' && (
            <div>
              <DrawerLabel>Submitted screenshot</DrawerLabel>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-3)' }}>
                Could not load a signed link for this file.
              </p>
            </div>
          )}

          <div>
            <DrawerLabel>Timeline</DrawerLabel>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TimelineItem when={fmtDate(app.created_at)} label="Queued" />
              {app.applied_at && <TimelineItem when={fmtDate(app.applied_at)} label="Applied" />}
              {app.notes && <TimelineItem when={null} label={app.notes} />}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--text-3)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      {children}
    </p>
  );
}

function Badge({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      style={{
        fontFamily: mono ? 'DM Mono' : 'Inter',
        fontSize: 11,
        color: 'var(--text-2)',
        background: 'var(--bg-elevated)',
        border: '0.5px solid var(--border)',
        borderRadius: 6,
        padding: '3px 8px',
      }}
    >
      {children}
    </span>
  );
}

function TimelineItem({ when, label }: { when: string | null; label: string }) {
  return (
    <li
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        fontFamily: 'Inter',
        fontSize: 13,
        color: 'var(--text-2)',
      }}
    >
      <span
        style={{
          fontFamily: 'DM Mono',
          fontSize: 11,
          color: 'var(--text-3)',
          minWidth: 56,
          paddingTop: 2,
        }}
      >
        {when ?? '—'}
      </span>
      <span style={{ color: 'var(--text-1)' }}>{label}</span>
    </li>
  );
}
