'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

/* ── Base shared styles ─────────────────────────────── */
const base =
  'w-full bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] ' +
  'rounded-[8px] text-[var(--text-1)] placeholder:text-[var(--text-3)] ' +
  'text-[14px] font-["Inter"] outline-none ' +
  'transition-[border-color] duration-150 ' +
  'focus:border-[var(--border-accent)] ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

/* ── Input ──────────────────────────────────────────── */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium text-[var(--text-2)] font-['Inter']"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-[var(--text-3)] flex items-center pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              base,
              'px-[14px] py-[10px]',
              prefix ? 'pl-9' : '',
              suffix ? 'pr-9' : '',
              error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-[var(--text-3)] flex items-center pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-[12px] text-[var(--danger)] font-['Inter']">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-[var(--text-3)] font-['Inter']">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ── Textarea ───────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium text-[var(--text-2)] font-['Inter']"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={[
            base,
            'px-[14px] py-[10px]',
            'resize-none',
            error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[var(--danger)] font-['Inter']">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-[var(--text-3)] font-['Inter']">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/* ── Select ─────────────────────────────────────────── */
interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium text-[var(--text-2)] font-['Inter']"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref as React.ForwardedRef<HTMLSelectElement>}
            id={inputId}
            className={[
              base,
              'px-[14px] py-[10px] pr-9',
              'appearance-none cursor-pointer',
              error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : '',
              className,
            ].join(' ')}
            {...(props as TextareaHTMLAttributes<HTMLSelectElement>)}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[var(--bg-elevated)] text-[var(--text-1)]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        {error && (
          <p className="text-[12px] text-[var(--danger)] font-['Inter']">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Input, Textarea, Select };
export type { InputProps, TextareaProps, SelectProps };
