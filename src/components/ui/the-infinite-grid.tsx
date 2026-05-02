"use client";

import React from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

const GRID = 40;

/**
 * Full-viewport hero: subtle infinite grid + cursor spotlight.
 * Tuned for JobFill (teal accent, no generic gradient blobs).
 */
export function JobFillInfiniteGridHero({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const { left, top } = el.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.35;
  const speedY = 0.35;

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    const d = delta / 16.67;
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX * d) % GRID);
    gridOffsetY.set((currentY + speedY * d) % GRID);
  });

  const gridPos = useMotionTemplate`${gridOffsetX}px ${gridOffsetY}px`;
  const maskImage = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 72%)`;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex min-h-[min(92dvh,860px)] w-full flex-col overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      {/* Base grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
            backgroundSize: `${GRID}px ${GRID}px`,
            backgroundPosition: gridPos,
          }}
        />
      </div>

      {/* Spotlight grid */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.22]"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          backgroundImage: `
            linear-gradient(to right, rgba(0,229,160,0.45) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,229,160,0.35) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPosition: gridPos,
        }}
      />

      {/* Single soft accent wash — no orange/blue “AI slop” */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(55% 45% at 70% 10%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 62%), radial-gradient(45% 40% at 15% 85%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
    </div>
  );
}

/** Marketing headline + CTAs (JobFill copy) */
export function JobFillInfiniteGridMarketingBlock() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center md:py-20">
      <p
        className="mb-4 text-xs font-medium uppercase tracking-[0.08em] text-primary"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Swipe · autofill · real PDF resume
      </p>
      <h1
        className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-6xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Apply to stacks of roles
        <br />
        <span className="text-primary">without the circus.</span>
      </h1>
      <p
        className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground md:text-xl"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Move your cursor to light up the grid. JobFill keeps ATS forms honest — your file uploads as-is, cover letters match the posting, and you swipe left to skip or right to queue.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/sign-up"
          className="inline-flex h-11 min-h-[44px] items-center rounded-[var(--radius-md)] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Start applying free
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex h-11 min-h-[44px] items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-secondary/30 px-6 text-sm font-medium text-foreground transition-[border-color,background-color] hover:border-[var(--border-hover)] hover:bg-secondary/50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          How it works
        </a>
      </div>
    </div>
  );
}
