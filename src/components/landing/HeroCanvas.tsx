"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WHITE = new THREE.Color(1, 1, 1);

function FloatingCard({
  position,
  phase,
  surface,
  accent,
}: {
  position: [number, number, number];
  phase: number;
  surface: THREE.Color;
  accent: THREE.Color;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = 0.4 + (phase % 3) * 0.13;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={position} castShadow receiveShadow>
      <boxGeometry args={[2.4, 3.2, 0.04]} />
      <meshStandardMaterial
        color={surface}
        emissive={accent}
        emissiveIntensity={0.12}
        roughness={0.45}
        metalness={0.08}
      />
    </mesh>
  );
}

function Scene({
  surface,
  accent,
}: {
  surface: THREE.Color;
  accent: THREE.Color;
}) {
  const positions: [number, number, number][] = [
    [-3.2, 0.6, -3],
    [3.4, -0.2, -4.5],
    [-1.8, -0.8, -5],
    [2.8, 1.1, -6.5],
    [0.2, -1.3, -2.2],
    [-4.0, 1.0, -7],
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={0.8} color={WHITE} />
      <pointLight position={[0, 0, 2]} intensity={1.2} color={accent} distance={20} decay={2} />
      {positions.map((p, i) => (
        <FloatingCard key={i} position={p} phase={i * 1.7} surface={surface} accent={accent} />
      ))}
    </>
  );
}

export function HeroCanvas() {
  const [colors, setColors] = useState<{
    surface: THREE.Color;
    accent: THREE.Color;
  } | null>(null);

  useLayoutEffect(() => {
    const surface = new THREE.Color();
    const accent = new THREE.Color();
    const root = document.documentElement;
    try {
      const surf = getComputedStyle(root).getPropertyValue("--bg-surface").trim();
      const acc = getComputedStyle(root).getPropertyValue("--accent").trim();
      if (surf) surface.setStyle(surf);
      if (acc) accent.setStyle(acc);
    } catch {
      /* keep defaults */
    }
    setColors({ surface, accent });
  }, []);

  if (!colors) {
    return <div className="pointer-events-none absolute inset-0 z-0" aria-hidden />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.3, 4.2], fov: 42 }}
        dpr={[1, 2]}
      >
        <group rotation={[-0.1, 0.06, 0]}>
          <Scene surface={colors.surface} accent={colors.accent} />
        </group>
      </Canvas>
    </div>
  );
}
