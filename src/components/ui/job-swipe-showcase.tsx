"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

export type JobSwipeCard = {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  domain: string;
};

const DEFAULT_JOBS: JobSwipeCard[] = [
  {
    id: "1",
    company: "Stripe",
    role: "Software Engineer, Payments",
    location: "Remote · US",
    salary: "$180k–$240k",
    domain: "stripe.com",
  },
  {
    id: "2",
    company: "Linear",
    role: "Product Engineer",
    location: "Remote · NA",
    salary: "$170k–$210k",
    domain: "linear.app",
  },
  {
    id: "3",
    company: "Notion",
    role: "Full-stack Engineer",
    location: "SF / NY / Remote",
    salary: "$165k–$200k",
    domain: "notion.so",
  },
];

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CardChrome({
  job,
  children,
  footer,
  className,
  style,
  drag,
  onDragEnd,
}: {
  job: JobSwipeCard;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.ComponentProps<typeof motion.div>["style"];
  drag?: boolean | "x" | "y";
  onDragEnd?: (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}) {
  const logoSrc = `https://logo.clearbit.com/${job.domain}`;
  return (
    <motion.div
      className={cn(
        "absolute left-1/2 top-0 w-[92%] max-w-[300px] -translate-x-1/2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_32px_rgba(0,0,0,0.32)]",
        drag && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={style}
      drag={drag}
      {...(drag
        ? { dragConstraints: { left: 0, right: 0 }, dragElastic: 0.9 }
        : {})}
      onDragEnd={drag ? onDragEnd : undefined}
    >
      <div className="flex flex-col p-5 pb-3" style={{ fontFamily: "var(--font-body)" }}>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--accent)]">{job.company}</p>
        <p
          className="mt-2 text-[17px] font-extrabold leading-snug text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {job.role}
        </p>
        <p className="mt-2 text-[12px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>
          {job.location}
        </p>
        <p className="mt-1 text-[13px] text-[var(--text-primary)]" style={{ fontFamily: "var(--font-mono)" }}>
          {job.salary}
        </p>
        <div className="relative mt-5 flex flex-1 items-end justify-center pb-1">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)]">
            <Image src={logoSrc} alt="" width={56} height={56} className="object-contain p-2" unoptimized />
          </div>
        </div>
        {children}
      </div>
      {footer}
    </motion.div>
  );
}

type JobSwipeShowcaseProps = {
  jobs?: JobSwipeCard[];
  className?: string;
};

export function JobSwipeShowcase({ jobs = DEFAULT_JOBS, className }: JobSwipeShowcaseProps) {
  const [order, setOrder] = useState(() => jobs.map((j) => j.id));

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-11, 11]);

  const top = jobs.find((j) => j.id === order[0]) ?? jobs[0];
  const mid = jobs.find((j) => j.id === order[1]);
  const back = jobs.find((j) => j.id === order[2]);

  const cycle = useCallback(() => {
    setOrder((prev) => {
      const [h, ...t] = prev;
      return [...t, h];
    });
  }, []);

  const finishSwipe = useCallback(
    (dir: "left" | "right") => {
      const target = dir === "right" ? 380 : -380;
      void animate(x, target, { type: "spring", stiffness: 400, damping: 32 }).then(() => {
        cycle();
        x.set(0);
      });
    },
    [cycle, x],
  );

  const onDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const ox = info.offset.x;
      if (ox > 88) finishSwipe("right");
      else if (ox < -88) finishSwipe("left");
      else void animate(x, 0, { type: "spring", stiffness: 520, damping: 38 });
    },
    [finishSwipe, x],
  );

  return (
    <div className={cn("relative mx-auto w-full max-w-[320px]", className)}>
      <p
        className="mb-4 text-center text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Drag or tap · same as the real swipe deck
      </p>

      <div className="relative mx-auto h-[402px] w-full">
        {back ? (
          <CardChrome
            job={back}
            className="z-[1] opacity-55"
            style={{ y: 36, scale: 0.88 }}
          />
        ) : null}
        {mid ? (
          <CardChrome job={mid} className="z-[2] opacity-80" style={{ y: 18, scale: 0.94 }} />
        ) : null}

        <CardChrome
          job={top}
          className="z-[3] select-none"
          style={{ x, rotate }}
          drag="x"
          onDragEnd={onDragEnd}
          footer={
            <div className="flex items-stretch justify-between border-t border-[var(--border)]">
              <button
                type="button"
                aria-label="Skip job"
                className="flex h-14 min-h-[44px] flex-1 items-center justify-center gap-2 text-[var(--destructive)] transition-colors hover:bg-[var(--destructive-dim)]"
                onClick={() => finishSwipe("left")}
              >
                <IconX className="opacity-90" />
                <span className="text-[13px] font-semibold">Skip</span>
              </button>
              <div className="w-px bg-[var(--border)]" aria-hidden />
              <button
                type="button"
                aria-label="Queue application"
                className="flex h-14 min-h-[44px] flex-1 items-center justify-center gap-2 text-[var(--accent)] transition-colors hover:bg-[var(--accent-dim)]"
                onClick={() => finishSwipe("right")}
              >
                <span className="text-[13px] font-semibold">Apply</span>
                <IconCheck className="opacity-90" />
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}
