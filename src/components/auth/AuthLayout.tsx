'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoMark } from '@/components/ui/Icons';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Footer text below the form, e.g. "Already have an account? ..." */
  footer: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main
      className="auth-shell"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 0.4fr) minmax(0, 0.6fr)',
      }}
    >
      {/* Left panel */}
      <aside
        className="auth-aside"
        style={{
          background: 'var(--bg-surface)',
          borderRight: '0.5px solid var(--border)',
          padding: '40px 40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={22} />
          <span
            style={{
              fontFamily: 'Syne',
              fontWeight: 500,
              fontSize: 17,
              color: 'var(--text-1)',
            }}
          >
            JobFill
          </span>
        </Link>

        <blockquote
          style={{
            fontFamily: 'Syne',
            fontWeight: 500,
            fontSize: 22,
            lineHeight: 1.4,
            color: 'var(--text-1)',
            maxWidth: 360,
          }}
        >
          “Sent 40 applications in one night. Got 6 callbacks. JobFill just works.”
          <footer
            style={{
              marginTop: 14,
              fontFamily: 'Inter',
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--text-3)',
            }}
          >
            — CS student, University of Waterloo
          </footer>
        </blockquote>

        <div>
          <p style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: 16, color: 'var(--text-1)' }}>
            Apply smarter. Get hired faster.
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
            Join{' '}
            <span style={{ fontFamily: 'DM Mono', color: 'var(--text-1)' }}>1,200</span>{' '}
            students already using JobFill.
          </p>
        </div>
      </aside>

      {/* Right panel */}
      <section
        className="auth-form"
        style={{
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1
            className="text-h1"
            style={{ color: 'var(--text-1)', marginBottom: 6 }}
          >
            {title}
          </h1>
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-2)',
              marginBottom: 28,
            }}
          >
            {subtitle}
          </p>
          {children}
          <div
            style={{
              marginTop: 28,
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-3)',
            }}
          >
            {footer}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .auth-shell { grid-template-columns: 1fr !important; }
          .auth-aside { display: none !important; }
        }
      `}</style>
    </main>
  );
}
