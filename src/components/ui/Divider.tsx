import type { CSSProperties } from 'react';

type DividerProps = {
  vertical?: boolean;
  style?: CSSProperties;
  className?: string;
};

export function Divider({ vertical = false, style, className = '' }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={className}
      style={
        vertical
          ? { width: 1, alignSelf: 'stretch', background: 'var(--border)', ...style }
          : { height: 1, width: '100%', background: 'var(--border)', ...style }
      }
    />
  );
}
