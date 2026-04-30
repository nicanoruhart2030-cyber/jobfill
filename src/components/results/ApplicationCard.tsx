"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useInView } from "framer-motion";
import * as THREE from "three";
import type { ApplicationRow } from "@/lib/types";

const ACC = new THREE.Color();

function MiniStarMesh() {
  const m = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (v) ACC.setStyle(v);
  }, []);
  useFrame((_, dt) => {
    if (m.current) m.current.rotation.y += dt * 0.45;
  });
  return (
    <mesh ref={m} scale={0.45}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial color={ACC} emissive={ACC} emissiveIntensity={0.45} metalness={0.15} roughness={0.35} />
    </mesh>
  );
}

function MiniCanvas() {
  return (
    <div className="h-[60px] w-[60px]">
      <Canvas camera={{ position: [0, 0, 1.2], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <Suspense fallback={null}>
          <MiniStarMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).slice(0, 2);
  return p.map((s) => s[0]?.toUpperCase() ?? "").join("") || "?";
}

function salaryLine(row: ApplicationRow): string {
  const j = row.jobs;
  if (!j) return "—";
  if (j.salary_min != null && j.salary_max != null) {
    return `$${Math.round(j.salary_min / 1000)}k–${Math.round(j.salary_max / 1000)}k`;
  }
  return "Competitive";
}

type ApplicationCardProps = {
  row: ApplicationRow;
  expanded: boolean;
  onToggle: () => void;
  onAcceptedInView?: () => void;
};

export function ApplicationCard({ row, expanded, onToggle, onAcceptedInView }: ApplicationCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isAccepted = row.status === "accepted";
  const fired = useRef(false);
  const inView = useInView(ref, { amount: 0.35, once: true });

  useEffect(() => {
    if (!isAccepted || !inView || !onAcceptedInView || fired.current) return;
    fired.current = true;
    onAcceptedInView();
  }, [isAccepted, inView, onAcceptedInView]);

  const edge =
    row.status === "accepted"
      ? "var(--accent)"
      : row.status === "rejected"
        ? "var(--danger)"
        : row.status === "interview" || row.status === "offer"
          ? "var(--save)"
          : "var(--border)";

  const badge =
    row.status === "accepted"
      ? {
          label: "Accepted",
          className: "border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)]",
        }
      : row.status === "rejected"
        ? {
            label: "Rejected",
            className: "border-[var(--border-danger)] bg-[var(--danger-dim)] text-[var(--danger)]",
          }
        : row.status === "interview" || row.status === "offer"
          ? {
              label: "Interview scheduled",
              className:
                "border-[oklch(60%_0.14_240_/_30%)] bg-[oklch(60%_0.14_240_/_14%)] text-[oklch(60%_0.14_240)]",
            }
          : {
              label: "Pending response",
              className: "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-3)]",
            };

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      onClick={onToggle}
      className="relative cursor-pointer rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-[var(--border-hover)]"
      style={{ boxShadow: "0 2px 8px color-mix(in oklch, var(--bg-base) 45%, transparent)" }}
    >
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-1" style={{ background: edge }} aria-hidden />
      <div className="p-4 pl-5">
        <div className="flex gap-3 pr-16">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-1)]"
            style={{
              fontFamily: "var(--font-display)",
              border: "0.5px solid var(--border)",
              background: "var(--bg-elevated)",
            }}
          >
            {initials(row.jobs?.company ?? "?")}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] text-[var(--text-1)]" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {row.jobs?.title ?? "Role"}
            </h3>
            <p className="mt-0.5 text-[12px] text-[var(--text-2)]" style={{ fontFamily: "var(--font-body)" }}>
              {row.jobs?.company ?? "—"} · {row.jobs?.location ?? "—"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-medium text-[var(--accent)]" style={{ fontFamily: "var(--font-mono)" }}>
                {salaryLine(row)}
              </span>
              <span
                className="rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-2)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {row.jobs?.job_type ?? "—"}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-mono)" }}>
              {row.applied_at ? `Applied ${new Date(row.applied_at).toLocaleDateString()}` : "Queued"}
            </p>
          </div>
          {isAccepted ? (
            <div className="absolute right-3 top-3">
              <MiniCanvas />
            </div>
          ) : null}
        </div>

        <div className={`mt-4 rounded-[var(--radius-md)] border-[0.5px] px-3 py-2 text-[13px] font-medium ${badge.className}`}>
          {badge.label}
        </div>

        {expanded ? (
          <div className="mt-4 border-t-[0.5px] border-[var(--border)] pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-3)]" style={{ fontFamily: "var(--font-body)" }}>
              Cover letter
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--text-2)]" style={{ fontFamily: "var(--font-body)" }}>
              {row.cover_letter?.trim() || "—"}
            </p>
            {row.screenshot_url ? (
              <p className="mt-3 text-[12px] text-[var(--text-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                Proof: {row.screenshot_url}
              </p>
            ) : null}
            {row.error_message ? (
              <p className="mt-2 text-[12px] text-[var(--danger)]" style={{ fontFamily: "var(--font-body)" }}>
                {row.error_message}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
