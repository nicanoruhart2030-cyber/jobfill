"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = new THREE.Color();

function useAccentColor() {
  useLayoutEffect(() => {
    const r = document.documentElement;
    const v = getComputedStyle(r).getPropertyValue("--accent").trim();
    if (v) ACCENT.setStyle(v);
  }, []);
}

type Particle = {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
};

function BurstInner() {
  const group = useRef<THREE.Group>(null);
  const particles = useRef<Particle[]>([]);
  const t0 = useRef(0);
  const inited = useRef(false);

  useLayoutEffect(() => {
    if (!group.current || inited.current) return;
    inited.current = true;
    t0.current = performance.now();
    const g = group.current;
    for (let i = 0; i < 20; i++) {
      const s = 0.08 + Math.random() * 0.07;
      const geo = new THREE.OctahedronGeometry(s, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: ACCENT,
        emissive: ACCENT,
        emissiveIntensity: 0.6,
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
      vel.normalize().multiplyScalar(1.4 + Math.random() * 1.4);
      g.add(mesh);
      particles.current.push({ mesh, vel });
    }
    return () => {
      for (const p of particles.current) {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      }
      particles.current = [];
      inited.current = false;
    };
  }, []);

  useFrame(() => {
    if (!particles.current.length) return;
    const elapsed = performance.now() - t0.current;
    const t = Math.min(1, elapsed / 2500);
    const k = 1 - t;
    for (const p of particles.current) {
      p.mesh.position.addScaledVector(p.vel, 0.018);
      p.mesh.rotation.x += 0.035;
      p.mesh.rotation.y += 0.045;
      p.mesh.scale.setScalar(Math.max(0.01, k));
      (p.mesh.material as THREE.MeshStandardMaterial).opacity = k;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 0, 4]} intensity={1.1} color={ACCENT} />
      <group ref={group} />
    </>
  );
}

/** Full-screen celebration burst; pointer-events none */
export function ParticleBurst({ active, onDone }: { active: boolean; onDone: () => void }) {
  useAccentColor();

  useLayoutEffect(() => {
    if (!active) return;
    const id = window.setTimeout(onDone, 2520);
    return () => window.clearTimeout(id);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center opacity-100 transition-opacity duration-500"
      style={{ background: "color-mix(in oklch, var(--bg-base) 35%, transparent)" }}
    >
      <div className="h-full w-full min-h-[200px] min-w-[200px]">
        <Canvas className="!h-full !w-full" camera={{ position: [0, 0, 4], fov: 50 }} gl={{ alpha: true }}>
          <Suspense fallback={null}>
            <BurstInner />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
