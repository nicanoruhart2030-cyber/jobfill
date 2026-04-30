import { HTMLAttributes } from 'react';

/**
 * Anti-slop: ONE badge style only, border-only neutral.
 * No colored backgrounds. No rainbow variants.
 *
 * If you need to express semantic meaning (success / error / pending),
 * use a status dot before the label, not a colored bg.
 */
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Optional status dot color — must be a token: --accent, --danger, --save, --text-3 */
  dot?: string;
  /** Use DM Mono for numbers/data */
  mono?: boolean;
  /** Pill shape (only allowed on small badges, never on cards) */
  pill?: boolean;
}

function Badge({
  dot,
  mono = false,
  pill = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'text-[11px] font-normal',
        mono ? 'font-["DM_Mono"]' : 'font-["Inter"]',
        'border-[0.5px] border-[var(--border)]',
        'text-[var(--text-2)] bg-transparent',
        'leading-none whitespace-nowrap',
        'px-2 py-1',
        pill ? 'rounded-full' : 'rounded-[6px]',
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
