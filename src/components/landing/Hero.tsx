"use client";

import Link from "next/link";
import { JobFillInfiniteGridHero } from "@/components/ui/the-infinite-grid";
import { JobSwipeShowcase } from "@/components/ui/job-swipe-showcase";

function LogoWordmark() {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
      <span className="text-[15px] font-extrabold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
        JobFill
      </span>
    </span>
  );
}

export function LandingHero() {
  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6" aria-label="Primary">
          <Link href="/" className="shrink-0">
            <LogoWordmark />
          </Link>
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-[13px] text-[var(--text-secondary)] transition-opacity hover:opacity-80" style={{ fontFamily: "var(--font-body)" }}>
              How it works
            </a>
            <a href="#pricing" className="text-[13px] text-[var(--text-secondary)] transition-opacity hover:opacity-80" style={{ fontFamily: "var(--font-body)" }}>
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-[13px] text-[var(--text-secondary)] transition-opacity hover:opacity-80 sm:inline"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get started →
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <JobFillInfiniteGridHero className="border-b border-[var(--border)]">
          <section className="mx-auto grid max-w-[1200px] gap-12 px-4 pb-16 pt-24 sm:px-6 md:grid-cols-2 md:gap-16 md:pb-24 md:pt-28">
            <div className="flex flex-col justify-center text-left">
              <h1
                className="text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-[var(--text-primary)]">Apply smarter.</span>
                <br />
                <span className="text-[var(--accent)]">Get hired faster.</span>
              </h1>
              <p
                className="mt-5 max-w-md text-[15px] font-normal leading-relaxed text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Swipe roles with company context up front. JobFill autofill injects your real resume PDF, tailors cover letters to each posting, and queues applications you accept.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Start applying free
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-[border-color,opacity] hover:border-[var(--border-hover)] hover:opacity-90"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  See how it works
                </a>
              </div>
              <p className="mt-8 text-[12px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
                New here?{" "}
                <Link href="/sign-up" className="text-[var(--accent)] underline-offset-4 hover:underline">
                  Create an account
                </Link>{" "}
                — after sign-in you land straight on the swipe deck (Clerk).
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <JobSwipeShowcase />
            </div>
          </section>
        </JobFillInfiniteGridHero>

        <section id="how-it-works" className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-16 sm:px-6 md:py-20">
          <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-3 md:gap-8">
            {[
              { n: "01", t: "Swipe", d: "Review roles with salary upfront. Skip noise in one gesture." },
              { n: "02", t: "Autofill", d: "Playwright fills ATS forms with your real PDF, not a broken parse." },
              { n: "03", t: "Track", d: "Queued, applying, applied — every submission logged in one place." },
            ].map((row) => (
              <div key={row.n} className="text-left">
                <p className="text-2xl font-medium text-[var(--accent)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.n}
                </p>
                <p className="mt-3 text-base font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  {row.t}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
                  {row.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-t border-[var(--border)] px-4 py-16 sm:px-6 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-left text-2xl font-extrabold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              Pricing
            </h2>
            <p className="mt-2 max-w-md text-[14px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
              Start free. Upgrade when you are crushing volume.
            </p>
            <div className="mt-10 grid max-w-[720px] gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-[13px] font-medium text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
                  Free
                </p>
                <p className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  $0
                </p>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
                  10 applications / month
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
                  <li>Swipe queue</li>
                  <li>Autofill + resume upload</li>
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-6 inline-block w-full rounded-lg border border-[var(--border)] py-2.5 text-center text-sm font-medium text-[var(--text-primary)] transition-[border-color] hover:border-[var(--border-hover)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Start free
                </Link>
              </div>
              <div
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
                style={{ borderTop: "3px solid var(--accent)" }}
              >
                <p className="text-[13px] font-medium text-[var(--accent)]" style={{ fontFamily: "var(--font-body)" }}>
                  Pro
                </p>
                <p className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  $29<span className="text-base font-normal text-[var(--text-secondary)]">/mo</span>
                </p>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
                  Unlimited applications
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-body)" }}>
                  <li>Priority queue</li>
                  <li>Results dashboard</li>
                </ul>
                <Link
                  href="/settings"
                  className="mt-6 inline-block w-full rounded-lg bg-[var(--accent)] py-2.5 text-center text-sm font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--border)] px-4 py-8 sm:px-6">
          <p className="mx-auto max-w-[1200px] text-left text-[12px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
            © {new Date().getFullYear()} JobFill ·{" "}
            <Link href="/terms" className="underline-offset-2 hover:underline">
              Terms
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
