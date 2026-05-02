"use client";

export function Features() {
  const items = [
    {
      title: "Real PDF injection",
      body:
        "We submit your actual resume file. Never parsed, never reconstructed. Competitors corrupt your resume on upload.",
      icon: IconDoc,
    },
    {
      title: "AI cover letters",
      body:
        "Reads the job description. Writes 3 tailored paragraphs in your voice. Generated fresh for every application.",
      icon: IconSparkle,
    },
    {
      title: "Live results",
      body:
        "See every application status in real time. Accepted, rejected, interviewing — all tracked automatically.",
      icon: IconChart,
    },
  ];

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-base)] px-6 py-20 md:px-16">
      <div className="mx-auto max-w-[1100px] text-left">
        <h2
          className="text-[28px] text-[var(--text-1)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Why JobFill works.
        </h2>
        <p
          className="mt-2 max-w-[480px] text-[15px] font-normal leading-relaxed text-[var(--text-2)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Built different from day one.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
          {items.map((f) => (
            <div
              key={f.title}
              className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-left transition-[border-color,box-shadow] duration-200 hover:border-[var(--border-hover)] hover:shadow-[0_0_24px_rgba(0,229,160,0.05)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-dim)]">
                <f.icon />
              </div>
              <h3
                className="mt-4 text-left text-[15px] text-[var(--text-1)]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                {f.title}
              </h3>
              <p
                className="mt-2 text-left text-[13px] font-normal leading-[1.8] text-[var(--text-2)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconDoc() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]" aria-hidden>
      <path
        d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]" aria-hidden>
      <path
        d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 14l.6 2.1L20 17l-2 .9L18 20l-.6-2.1L16 17l2-.9L18 14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]" aria-hidden>
      <path d="M4 19V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15v-4M12 15V9M16 15v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
