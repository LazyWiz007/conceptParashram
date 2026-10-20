"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const NEON = "#38d9ff";
const NEON_DIM = "#1b6f8f";

/** Rounded-octagon outline, the arch profile the reference tunnel is built from. */
function octagon(w: number, h: number, cut: number): [number, number, number][] {
  const x = w / 2;
  const y = h / 2;
  const c = cut;
  return [
    [-x + c, y, 0], [x - c, y, 0],
    [x, y - c, 0], [x, -y + c, 0],
    [x - c, -y, 0], [-x + c, -y, 0],
    [-x, -y + c, 0], [-x, y - c, 0],
    [-x + c, y, 0],
  ];
}

function Arch({ z, scale, opacity }: { z: number; scale: number; opacity: number }) {
  const outer = useMemo(() => octagon(7.4 * scale, 8.6 * scale, 1.5 * scale), [scale]);
  const inner = useMemo(() => octagon(6.6 * scale, 7.8 * scale, 1.3 * scale), [scale]);
  return (
    <group position={[0, 1.9, z]}>
      <Line points={outer} color={NEON} lineWidth={2.4} transparent opacity={opacity} />
      <Line points={inner} color={NEON} lineWidth={1.2} transparent opacity={opacity * 0.55} />
    </group>
  );
}

/** Light strips running along the floor towards the vanishing point. */
function FloorRunners() {
  const lines = useMemo(() => {
    const out: { pts: [number, number, number][]; w: number; o: number }[] = [];
    for (const x of [-4.6, -3.1, 3.1, 4.6]) {
      out.push({
        pts: [
          [x, -2.4, 7],
          [x, -2.4, -22],
        ],
        w: Math.abs(x) > 4 ? 2.2 : 1.3,
        o: Math.abs(x) > 4 ? 0.85 : 0.4,
      });
    }
    return out;
  }, []);

  return (
    <>
      {lines.map((l, i) => (
        <Line key={i} points={l.pts} color={NEON} lineWidth={l.w} transparent opacity={l.o} />
      ))}
    </>
  );
}

/** The dark monoliths flanking the tunnel. */
function Pillars() {
  const slabs = useMemo(() => {
    const out: { p: [number, number, number]; s: [number, number, number] }[] = [];
    let z = 2;
    for (let i = 0; i < 7; i++) {
      const h = 7 + (i % 3) * 2.4;
      const w = 1.1 + (i % 2) * 0.5;
      out.push({ p: [-6.6 - (i % 2) * 0.9, -2.4 + h / 2, z], s: [w, h, 1.2] });
      out.push({ p: [6.6 + (i % 2) * 0.9, -2.4 + h / 2, z], s: [w, h, 1.2] });
      z -= 4.2;
    }
    return out;
  }, []);

  return (
    <>
      {slabs.map((s, i) => (
        <mesh key={i} position={s.p}>
          <boxGeometry args={s.s} />
          <meshStandardMaterial color="#030810" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </>
  );
}

/** The lit ring the figure stands on. */
function Pedestal() {
  return (
    <group position={[0, -2.38, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.62, 1.78, 72]} />
        <meshBasicMaterial color={NEON} transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.1, 1.26, 72]} />
        <meshBasicMaterial color={NEON} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* soft pool of light inside the ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.62, 64]} />
        <meshBasicMaterial color={NEON_DIM} transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

export function Chamber3D() {
  const arches = useMemo(
    () => [
      { z: 1.2, scale: 1.0, opacity: 0.95 },
      { z: -3.4, scale: 0.93, opacity: 0.7 },
      { z: -8.0, scale: 0.86, opacity: 0.5 },
      { z: -12.6, scale: 0.79, opacity: 0.34 },
      { z: -17.2, scale: 0.72, opacity: 0.2 },
    ],
    [],
  );

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, -6]}>
        <planeGeometry args={[60, 70]} />
        <meshStandardMaterial color="#040a12" roughness={0.35} metalness={0.5} />
      </mesh>

      <gridHelper
        args={[64, 48, NEON_DIM, NEON_DIM]}
        position={[0, -2.39, -6]}
      />

      {arches.map((a) => (
        <Arch key={a.z} {...a} />
      ))}

      <FloorRunners />
      <Pillars />
      <Pedestal />
    </group>
  );
}
