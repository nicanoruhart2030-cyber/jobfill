'use client';

import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { useState } from 'react';

function TermsBody() {
  return (
    <article
      className="max-h-[min(70vh,560px)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[13px] leading-relaxed text-[var(--text-secondary)]"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <h2 className="mb-4 text-[16px] font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
        Terms and conditions
      </h2>
      <p className="mb-3">
        By using JobFill, you agree to these terms. JobFill helps you organize job applications and automate parts of the
        application process. You are responsible for the accuracy of information you submit and for complying with each
        employer&apos;s instructions and applicable laws.
      </p>
      <p className="mb-3">
        Automation may not work on every site. Do not use JobFill to misrepresent your identity, submit false information,
        or bypass security measures including CAPTCHAs where prohibited.
      </p>
      <p className="mb-3">
        The service is provided &quot;as is.&quot; We may modify or discontinue features with reasonable notice where
        practical. For questions, contact support through your workspace admin.
      </p>
      <p className="text-[12px] text-[var(--text-3)]">
        This is a summary for product use. You may replace this page with counsel-reviewed terms before wide launch.
      </p>
    </article>
  );
}

export default function SignUpPage() {
  const [tab, setTab] = useState<'account' | 'terms'>('account');

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-4 py-10 text-[var(--text-primary)]">
      <div className="mx-auto max-w-[920px]">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Link href="/" className="text-[14px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
            JobFill
          </Link>
          <p className="text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div
          className="mb-6 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1"
          role="tablist"
          aria-label="Sign up sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'account'}
            className={`flex-1 rounded-md px-4 py-2.5 text-[13px] font-medium transition-opacity ${
              tab === 'account'
                ? 'bg-[var(--surface-2)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:opacity-90'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
            onClick={() => setTab('account')}
          >
            Create account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'terms'}
            className={`flex-1 rounded-md px-4 py-2.5 text-[13px] font-medium transition-opacity ${
              tab === 'terms'
                ? 'bg-[var(--surface-2)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:opacity-90'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
            onClick={() => setTab('terms')}
          >
            Terms and conditions
          </button>
        </div>

        {tab === 'account' ? (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
              By creating an account you agree to our{' '}
              <button
                type="button"
                className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                onClick={() => setTab('terms')}
              >
                Terms and conditions
              </button>
              . Full text also on{' '}
              <Link href="/terms" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                /terms
              </Link>
              .
            </p>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/swipe"
              appearance={{
                elements: {
                  rootBox: 'mx-auto w-full max-w-[400px]',
                  card: 'bg-[var(--surface)] border border-[var(--border)] shadow-none',
                  headerTitle: 'text-[var(--text-primary)]',
                  headerSubtitle: 'text-[var(--text-secondary)]',
                  socialButtonsBlockButton: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)]',
                  formFieldInput: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]',
                  footerActionLink: 'text-[var(--accent)]',
                  formButtonPrimary: 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90',
                },
              }}
            />
          </div>
        ) : (
          <TermsBody />
        )}
      </div>
    </main>
  );
}
