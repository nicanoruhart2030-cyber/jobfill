"use client";

type SwipeActionBarProps = {
  onSkip: () => void;
  onApply: () => void;
  disabled?: boolean;
};

function IconSkip() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M6 6L16 16M16 6L6 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconApply() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M5 11L9.5 15.5L17 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SwipeActionBar({ onSkip, onApply, disabled = false }: SwipeActionBarProps) {
  return (
    <div className="flex items-center justify-center gap-5 px-4" style={{ gap: 20 }}>
      <button
        type="button"
        aria-label="Skip job"
        disabled={disabled}
        onClick={onSkip}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[0.5px] border-[var(--border-danger)] bg-[var(--danger-dim)] text-[var(--danger)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_24px_var(--danger-glow)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconSkip />
      </button>
      <button
        type="button"
        aria-label="Apply to job"
        disabled={disabled}
        onClick={onApply}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[0.5px] border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconApply />
      </button>
    </div>
  );
}
