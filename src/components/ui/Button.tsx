'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconOnly?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-[var(--accent)] text-[var(--bg-base)] hover:bg-[var(--accent-hover)] border-0',
  secondary: 'bg-transparent text-[var(--text-2)] border-[0.5px] border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text-1)]',
  danger:    'bg-[var(--danger-dim)] text-[var(--danger)] border-[0.5px] border-[var(--border-danger)] hover:border-[var(--danger)]',
  ghost:     'bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-elevated)] border-0',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-[12px] px-3 py-2 gap-1.5',
  md: 'text-[14px] px-5 py-2.5 gap-2',
  lg: 'text-[14px] px-6 py-3 gap-2',
};

const Spinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden
  >
    <circle
      cx="8" cy="8" r="6.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.25"
    />
    <path
      d="M8 1.5A6.5 6.5 0 0 1 14.5 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center',
          'font-["Inter"] font-medium',
          'rounded-[10px]',
          'transition-all duration-150',
          'select-none',
          'active:scale-[0.97] active:duration-100',
          iconOnly ? 'p-0' : sizeStyles[size],
          variantStyles[variant],
          isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
          className,
        ].join(' ')}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, Variant as ButtonVariant };
