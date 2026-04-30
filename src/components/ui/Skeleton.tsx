import type { CSSProperties } from 'react';

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  className?: string;
};

export function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  style,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}
