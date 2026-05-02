import Link from 'next/link';
import { Nav } from '@/components/marketing/Nav';
import { Footer } from '@/components/marketing/Footer';
import { PhoneMockup } from '@/components/marketing/PhoneMockup';
import { Section, SectionHeading, SectionLabel, SectionSub } from '@/components/marketing/Section';
import { CheckIcon, CloseIcon, PersonIcon, CardSwipeIcon, CheckCircleIcon } from '@/components/ui/Icons';

const SCHOOLS = [
  'University of Waterloo',
  'University of Toronto',
  'UBC',
  'McMaster',
  "Queen's",
];

const PROBLEM_STATS: Array<{ value: string; label: string }> = [
  { value: '47 min', label: 'Average time to complete one application' },
  { value: '250M+',  label: 'Applications submitted in the US each year' },
  { value: '62%',    label: 'Of grads apply to 50+ roles during their search' },
];

const COMPARE_ROWS: Array<{ label: string; jobfill: string; sprout: string }> = [
  { label: 'Resume accuracy',     jobfill: 'Injects original PDF',     sprout: 'Reconstructs and corrupts' },
  { label: 'Field confidence',    jobfill: 'Scores before filling',    sprout: 'Guesses on unknown fields' },
  { label: 'Failed field logic',  jobfill: 'Skips, never wrong-fills', sprout: 'Submits with blank fields' },
  { label: 'CAPTCHA handling',    jobfill: 'Flags for manual review',  sprout: 'Fails silently' },
  { label: 'ATS coverage',        jobfill: 'GH, Lever, Workday, more', sprout: 'Greenhouse only' },
  { label: 'Cover letters',       jobfill: 'AI-tailored per role',     sprout: 'Static template' },
];

const QUOTES: Array<{ body: string; author: string }> = [
  {
    body: 'Sent 40 applications in one night. Got 6 callbacks. My Sprout applications had corrupted resume filenames — JobFill just works.',
    author: 'CS student, University of Waterloo',
  },
  {
    body: 'The cover letters it generates are actually good. Not generic. It reads the job description and writes something specific every time.',
    author: 'Recent grad, looking for PM roles',
  },
  {
    body: "I was applying to 3 jobs a day manually. Now I swipe through 20 in the morning and let it run while I'm in class.",
    author: 'Engineering student, UBC',
  },
];

const FREE_FEATURES = [
  '10 applications per month',
  'Autofill + resume injection',
  'Application tracker',
  '3 AI cover letters/month',
];

