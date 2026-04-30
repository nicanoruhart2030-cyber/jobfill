import type { CSSProperties, ReactNode } from 'react';

type SectionProps = {
  id?: string;
  children: ReactNode;
  style?: CSSProperties;
  innerStyle?: CSSProperties;
};

export function Section({ id, children, style, innerStyle }: SectionProps) {
  return (
    <section
      id={id}
      style={{
        padding: '96px 24px',
        borderTop: '0.5px solid var(--border)',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto', ...innerStyle }}>
        {children}
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--text-3)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-h1 text-balance"
      style={{ color: 'var(--text-1)', maxWidth: 720 }}
    >
      {children}
    </h2>
  );
}

export function SectionSub({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'Inter',
        fontSize: 16,
        color: 'var(--text-2)',
        marginTop: 12,
        maxWidth: 600,
        lineHeight: 1.6,
      }}
    >
      {children}
    </p>
  );
}
