import { forwardRef, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  elevated?: boolean;
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = true, elevated = false, noPadding = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          elevated ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-surface)]',
          'border-[0.5px] border-[var(--border)]',
          'rounded-[14px]',
          noPadding ? '' : 'p-5 px-6',
          'transition-[border-color] duration-150',
          hoverable ? 'hover:border-[var(--border-hover)]' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
export type { CardProps };
