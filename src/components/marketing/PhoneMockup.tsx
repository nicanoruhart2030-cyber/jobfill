/**
 * Pure-CSS iPhone with a job card mid-swipe inside.
 * No images. The card gently rocks ±2deg on a 4s loop.
 */
export function PhoneMockup() {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: 280,
        height: 560,
        margin: '0 auto',
        background: 'var(--bg-surface)',
        borderRadius: 44,
        padding: 9,
        border: '0.5px solid var(--border-hover)',
        boxShadow:
          'inset 0 0 0 1px var(--border), 0 0 0 1px var(--border-hover)',
      }}
    >
      {/* Side rails */}
      <span
        style={{
          position: 'absolute',
          top: 110,
          left: -2,
          width: 3,
          height: 26,
          borderRadius: 2,
          background: 'var(--border-hover)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: 150,
          left: -2,
          width: 3,
          height: 50,
          borderRadius: 2,
          background: 'var(--border-hover)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: 215,
          left: -2,
          width: 3,
          height: 50,
          borderRadius: 2,
          background: 'var(--border-hover)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: 145,
          right: -2,
          width: 3,
          height: 78,
          borderRadius: 2,
          background: 'var(--border-hover)',
        }}
      />

      {/* Screen */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--bg-base)',
          borderRadius: 36,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            height: 26,
            borderRadius: 999,
            background: 'var(--bg-base)',
            zIndex: 5,
          }}
        />

        {/* Status bar */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 22,
            right: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <span
            style={{
              fontFamily: 'DM Mono',
              fontSize: 12,
              color: 'var(--text-1)',
              letterSpacing: '-0.02em',
            }}
          >
            9:41
          </span>
          <span
            style={{
              display: 'inline-flex',
              gap: 4,
              alignItems: 'center',
              color: 'var(--text-1)',
            }}
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <rect x="0" y="6" width="2" height="4" rx="0.5" fill="currentColor" />
              <rect x="3.5" y="4" width="2" height="6" rx="0.5" fill="currentColor" />
              <rect x="7" y="2" width="2" height="8" rx="0.5" fill="currentColor" />
              <rect x="10.5" y="0" width="2" height="10" rx="0.5" fill="currentColor" />
            </svg>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke="currentColor" />
              <rect x="2" y="2" width="9" height="6" rx="1" fill="currentColor" />
              <rect x="14" y="3" width="1.5" height="4" rx="0.5" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 22,
            right: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'Syne',
              fontWeight: 500,
              fontSize: 16,
              color: 'var(--text-1)',
            }}
          >
            JobFill
          </span>
          <span
            style={{
              fontFamily: 'DM Mono',
              fontSize: 11,
              color: 'var(--text-2)',
            }}
          >
            12 left
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 86,
            left: 22,
            right: 22,
            height: 2,
            background: 'var(--bg-elevated)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '40%',
              height: '100%',
              background: 'var(--accent)',
            }}
          />
        </div>

        {/* Background card hint */}
        <div
          style={{
            position: 'absolute',
            top: 122,
            left: 32,
            right: 32,
            height: 320,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 14,
            transform: 'translateY(8px) scale(0.96)',
            opacity: 0.65,
          }}
        />

        {/* Top swiping card */}
        <div
          style={{
            position: 'absolute',
            top: 116,
            left: 22,
            right: 22,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-accent)',
            borderRadius: 14,
            padding: 18,
            transform: 'translateX(36px) rotate(8deg)',
            transformOrigin: 'bottom center',
            animation: 'card-rock 4s ease-in-out infinite',
          }}
        >
          {/* Apply overlay */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'var(--accent-dim)',
              border: '0.5px solid var(--border-accent)',
              fontFamily: 'Inter',
              fontSize: 10,
              fontWeight: 500,
              color: 'var(--accent)',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Apply
          </div>

          {/* Logo + match */}
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--accent)',
                border: '0.5px solid var(--border-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Syne, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--bg-base)',
              }}
            >
              ST
            </div>
            <span
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: 'var(--accent)',
                background: 'transparent',
                border: '0.5px solid var(--border-accent)',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              92%
            </span>
          </div>

          {/* Title + meta */}
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-1)',
              marginTop: 14,
              lineHeight: 1.3,
            }}
          >
            Software Eng Intern
          </p>
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 11,
              color: 'var(--text-2)',
              marginTop: 2,
            }}
          >
            Stripe · Remote
          </p>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'DM Mono',
                fontSize: 10,
                color: 'var(--text-2)',
                background: 'var(--bg-elevated)',
                border: '0.5px solid var(--border)',
                borderRadius: 6,
                padding: '3px 7px',
              }}
            >
              $45–55/hr
            </span>
            <span
              style={{
                fontFamily: 'Inter',
                fontSize: 10,
                color: 'var(--text-2)',
                background: 'var(--bg-elevated)',
                border: '0.5px solid var(--border)',
                borderRadius: 6,
                padding: '3px 7px',
              }}
            >
              Internship
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
            {['React', 'Node', 'Postgres'].map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'Inter',
                  fontSize: 10,
                  color: 'var(--text-2)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 6,
                  padding: '2px 6px',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 4,
            borderRadius: 4,
            background: 'var(--text-1)',
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
}
