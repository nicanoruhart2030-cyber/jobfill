"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Parsing job description…",
  "Filling: Contact details…",
  "Filling: Work experience…",
  "Filling: Education…",
  "Filling: Screening questions…",
  "Attaching resume…",
  "Submitting application…",
];

type AutofillOverlayProps = {
  open: boolean;
};

export function AutofillOverlay({ open }: AutofillOverlayProps) {
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (!open) {
      setPct(0);
      setLine(0);
      return;
    }
    const t0 = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - t0;
      setPct((p) => (p >= 94 ? p : Math.min(94, Math.floor((elapsed / 3800) * 94))));
      setLine(Math.min(STEPS.length - 1, Math.floor(elapsed / 550)));
    }, 120);
    return () => clearInterval(iv);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="autofill-title"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md">
        <p
          id="autofill-title"
          className="mb-6 text-center text-sm text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Autofill in progress
        </p>
        <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%`, background: "var(--accent)" }}
          />
        </div>
        <div className="flex justify-end">
          <span
            className="tabular-nums text-sm font-medium"
            style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
          >
            {pct}%
          </span>
        </div>
        <p
          className="mt-8 text-xs text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}
        >
          {STEPS[line] ?? STEPS[STEPS.length - 1]}
        </p>
      </div>
    </div>
  );
}
