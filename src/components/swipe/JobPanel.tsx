"use client";

import { motion } from "framer-motion";
import type { SwipeJob } from "@/lib/types";

type JobPanelProps = {
  job: SwipeJob | null;
};

export function JobPanel({ job }: JobPanelProps) {
  return (
    <motion.div
      key={job?.id ?? "none"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full max-w-[380px] px-1"
    >
      {!job ? (
        <p className="text-center text-[14px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
          No more jobs in this batch
        </p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[20px] text-[var(--text-1)]" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {job.company}
            </h2>
            <span
              className="shrink-0 rounded-[var(--radius-pill)] border-[0.5px] border-[var(--border-accent)] px-3 py-1 text-[12px] text-[var(--text-accent)]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              {job.match_score}% match
            </span>
          </div>
          <p className="mt-1 text-[16px] font-medium text-[var(--text-2)]" style={{ fontFamily: "var(--font-body)" }}>
            {job.title}
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
            {job.location} · {job.job_type}
          </p>
          <p
            className="mt-3 text-[18px] font-medium text-[var(--accent)]"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            {job.salary_display}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Array.isArray(job.tags) ? job.tags : []).slice(0, 8).map((t) => (
              <span
                key={t}
                className="rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-2)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
