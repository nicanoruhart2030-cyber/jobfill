"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ResultsGrid } from "@/components/results/ResultsGrid";
import type { ApplicationRow } from "@/lib/types";

export default function ResultsPage() {
  const [rows, setRows] = useState<ApplicationRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    void fetch("/api/applications").then(async (r) => {
        if (r.status === 401) {
          setErr("Unauthorized");
          setRows([]);
          return;
        }
        const j = (await r.json()) as { applications?: ApplicationRow[]; error?: string };
        if (!r.ok) {
          setErr(j.error ?? "Could not load");
          setRows([]);
          return;
        }
        setErr(null);
        setRows(j.applications ?? []);
      })
      .catch(() => {
        setErr("Network error");
        setRows([]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (rows === null) {
    return (
      <main className="min-h-[100dvh] bg-[var(--bg-base)] px-4 py-16">
        <p className="text-center text-[14px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
          Loading…
        </p>
      </main>
    );
  }

  if (err) {
    const unauthorized = err === "Unauthorized";
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg-base)] px-6">
        <p className="text-center text-[15px] text-[var(--text-2)]" style={{ fontFamily: "var(--font-body)" }}>
          {unauthorized ? "Sign in to see your applications." : err}
        </p>
        <Link href="/" className="mt-6 text-[14px] text-[var(--text-accent)]" style={{ fontFamily: "var(--font-body)" }}>
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--bg-base)]">
      <ResultsGrid applications={rows} />
    </main>
  );
}
