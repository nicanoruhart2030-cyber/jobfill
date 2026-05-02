'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogoMark, MenuIcon, CloseIcon } from '@/components/ui/Icons';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing',      label: 'Pricing' },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'color-mix(in oklch, var(--bg-base) 86%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="JobFill"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
        >
          <LogoMark size={22} />
          <span
            style={{
              fontFamily: 'Syne',
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--text-1)',
              letterSpacing: '-0.01em',
            }}
          >
            JobFill
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="nav-desktop"
          style={{ display: 'flex', alignItems: 'center', gap: 28 }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontFamily: 'Inter',
                fontSize: 13,
                color: 'var(--text-2)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/sign-in"
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-2)',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            Start free →
          </Link>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="nav-mobile-trigger"
          style={{
            display: 'none',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '0.5px solid var(--border)',
            color: 'var(--text-1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuIcon size={18} />
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'var(--bg-base)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '0.5px solid var(--border)',
            }}
          >
            <Link
              href="/"
              aria-label="JobFill"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
              onClick={() => setOpen(false)}
            >
              <LogoMark size={22} />
              <span
                style={{
                  fontFamily: 'Syne',
                  fontSize: 17,
                  fontWeight: 500,
                  color: 'var(--text-1)',
                }}
              >
                JobFill
              </span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '0.5px solid var(--border)',
                color: 'var(--text-1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: 'Syne',
                  fontWeight: 500,
                  fontSize: 22,
                  color: 'var(--text-1)',
                  padding: '14px 4px',
                  borderBottom: '0.5px solid var(--border)',
                }}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              style={{
                fontFamily: 'Syne',
                fontWeight: 500,
                fontSize: 22,
                color: 'var(--text-2)',
                padding: '14px 4px',
                borderBottom: '0.5px solid var(--border)',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="btn btn-primary"
              style={{ marginTop: 24, width: '100%', height: 48, fontSize: 14 }}
            >
              Start free →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-trigger { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
