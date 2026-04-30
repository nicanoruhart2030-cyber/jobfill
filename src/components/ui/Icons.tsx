import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size?: number) {
  return {
    width: size ?? 16,
    height: size ?? 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function PersonIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function UploadIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function CheckIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 12.5l5 5L19 7" />
    </svg>
  );
}

export function CheckCircleIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

export function CloseIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function StarIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1.1 6L12 17l-5.4 2.7 1.1-6L3.3 9.4l6-.9z" />
    </svg>
  );
}

export function BookmarkIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 4h12v17l-6-4-6 4z" />
    </svg>
  );
}

export function ChevronRightIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ExternalLinkIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5" />
    </svg>
  );
}

export function BriefcaseIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

export function ClockIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ChartBarIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

export function TrashIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M5 7l1 13a2 2 0 002 2h8a2 2 0 002-2l1-13" />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </svg>
  );
}

export function MenuIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CardSwipeIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="3" y="5" width="14" height="14" rx="2" transform="rotate(-6 10 12)" />
      <path d="M19 9l3 3-3 3" />
    </svg>
  );
}

export function InboxIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 13l3-9h12l3 9" />
      <path d="M3 13v6a2 2 0 002 2h14a2 2 0 002-2v-6" />
      <path d="M3 13h5l1.5 3h5l1.5-3h5" />
    </svg>
  );
}

export function SpinnerIcon({ size, ...rest }: IconProps) {
  return (
    <svg
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
      {...rest}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path
        d="M12 3a9 9 0 019 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoogleIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.11z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" fill="#34A853" />
      <path d="M5.84 14.11A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.4c1.62 0 3.07.56 4.21 1.65l3.16-3.16C17.46 2.1 14.97 1 12 1A11 11 0 002.18 7.05l3.66 2.84C6.71 7.33 9.14 5.4 12 5.4z" fill="#EA4335" />
    </svg>
  );
}

export function LogoMark({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" {...rest}>
      <rect x="0.5" y="0.5" width="21" height="21" rx="5" fill="var(--accent-dim)" stroke="var(--border-accent)" strokeWidth="0.75" />
      <path d="M6 7h10M6 11h7M6 15h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
