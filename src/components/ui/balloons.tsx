"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BalloonsHandle = {
  launchAnimation: () => void;
};

export interface BalloonsProps {
  type?: "default" | "text";
  text?: string;
  fontSize?: number;
  /** CSS color e.g. #00e5a0 */
  color?: string;
  className?: string;
  onLaunch?: () => void;
}

/**
 * Wraps `balloons-js` (injected at `document.documentElement`). Call `ref.launchAnimation()` from client code only.
 */
const Balloons = React.forwardRef<BalloonsHandle, BalloonsProps>(
  (
    { type = "default", text, fontSize = 120, color = "#00e5a0", className, onLaunch },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();

    const launchAnimation = React.useCallback(() => {
      if (typeof window === "undefined") return;
      if (reduceMotion) {
        onLaunch?.();
        return;
      }
      void (async () => {
        const { balloons, textBalloons } = await import("balloons-js");
        if (type === "default") await balloons();
        else if (type === "text" && text) {
          textBalloons([{ text, fontSize, color }]);
        }
        onLaunch?.();
      })();
    }, [type, text, fontSize, color, onLaunch, reduceMotion]);

    React.useImperativeHandle(ref, () => ({ launchAnimation }), [launchAnimation]);

    return (
      <div
        className={cn("pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-visible", className)}
        aria-hidden
      />
    );
  },
);
Balloons.displayName = "Balloons";

export { Balloons };
