"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SwipeJob } from "@/lib/types";

const CARD_W = 3.2;
const CARD_H = 4.4;
const CARD_D = 0.06;
const FLING_MS = 280;
const SNAP_STIFF = 280;
const SNAP_DAMP = 22;
const WHITE = new THREE.Color(1, 1, 1);

export type SwipeSceneHandle = {
  flingLeft: () => void;
  flingRight: () => void;
};

type CssColors = {
  card: string;
  text1: string;
  text2: string;
  text3: string;
  accent: string;
  danger: string;
};

function useCssColors(): CssColors | null {
  const [c, setC] = useState<CssColors | null>(null);
  useLayoutEffect(() => {
    const r = document.documentElement;
    const g = (k: string) => getComputedStyle(r).getPropertyValue(k).trim();
    setC({
      card: g("--bg-card"),
      text1: g("--text-1"),
      text2: g("--text-2"),
      text3: g("--text-3"),
      accent: g("--accent"),
      danger: g("--danger"),
    });
  }, []);
  return c;
}

function makeJobFaceTexture(job: SwipeJob, colors: CssColors): THREE.CanvasTexture {
  const w = 512;
  const h = 704;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }
  ctx.fillStyle = colors.card;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.globalAlpha = 1;

  const company = job.company ?? "";
  const titleRaw = job.title ?? "";
  const salary = job.salary_display ?? "";
  const tags = Array.isArray(job.tags) ? job.tags : [];

  const initials = (company.slice(0, 2) || "·").toUpperCase();
  ctx.font = "700 80px Syne, sans-serif";
  ctx.fillStyle = colors.accent;
  ctx.fillText(initials, 36, 110);

  ctx.font = "500 30px Syne, sans-serif";
  ctx.fillStyle = colors.text1;
  const title = titleRaw.length > 42 ? `${titleRaw.slice(0, 40)}…` : titleRaw;
  ctx.fillText(title, 36, 190);

  ctx.font = "400 22px Inter, sans-serif";
  ctx.fillStyle = colors.text2;
  ctx.fillText(company, 36, 230);

  ctx.font = "500 28px DM Mono, monospace";
  ctx.fillStyle = colors.accent;
  ctx.fillText(salary, 36, 290);

  ctx.font = "400 18px Inter, sans-serif";
  ctx.fillStyle = colors.text3;
  let y = 340;
  for (const t of tags.slice(0, 4)) {
    ctx.fillText(`· ${t}`, 36, y);
    y += 28;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeStampTexture(label: string, stroke: string, fill: string): THREE.CanvasTexture {
  const w = 360;
  const h = 120;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  if (label.startsWith("SKIP")) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate((15 * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
  } else {
    ctx.translate(w / 2, h / 2);
    ctx.rotate((-15 * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
  }
  ctx.font = "700 32px Syne, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.fillStyle = fill;
  ctx.fillText(label, w / 2, h / 2);
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function emptyTexture(): THREE.DataTexture {
  const data = new Uint8Array([0, 0, 0, 1]);
  const t = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

type Fling = { dir: 1 | -1; t0Ms: number } | null;

type DragState = { x: number; y: number; active: boolean };

type InnerProps = {
  jobs: SwipeJob[];
  stackIndex: number;
  drag: React.MutableRefObject<DragState>;
  fling: React.MutableRefObject<Fling>;
  onSwipeLeftRef: React.MutableRefObject<() => void>;
  onSwipeRightRef: React.MutableRefObject<() => void>;
  accentCol: THREE.Color;
  cardSurf: THREE.Color;
  textures: (THREE.CanvasTexture | null)[];
  stampApplyTex: THREE.Texture;
  stampSkipTex: THREE.Texture;
};

function InnerStack({
  jobs,
  stackIndex,
  drag,
  fling,
  onSwipeLeftRef,
  onSwipeRightRef,
  accentCol,
  cardSurf,
  textures,
  stampApplyTex,
  stampSkipTex,
}: InnerProps) {
  const group0 = useRef<THREE.Group>(null);
  const group1 = useRef<THREE.Group>(null);
  const group2 = useRef<THREE.Group>(null);
  const groups = [group0, group1, group2];

  const layout = useRef([
    { x: 0, y: 0, z: 0, s: 1, rx: 0, rz: 0 },
    { x: 0, y: -0.15, z: -0.3, s: 0.95, rx: 0, rz: 0 },
    { x: 0, y: -0.3, z: -0.6, s: 0.9, rx: 0, rz: 0 },
  ]);

  const vel = useRef([
    { x: 0, y: 0, z: 0, s: 0, rz: 0 },
    { x: 0, y: 0, z: 0, s: 0, rz: 0 },
    { x: 0, y: 0, z: 0, s: 0, rz: 0 },
  ]);

  const topMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const applyMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const skipMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const topOpacity = useRef(1);
  const breathT = useRef(0);
  const flingDoneFired = useRef(false);

  useEffect(() => {
    layout.current = [
      { x: 0, y: 0, z: 0, s: 1, rx: 0, rz: 0 },
      { x: 0, y: -0.15, z: -0.3, s: 0.95, rx: 0, rz: 0 },
      { x: 0, y: -0.3, z: -0.6, s: 0.9, rx: 0, rz: 0 },
    ];
    vel.current = [
      { x: 0, y: 0, z: 0, s: 0, rz: 0 },
      { x: 0, y: 0, z: 0, s: 0, rz: 0 },
      { x: 0, y: 0, z: 0, s: 0, rz: 0 },
    ];
    drag.current.x = 0;
    drag.current.y = 0;
    breathT.current = 0;
    flingDoneFired.current = false;
  }, [stackIndex, drag]);

  useFrame((_, dt) => {
    const d = drag.current;
    const f = fling.current;
    const now = performance.now();
    const targets = [
      { x: 0, y: 0, z: 0, s: 1, rz: 0 },
      { x: 0, y: -0.15, z: -0.3, s: 0.95, rz: 0 },
      { x: 0, y: -0.3, z: -0.6, s: 0.9, rz: 0 },
    ];

    let topX = 0;
    let topY = 0;
    let topRz = 0;
    let topRx = 0;

    if (f) {
      const t = Math.min(1, (now - f.t0Ms) / FLING_MS);
      if (t < 0.02) flingDoneFired.current = false;
      const k = easeInCubic(t);
      topX = f.dir * 12 * k;
      topRz = f.dir * -0.4 * k;
      topOpacity.current = 1 - k;
      if (t >= 1 && !flingDoneFired.current) {
        flingDoneFired.current = true;
        fling.current = null;
        topOpacity.current = 1;
        const dir = f.dir;
        queueMicrotask(() => {
          if (dir === 1) onSwipeRightRef.current();
          else onSwipeLeftRef.current();
        });
      }
    } else if (d.active) {
      flingDoneFired.current = false;
      topX = d.x * 0.008;
      topY = d.y * 0.003;
      topRz = -(d.x * 0.008 / (CARD_W / 2)) * (Math.PI / 12);
      topRx = d.y * 0.0003;
      const applyOp = Math.min(Math.max((d.x - 60) / 120, 0), 0.85);
      const skipOp = Math.min(Math.max((-d.x - 60) / 120, 0), 0.85);
      if (applyMatRef.current) applyMatRef.current.opacity = applyOp;
      if (skipMatRef.current) skipMatRef.current.opacity = skipOp;
      topOpacity.current = 1;
    } else {
      flingDoneFired.current = false;
      const k = 1 - Math.exp(-SNAP_DAMP * dt);
      d.x += (0 - d.x) * k * 0.35;
      d.y += (0 - d.y) * k * 0.35;
      topX = d.x * 0.008;
      topY = d.y * 0.003;
      topRz = -(d.x * 0.008 / (CARD_W / 2)) * (Math.PI / 12);
      topRx = d.y * 0.0003;
      const ap = applyMatRef.current;
      const sk = skipMatRef.current;
      if (ap) ap.opacity += (0 - ap.opacity) * k;
      if (sk) sk.opacity += (0 - sk.opacity) * k;
      breathT.current += dt;
      targets[0].s = 1 + Math.sin((breathT.current * Math.PI * 2) / 3) * 0.005;
    }

    for (let i = 1; i < 3; i++) {
      const cur = layout.current[i];
      const tg = targets[i];
      const v = vel.current[i];
      const fx = (tg.x - cur.x) * SNAP_STIFF;
      const fy = (tg.y - cur.y) * SNAP_STIFF;
      const fz = (tg.z - cur.z) * SNAP_STIFF;
      const fsc = (tg.s - cur.s) * SNAP_STIFF;
      v.x = (v.x + fx * dt) * Math.exp(-SNAP_DAMP * dt);
      v.y = (v.y + fy * dt) * Math.exp(-SNAP_DAMP * dt);
      v.z = (v.z + fz * dt) * Math.exp(-SNAP_DAMP * dt);
      v.s = (v.s + fsc * dt) * Math.exp(-SNAP_DAMP * dt);
      cur.x += v.x * dt;
      cur.y += v.y * dt;
      cur.z += v.z * dt;
      cur.s += v.s * dt;
    }

    layout.current[0].x = topX;
    layout.current[0].y = topY;
    layout.current[0].z = 0;
    layout.current[0].rz = topRz;
    layout.current[0].rx = topRx;
    if (f || d.active) {
      layout.current[0].s = 1;
    } else {
      layout.current[0].s = targets[0].s;
    }

    for (let i = 0; i < 3; i++) {
      const g = groups[i].current;
      const L = layout.current[i];
      if (!g) continue;
      const job = jobs[stackIndex + i];
      if (!job) {
        g.visible = false;
        continue;
      }
      g.visible = true;
      g.position.set(L.x, L.y, L.z);
      g.rotation.set(L.rx, 0, L.rz);
      g.scale.setScalar(L.s);
    }

    if (topMatRef.current) {
      topMatRef.current.opacity = topOpacity.current;
      topMatRef.current.transparent = topOpacity.current < 1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight
        position={[3, 6, 4]}
        angle={0.35}
        penumbra={0.5}
        intensity={1.5}
        castShadow
        color={WHITE}
      />
      <pointLight position={[0, 1, 3]} intensity={0.8} color={accentCol} distance={25} decay={2} />
      <directionalLight position={[0, 0, 6]} intensity={0.35} color={WHITE} />

      {[0, 1, 2].map((slot) => {
        const job = jobs[stackIndex + slot];
        const tex = textures[slot];
        return (
          <group key={`${stackIndex}-${slot}-${job?.id ?? "empty"}`} ref={groups[slot]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
              <meshPhysicalMaterial
                ref={slot === 0 ? topMatRef : undefined}
                color={cardSurf}
                roughness={0.1}
                metalness={0.05}
                clearcoat={1}
                clearcoatRoughness={0.1}
                map={tex ?? undefined}
                transparent={slot === 0}
                opacity={1}
              />
            </mesh>
            {slot === 0 && job ? (
              <>
                <mesh position={[0.15, 0.35, CARD_D + 0.02]}>
                  <planeGeometry args={[2.8, 0.95]} />
                  <meshBasicMaterial
                    ref={applyMatRef}
                    map={stampApplyTex}
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
                <mesh position={[-0.15, 0.35, CARD_D + 0.025]}>
                  <planeGeometry args={[2.8, 0.95]} />
                  <meshBasicMaterial
                    ref={skipMatRef}
                    map={stampSkipTex}
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
              </>
            ) : null}
          </group>
        );
      })}
    </>
  );
}

export const SwipeScene = forwardRef<
  SwipeSceneHandle,
  {
    jobs: SwipeJob[];
    stackIndex: number;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
  }
>(function SwipeSceneImpl({ jobs, stackIndex, onSwipeLeft, onSwipeRight }, ref) {
  const css = useCssColors();
  const accentCol = useMemo(() => new THREE.Color(), []);
  const cardSurf = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    if (!css?.accent) return;
    accentCol.setStyle(css.accent);
    cardSurf.setStyle(css.card);
  }, [css, accentCol, cardSurf]);

  const drag = useRef<DragState>({ x: 0, y: 0, active: false });
  const fling = useRef<Fling>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

  const texArr = useMemo(() => {
    if (!css || typeof document === "undefined") return [null, null, null] as (THREE.CanvasTexture | null)[];
    return [0, 1, 2].map((i) => {
      const j = jobs[stackIndex + i];
      return j ? makeJobFaceTexture(j, css) : null;
    });
  }, [jobs, stackIndex, css]);

  const stampApplyTex = useMemo(() => {
    if (!css || typeof document === "undefined") return emptyTexture();
    return makeStampTexture("APPLY ✓", css.accent, css.accent);
  }, [css]);

  const stampSkipTex = useMemo(() => {
    if (!css || typeof document === "undefined") return emptyTexture();
    return makeStampTexture("SKIP ✕", css.danger, css.danger);
  }, [css]);

  useEffect(() => {
    return () => {
      texArr.forEach((t) => t?.dispose());
    };
  }, [texArr]);

  useEffect(() => {
    return () => {
      stampApplyTex.dispose();
      stampSkipTex.dispose();
    };
  }, [stampApplyTex, stampSkipTex]);

  const startFling = useCallback((dir: "left" | "right") => {
    drag.current.active = false;
    fling.current = { dir: dir === "right" ? 1 : -1, t0Ms: performance.now() };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      flingLeft: () => startFling("left"),
      flingRight: () => startFling("right"),
    }),
    [startFling],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (fling.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current.active = true;
    startRef.current = { x: e.clientX, y: e.clientY };
    drag.current.x = 0;
    drag.current.y = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || fling.current) return;
    drag.current.x = e.clientX - startRef.current.x;
    drag.current.y = e.clientY - startRef.current.y;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ok */
    }
    drag.current.active = false;
    const dx = drag.current.x;
    if (Math.abs(dx) > 100) {
      fling.current = { dir: dx > 0 ? 1 : -1, t0Ms: performance.now() };
    }
  };

  if (!css) {
    return (
      <div
        className="mx-auto bg-[var(--bg-surface)]"
        style={{ width: 380, height: 520, borderRadius: "var(--radius-lg)" }}
      />
    );
  }

  return (
    <div
      className="relative mx-auto touch-none"
      style={{ width: 380, height: 520 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas
        shadows
        className="!h-[520px] !w-[380px]"
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 7.2], fov: 38 }}
        dpr={[1, 2]}
      >
        <InnerStack
          jobs={jobs}
          stackIndex={stackIndex}
          drag={drag}
          fling={fling}
          onSwipeLeftRef={onSwipeLeftRef}
          onSwipeRightRef={onSwipeRightRef}
          accentCol={accentCol}
          cardSurf={cardSurf}
          textures={texArr}
          stampApplyTex={stampApplyTex}
          stampSkipTex={stampSkipTex}
        />
      </Canvas>
    </div>
  );
});

SwipeScene.displayName = "SwipeScene";
