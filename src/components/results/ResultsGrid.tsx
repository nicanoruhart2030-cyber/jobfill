"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ApplicationCard } from "@/components/results/ApplicationCard";
import { ParticleBurst } from "@/components/results/ParticleBurst";
import { useToast } from "@/components/ui/Toast";
import type { ApplicationRow, ResultsFilter } from "@/lib/types";

function useCountUp(target: number, durationMs = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    setV(0);
    const t0 = performance.now();
    let id = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / durationMs);
      const e = 1 - Math.pow(1 - t, 3);
      setV(Math.round(target * e));
      if (t < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, durationMs]);
  return v;
}

const TABS: { id: ResultsFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "applied", label: "Applied" },
  { id: "interviewing", label: "Interviewing" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

function filterRows(rows: ApplicationRow[], f: ResultsFilter): ApplicationRow[] {
  if (f === "all") return rows;
  if (f === "applied") {
    return rows.filter((r) =>
      ["queued", "applying", "applied", "needs_review", "needs_manual_review"].includes(r.status),
    );
  }
  if (f === "interviewing") return rows.filter((r) => r.status === "interview" || r.status === "offer");
  if (f === "accepted") return rows.filter((r) => r.status === "accepted");
  if (f === "rejected") return rows.filter((r) => r.status === "rejected");
  return rows;
}

type ResultsGridProps = {
  applications: ApplicationRow[];
};

export function ResultsGrid({ applications }: ResultsGridProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<ResultsFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [burst, setBurst] = useState(false);
  const burstLock = useRef(false);

  const filtered = useMemo(() => filterRows(applications, filter), [applications, filter]);

  const stats = useMemo(() => {
    const total = applications.filter((a) =>
      ["applied", "applying", "queued", "interview", "rejected", "accepted", "offer"].includes(a.status),
    ).length;
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const interviewing = applications.filter((a) => a.status === "interview" || a.status === "offer").length;
    return { total, accepted, rejected, interviewing };
  }, [applications]);

  const cTotal = useCountUp(stats.total);
  const cAccepted = useCountUp(stats.accepted);
  const cRejected = useCountUp(stats.rejected);
  const cInterview = useCountUp(stats.interviewing);

  const onAcceptedInView = useCallback(
    (company: string) => {
      if (burstLock.current) return;
      burstLock.current = true;
      setBurst(true);
      toast(`Application accepted at ${company}`, "success");
      window.setTimeout(() => {
        burstLock.current = false;
      }, 4500);
    },
    [toast],
  );

  if (!applications.length) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-[var(--text-3)]" aria-hidden>
          <path
            d="M16 22h32v28H16V22zm8-8v8M40 14v8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path d="M22 32h20M22 40h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="mt-8 text-[20px] text-[var(--text-1)]" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Nothing here yet.
        </p>
        <p className="mt-2 text-[14px] text-[var(--text-2)]" style={{ fontFamily: "var(--font-body)" }}>
          Go swipe on some jobs.
        </p>
        <Link
          href="/swipe"
          className="mt-6 text-[14px] font-medium text-[var(--text-accent)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Start swiping →
        </Link>
      </div>
    );
  }

  return (
    <>
      <ParticleBurst active={burst} onDone={() => setBurst(false)} />

      <header className="px-4 pb-6 pt-10 md:px-8">
        <h1 className="text-[32px] text-[var(--text-1)]" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
          Results
        </h1>
        <p className="mt-2 text-[15px] text-[var(--text-2)]" style={{ fontFamily: "var(--font-body)" }}>
          Every application, every outcome.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="sent" value={cTotal} tone="accent" />
          <Stat label="accepted" value={cAccepted} tone="accent" />
          <Stat label="rejected" value={cRejected} tone="danger" />
          <Stat label="interviewing" value={cInterview} tone="save" />
        </div>
      </header>

      <div className="border-b-[0.5px] border-[var(--border)] px-4 md:px-8">
        <nav className="-mb-px flex flex-wrap gap-4 md:gap-6" aria-label="Filter applications">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`min-h-[44px] border-b-[2px] pb-3 text-[13px] transition-colors md:text-[14px] ${
                filter === t.id
                  ? "border-[var(--accent)] text-[var(--text-1)]"
                  : "border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 py-8 md:grid-cols-2 md:gap-3 md:px-8">
        {filtered.map((row) => (
          <ApplicationCard
            key={row.id}
            row={row}
            expanded={expanded === row.id}
            onToggle={() => setExpanded((e) => (e === row.id ? null : row.id))}
            onAcceptedInView={row.status === "accepted" ? () => onAcceptedInView(row.jobs?.company ?? "Company") : undefined}
          />
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "accent" | "danger" | "save" }) {
  const color =
    tone === "accent" ? "var(--accent)" : tone === "danger" ? "var(--danger)" : "var(--save)";
  return (
    <div>
      <p className="text-[28px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-mono)", color }}>
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </p>
    </div>
  );
}
