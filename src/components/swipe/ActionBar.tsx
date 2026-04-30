'use client';

type ActionBarProps = {
  onSkip:   () => void;
  onSave:   () => void;
  onApply:  () => void;
  disabled?: boolean;
};

const SkipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.18 2 7.22 2.618 8 3.5C8.78 2.618 9.82 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ApplyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10L8.5 14.5L16 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type CircleButtonProps = {
  onClick:  () => void;
  size:     number;
  bg:       string;
  border:   string;
  color:    string;
  disabled?: boolean;
  children: React.ReactNode;
  label:    string;
};

function CircleButton({ onClick, size, bg, border, color, disabled, children, label }: CircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        border: `0.5px solid ${border}`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 0.15s ease, opacity 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
      onMouseDown={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.93)';
      }}
      onMouseUp={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
      }}
    >
      {children}
    </button>
  );
}

export function ActionBar({ onSkip, onSave, onApply, disabled = false }: ActionBarProps) {
  return (
    <div className="mt-7 flex items-center justify-center gap-6">
      {/* Skip — 56px, danger */}
      <CircleButton
        onClick={onSkip}
        size={56}
        bg="var(--danger-dim)"
        border="var(--border-danger)"
        color="var(--danger)"
        disabled={disabled}
        label="Skip job"
      >
        <SkipIcon />
      </CircleButton>

      {/* Save — 44px, save */}
      <CircleButton
        onClick={onSave}
        size={44}
        bg="var(--save-dim)"
        border="var(--border-save)"
        color="var(--save)"
        disabled={disabled}
        label="Save for later"
      >
        <SaveIcon />
      </CircleButton>

      {/* Apply — 56px, accent */}
      <CircleButton
        onClick={onApply}
        size={56}
        bg="var(--accent-dim)"
        border="var(--border-accent)"
        color="var(--accent)"
        disabled={disabled}
        label="Apply to job"
      >
        <ApplyIcon />
      </CircleButton>
    </div>
  );
}
