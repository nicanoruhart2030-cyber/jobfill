"use client";

import type { ReactNode } from "react";

/** Opacity fade only — 150ms */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter min-h-0">{children}</div>;
}
