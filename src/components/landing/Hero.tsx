"use client";

import { FormEvent, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HeroCanvas } from "@/components/landing/HeroCanvas";

const Features = dynamic(() => import("@/components/landing/Features").then((m) => m.Features), {
  ssr: true,
});

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function LandingHero() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(847);

  useEffect(() => {
    void fetch("/api/waitlist")
      .then((r) => r.json())
      .then((j: { count?: number }) => {
        if (typeof j.count === "number") setCount(j.count);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!isValidEmail(email)) {
      setErr("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const j = (await resjson(res)) as { error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      setDone(true);
      setCount((c) => c + 1);
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="relative min-h-[100dvh] overflow-hidden bg-[var(--bg-base)]">
        <HeroCanvas />
        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[560px] flex-col items-center justify-center px-6 pb-32 pt-16 text-center">
          <div className="mb-8 flex items-center justify-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-[3px] bg-[var(--accent)]"
              aria-hidden
            />
            <span
              className="font-[var(--font-display)] text-[18px] font-medium text-[var(--text-1)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              JobFill
            </span>
          </div>

          <h1
            className="text-[var(--text-1)]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(44px, 6vw, 80px)",
              lineHeight: 1.05,
            }}
          >
            Apply to jobs
            <br />
            while you sleep.
          </h1>

          <p
            className="mt-7 max-w-[440px] text-[18px] font-normal leading-[1.7] text-[var(--text-2)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Swipe right to apply. Swipe left to skip. JobFill auto-fills every field and submits — more
            accurate than anything else out there.
          </p>

          {done ? (
            <p
              className="mt-10 text-[15px] text-[var(--text-accent)]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              You&apos;re on the list. We&apos;ll be in touch.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-10 w-full max-w-[440px]">
              <div className="flex w-full max-w-[440px] justify-center">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="h-[52px] w-[280px] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-[18px] text-[15px] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--border-accent)] focus:outline-none"
                  style={{
                    fontFamily: "var(--font-body)",
                    borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
                  }}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="h-[52px] shrink-0 border-0 bg-[var(--accent)] px-[22px] text-[15px] font-medium text-[var(--bg-base)] transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    fontFamily: "var(--font-body)",
                    borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                  }}
                >
                  Get early access →
                </button>
              </div>
              {err && (
                <p className="mt-2 text-left text-[12px] text-[var(--danger)]" style={{ fontFamily: "var(--font-body)" }}>
                  {err}
                </p>
              )}
            </form>
          )}

          <p className="mt-6 text-[12px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
            Join{" "}
            <span className="font-[var(--font-mono)] text-[var(--text-1)]" style={{ fontFamily: "var(--font-mono)" }}>
              {count.toLocaleString()}
            </span>{" "}
            others on the waitlist
          </p>

          <p className="mt-4 text-[12px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
            No credit card · Cancel anytime
          </p>

          <div
            className="scroll-hint-line pointer-events-none absolute bottom-8 left-1/2 h-10 w-[0.5px] -translate-x-1/2 bg-[var(--accent)]"
            aria-hidden
          />
        </div>
      </section>
      <Features />
      <footer
        className="border-t-[0.5px] border-[var(--border)] py-6 text-center text-[12px] text-[var(--text-3)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        © 2026 JobFill · Privacy · Terms
      </footer>
    </>
  );
}

async function resjson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
