'use client';

type ActionBarProps = {
  onSkip: () => void;
  onSave: () => void;
  onApply: () => void;
  disabled?: boolean;
};

const SkipIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
    <path d="M6 6L16 16M16 6L6 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.18 2 7.22 2.618 8 3.5C8.78 2.618 9.82 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AutofillIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M13 2L4 14h7l-1 8 10-12h-7l1-8z"
      fill="currentColor"
    />
  </svg>
);

export function ActionBar({ onSkip, onSave, onApply, disabled = false }: ActionBarProps) {
  const dim = disabled ? 0.4 : 1;

  return (
    <div className="mt-6 flex items-center justify-center gap-5">
      <button
        type="button"
        aria-label="Skip job"
        disabled={disabled}
        onClick={onSkip}
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
        style={{
          background: 'var(--destructive-dim)',
          border: '1px solid rgba(255,77,77,0.35)',
          color: 'var(--destructive)',
          opacity: dim,
        }}
      >
        <SkipIcon />
      </button>

      <button
        type="button"
        aria-label="Autofill and apply"
        disabled={disabled}
        onClick={onApply}
        className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
        style={{
          background: 'var(--accent)',
          border: 'none',
          color: 'var(--bg)',
          opacity: dim,
        }}
      >
        <AutofillIcon />
      </button>

      <button
        type="button"
        aria-label="Save for later"
        disabled={disabled}
        onClick={onSave}
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          opacity: dim,
        }}
      >
        <SaveIcon />
      </button>
    </div>
  );
}
