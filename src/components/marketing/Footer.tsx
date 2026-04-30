import Link from 'next/link';
import { LogoMark } from '@/components/ui/Icons';

const COLS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing',      href: '/#pricing' },
      { label: 'Dashboard',    href: '/dashboard' },
      { label: 'Changelog',    href: '/#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',   href: '/#' },
      { label: 'Privacy', href: '/#' },
      { label: 'Terms',   href: '/#' },
      { label: 'Contact', href: 'mailto:hello@jobfill.app' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-base)',
        borderTop: '0.5px solid var(--border)',
        padding: '64px 24px 40px',
        color: 'var(--text-3)',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) repeat(2, minmax(0, 1fr))',
          gap: 48,
        }}
        className="footer-grid"
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
          </div>
          <p
            style={{
              marginTop: 12,
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-2)',
              maxWidth: 280,
            }}
          >
            Apply smarter. Get hired faster.
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p
              style={{
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
                marginBottom: 14,
              }}
            >
              {col.title}
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="footer-link"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 13,
                      color: 'var(--text-2)',
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1080,
          margin: '48px auto 0',
          paddingTop: 24,
          borderTop: '0.5px solid var(--border)',
          fontFamily: 'Inter',
          fontSize: 12,
          color: 'var(--text-3)',
        }}
      >
        © 2026 JobFill · Built in Burlington, ON 🇨🇦
      </div>
    </footer>
  );
}