const PRO_FEATURES = [
  'Unlimited applications',
  'Priority application queue',
  'Unlimited AI cover letters',
  'CAPTCHA manual review alerts',
  'Application analytics',
  'Early access to new ATS support',
];

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Nav />

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        style={{
          padding: '88px 24px 64px',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
            gap: 64,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          <div>
            <p
              style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--accent)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              Auto-apply that doesn&apos;t corrupt your resume
            </p>
            <h1 className="text-hero text-balance" style={{ color: 'var(--text-1)' }}>
              Apply to 50 jobs<br />while you sleep.
            </h1>
            <p
              style={{
                fontFamily: 'Inter',
                fontSize: 18,
                color: 'var(--text-2)',
                lineHeight: 1.55,
                marginTop: 24,
                maxWidth: 560,
              }}
            >
              Swipe. JobFill auto-fills and submits every application.
              More accurate than Sprout — we inject your real resume, never reconstruct it.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <Link
                href="/sign-up"
                className="btn btn-primary"
                style={{ height: 44, padding: '0 20px', fontSize: 14 }}
              >
                Start applying free →
              </Link>
              <a
                href="#how-it-works"
                className="btn btn-secondary"
                style={{ height: 44, padding: '0 20px', fontSize: 14 }}
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="hero-phone">
            <PhoneMockup />
          </div>
        </div>

        {/* Trust bar */}
        <div
          style={{
            maxWidth: 1080,
            margin: '88px auto 0',
            paddingTop: 32,
            borderTop: '0.5px solid var(--border)',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: 'var(--text-3)',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Used by students at
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px 48px',
              alignItems: 'center',
            }}
          >
            {SCHOOLS.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: 'Syne',
                  fontWeight: 400,
                  fontSize: 15,
                  color: 'var(--text-3)',
                  letterSpacing: '-0.005em',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
            .hero-phone { order: -1; }
          }
        `}</style>
      </section>

      {/* ── PROBLEM ──────────────────────────────────── */}
      <Section>
        <SectionLabel>The problem</SectionLabel>
        <SectionHeading>Job applications are broken.</SectionHeading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
            marginTop: 40,
          }}
          className="stats-grid"
        >
          {PROBLEM_STATS.map((s) => (
            <div key={s.label} className="card" style={{ padding: '28px 24px' }}>
              <p
                style={{
                  fontFamily: 'DM Mono',
                  fontWeight: 500,
                  fontSize: 36,
                  color: 'var(--accent)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--text-3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 12,
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 760px) {
            .stats-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <Section id="how-it-works">
        <SectionLabel>How it works</SectionLabel>
        <SectionHeading>Three steps. Zero wasted hours.</SectionHeading>

        <ol
          style={{
            listStyle: 'none',
            margin: '56px 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <HowStep
            step={1}
            title="Build your profile once"
            description="Upload your resume, fill in your info. Takes 4 minutes. JobFill stores everything encrypted — never shared."
            icon={<PersonIcon size={20} />}
            visual={<ProfileFormMock />}
          />
          <HowStep
            step={2}
            title="Swipe on jobs you want"
            description="We surface jobs matching your skills. Swipe right to queue, left to skip. Like Tinder, but the stakes are higher."
            icon={<CardSwipeIcon size={20} />}
            visual={<SwipeStackMock />}
            reversed
          />
          <HowStep
            step={3}
            title="We apply. You interview."
            description="JobFill opens every ATS, fills every field, uploads your actual resume file, writes a tailored cover letter, and submits. You get notified when it's done."
            icon={<CheckCircleIcon size={20} />}
            visual={<DashboardMock />}
          />
        </ol>
      </Section>

      {/* ── VS SPROUT ────────────────────────────────── */}
      <Section>
        <SectionLabel>The differentiator</SectionLabel>
        <SectionHeading>Why not just use Sprout?</SectionHeading>
        <SectionSub>
          Sprout auto-submits too. Here&apos;s why it mangles your applications.
        </SectionSub>

        <div
          style={{
            marginTop: 40,
            overflow: 'hidden',
          }}
        >
          {/* header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
              padding: '14px 20px',
              background: 'var(--bg-elevated)',
              borderBottom: '0.5px solid var(--border)',
            }}
          >
            <span
              style={{
                fontFamily: 'Syne',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--text-2)',
              }}
            >
              Capability
            </span>
            <span
              style={{
                fontFamily: 'Syne',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--text-1)',
              }}
            >
              JobFill
            </span>
            <span
              style={{
                fontFamily: 'Syne',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--text-3)',
              }}
            >
              Sprout
            </span>
          </div>

          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
                padding: '16px 20px',
                background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-base)',
                borderBottom: i < COMPARE_ROWS.length - 1 ? '0.5px solid var(--border)' : 'none',
                fontFamily: 'Inter',
                fontSize: 13,
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--text-2)' }}>{row.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-1)',
                }}
              >
                <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                  <CheckIcon size={14} />
                </span>
                {row.jobfill}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-3)',
                }}
              >
                <span style={{ color: 'var(--danger)', display: 'inline-flex' }}>
                  <CloseIcon size={14} />
                </span>
                {row.sprout}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SOCIAL PROOF ─────────────────────────────── */}
      <Section>
        <SectionLabel>Testimonials</SectionLabel>
        <SectionHeading>Early access feedback</SectionHeading>
        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
          }}
          className="quotes-grid"
        >
          {QUOTES.map((q) => (
            <div
              key={q.author}
              className="card"
              style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
            >
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: 'var(--text-1)',
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {q.body}
              </p>
              <p
                style={{
                  marginTop: 20,
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: 'var(--text-3)',
                }}
              >
                — {q.author}
              </p>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 900px) {
            .quotes-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Section>

      {/* ── PRICING ──────────────────────────────────── */}
      <Section id="pricing">
        <SectionLabel>Pricing</SectionLabel>
        <SectionHeading>Simple pricing.</SectionHeading>
        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 380px))',
            gap: 16,
            justifyContent: 'center',
          }}
          className="pricing-grid"
        >
          {/* FREE */}
          <div
            className="card"
            style={{
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <p style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: 16, color: 'var(--text-1)' }}>
                Free
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 40, color: 'var(--text-1)', lineHeight: 1 }}>
                  $0
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-3)' }}>
                  forever
                </span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: 'var(--text-2)',
                  }}
                >
                  <span style={{ color: 'var(--text-3)', display: 'inline-flex' }}>
                    <CheckIcon size={14} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="btn btn-secondary"
              style={{ width: '100%', height: 40, fontSize: 13 }}
            >
              Get started
            </Link>
          </div>

          {/* PRO */}
          <div
            style={{
              position: 'relative',
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border-accent)',
              borderRadius: 14,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -12,
                right: 24,
                fontFamily: 'Inter',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--accent)',
                background: 'var(--bg-elevated)',
                border: '0.5px solid var(--border-accent)',
                borderRadius: 999,
                padding: '4px 10px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Most popular
            </span>

            <div>
              <p style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: 16, color: 'var(--accent)' }}>
                Pro
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 40, color: 'var(--text-1)', lineHeight: 1 }}>
                  $19
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 16, color: 'var(--text-2)' }}>
                  /mo
                </span>
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
                or $15/mo billed annually
              </p>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: 'var(--text-2)',
                  }}
                >
                  <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                    <CheckIcon size={14} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up?plan=pro"
              className="btn btn-primary"
              style={{ width: '100%', height: 40, fontSize: 13 }}
            >
              Start free trial
            </Link>
          </div>
        </div>

        <p
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: 12,
            color: 'var(--text-3)',
          }}
        >
          No credit card required for free tier. Cancel Pro anytime.
        </p>

        <style>{`
          @media (max-width: 760px) {
            .pricing-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section
        style={{
          padding: '120px 24px',
          borderTop: '0.5px solid var(--border)',
          background:
            'radial-gradient(circle at center, var(--accent-dim), transparent 65%), var(--bg-surface)',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2 className="text-hero text-balance" style={{ color: 'var(--text-1)' }}>
            Start applying tonight.
          </h2>
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 16,
              color: 'var(--text-2)',
              marginTop: 16,
            }}
          >
            Free forever for 10 applications per month.
          </p>
          <Link
            href="/sign-up"
            className="btn btn-primary"
            style={{
              marginTop: 28,
              padding: '14px 28px',
              fontSize: 14,
            }}
          >
            Create free account →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ── Subcomponents ──────────────────────────────── */

type HowStepProps = {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  reversed?: boolean;
};

function HowStep({ step, title, description, icon, visual, reversed = false }: HowStepProps) {
  return (
    <li
      className="how-step"
      style={{
        display: 'grid',
        gridTemplateColumns: reversed ? '1fr 1fr' : '1fr 1fr',
        gap: 32,
        alignItems: 'center',
      }}
    >
      <div style={{ order: reversed ? 2 : 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'DM Mono',
              fontSize: 11,
              color: 'var(--text-3)',
              letterSpacing: '0.06em',
            }}
          >
            STEP {step.toString().padStart(2, '0')}
          </span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-dim)',
              border: '0.5px solid var(--border-accent)',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </span>
        </div>
        <h3
          className="text-h2"
          style={{ color: 'var(--text-1)', marginBottom: 8, maxWidth: 380 }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: 'var(--text-2)',
            lineHeight: 1.65,
            maxWidth: 460,
          }}
        >
          {description}
        </p>
      </div>
      <div
        style={{
          order: reversed ? 1 : 2,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 14,
          minHeight: 220,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {visual}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .how-step {
            grid-template-columns: 1fr !important;
          }
          .how-step > div { order: unset !important; }
        }
      `}</style>
    </li>
  );
}

function ProfileFormMock() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {[
        { label: 'First name',        value: 'Mira' },
        { label: 'Last name',         value: 'Patel' },
        { label: 'Email',             value: 'mira@uw.ca' },
        { label: 'Work authorization', value: 'Authorized in Canada' },
      ].map((r) => (
        <div
          key={r.label}
          style={{
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 10,
              color: 'var(--text-3)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {r.label}
          </p>
          <p
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'var(--text-1)',
              marginTop: 2,
            }}
          >
            {r.value}
          </p>
        </div>
      ))}
      <div
        style={{
          marginTop: 4,
          background: 'var(--bg-elevated)',
          border: '0.5px dashed var(--border-accent)',
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'Inter',
          fontSize: 12,
          color: 'var(--accent)',
        }}
      >
        <CheckIcon size={14} />
        resume.pdf · 138 KB
      </div>
    </div>
  );
}

function SwipeStackMock() {
  return (
    <div
      style={{
        position: 'relative',
        width: 220,
        height: 220,
      }}
    >
      {[2, 1, 0].map((i) => {
        const top = i === 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg-elevated)',
              border: '0.5px solid var(--border)',
              borderRadius: 14,
              padding: 16,
              transform: top
                ? 'translate(28px, -8px) rotate(8deg)'
                : `translateY(${i * 8}px) scale(${1 - i * 0.04})`,
              opacity: top ? 1 : 0.6,
            }}
          >
            {top && (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'var(--accent-dim)',
                  border: '0.5px solid var(--border-accent)',
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'var(--accent)',
                  letterSpacing: '0.04em',
                }}
              >
                APPLY
              </span>
            )}
            <div style={{ marginTop: 28 }}>
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-1)',
                }}
              >
                Front-end Developer
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-2)' }}>
                Wealthsimple · Toronto
              </p>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  gap: 4,
                  flexWrap: 'wrap',
                }}
              >
                {['React', 'TS'].map((t) => (
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
          </div>
        );
      })}
    </div>
  );
}

function DashboardMock() {
  const cols: Array<{ label: string; count: number; dot: string }> = [
    { label: 'Applying',  count: 4, dot: 'var(--accent)' },
    { label: 'Applied',   count: 12, dot: 'var(--accent)' },
    { label: 'Interview', count: 3, dot: 'var(--save)' },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 380,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
      }}
    >
      {cols.map((c) => (
        <div
          key={c.label}
          style={{
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border)',
            borderRadius: 10,
            padding: 12,
            minHeight: 140,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
            <span
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 10,
                color: 'var(--text-2)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {c.label}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: 'DM Mono',
                fontSize: 10,
                color: 'var(--text-3)',
              }}
            >
              {c.count}
            </span>
          </div>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border)',
                borderRadius: 6,
                padding: 8,
              }}
            >
              <div
                style={{
                  height: 7,
                  width: '70%',
                  background: 'var(--bg-elevated)',
                  borderRadius: 3,
                }}
              />
              <div
                style={{
                  height: 5,
                  width: '50%',
                  background: 'var(--bg-elevated)',
                  borderRadius: 3,
                  marginTop: 5,
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
